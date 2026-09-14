import { pool, withTransaction } from "../../config/db.js";
import { env } from "../../config/env.js";
import { EXCHANGE_RATE_MXN_USD, mxnToCents, mxnToUsdCents } from "../../config/money.js";
import { stripe } from "../payments/stripeClient.js";
import {
  findOrderByIdempotencyKey,
  findServiceWithProvider,
  reserveInventorySlot,
  insertOrder,
  insertBooking,
  setOrderStripeSession,
  findBookingsByOrderId,
} from "./orders.repository.js";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Debe coincidir con VALID_PROMO en src/screens/Checkout.jsx. TODO: mover a
// una tabla `promo_codes` cuando haya más de un par de códigos activos.
const VALID_PROMO = { CONCIERGE10: 0.1, CABOS2026: 0.05 };

const HOLD_MINUTES = 15;

class OrderError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

function generateConfirmationCode() {
  return `LC-${Math.floor(100000 + Math.random() * 900000)}`;
}

async function buildStripeSession({ order, bookings, servicesById }) {
  const useUsd = order.currency_display === "USD";
  const lineItems = bookings.map((booking) => {
    const service = servicesById.get(booking.service_id);
    const unitAmount = useUsd
      ? mxnToUsdCents(Number(booking.price_client), Number(order.exchange_rate_mxn_usd))
      : mxnToCents(Number(booking.price_client));
    return {
      quantity: 1,
      price_data: {
        currency: useUsd ? "usd" : "mxn",
        unit_amount: unitAmount,
        product_data: {
          name: `${service.name} — ${booking.day} ${booking.time}`,
        },
      },
    };
  });

  const discountMxn = Number(order.discount_amount);
  if (discountMxn > 0) {
    // Stripe Checkout no soporta descuentos negativos por line item directo;
    // se aplica como un cupón de monto fijo generado al vuelo.
    const coupon = await stripe.coupons.create({
      duration: "once",
      amount_off: useUsd
        ? mxnToUsdCents(discountMxn, Number(order.exchange_rate_mxn_usd))
        : mxnToCents(discountMxn),
      currency: useUsd ? "usd" : "mxn",
    });
    return stripe.checkout.sessions.create({
      mode: "payment",
      line_items: lineItems,
      discounts: [{ coupon: coupon.id }],
      customer_email: order.guest_email,
      success_url: `${env.frontendSuccessUrl}?order=${order.id}`,
      cancel_url: env.frontendCancelUrl,
      metadata: { order_id: order.id },
      expires_at: Math.floor(Date.now() / 1000) + HOLD_MINUTES * 60,
    });
  }

  return stripe.checkout.sessions.create({
    mode: "payment",
    line_items: lineItems,
    customer_email: order.guest_email,
    success_url: `${process["env"]["FRONTEND_SUCCESS_URL"] || "http://localhost:5173/confirmation"}?order=${order.id}`,
    cancel_url: process["env"]["FRONTEND_CANCEL_URL"] || "http://localhost:5173/checkout",
    metadata: { order_id: order.id },
    expires_at: Math.floor(Date.now() / 1000) + HOLD_MINUTES * 60,
  });
}

export async function createOrder({ idempotencyKey, guestInfo, trip, items, currency }) {
  if (!idempotencyKey) throw new OrderError(400, "Falta idempotencyKey");
  if (!items?.length) throw new OrderError(400, "El itinerario está vacío");

  const existingWithSession = await withTransaction(async (client) => {
    const existing = await findOrderByIdempotencyKey(client, idempotencyKey);
    if (existing?.stripe_checkout_session_id) return existing;
    return null;
  });
  if (existingWithSession) {
    return {
      orderId: existingWithSession.id,
      confirmationCode: existingWithSession.confirmation_code,
      checkoutUrl: existingWithSession.checkout_url,
    };
  }

  const promo = guestInfo.promoCode ? VALID_PROMO[guestInfo.promoCode.trim().toUpperCase()] : null;

  const { order, bookings, servicesById } = await withTransaction(async (client) => {
    let existing = await findOrderByIdempotencyKey(client, idempotencyKey);
    if (existing) {
      const bookings = await findBookingsByOrderId(client, existing.id);
      const servicesById = new Map();
      for (const b of bookings) {
        if (!servicesById.has(b.service_id)) {
          servicesById.set(b.service_id, await findServiceWithProvider(client, b.service_id));
        }
      }
      return { order: existing, bookings, servicesById };
    }

    const servicesById = new Map();
    let subtotalMxn = 0;
    const bookingDrafts = [];

    for (const item of items) {
      const service = await findServiceWithProvider(client, item.serviceId);
      if (!service || !service.active || !service.provider_active) {
        throw new OrderError(409, `Servicio no disponible: ${item.serviceId}`);
      }
      servicesById.set(service.id, service);

      const people = Number(item.people) > 0 ? Number(item.people) : 1;
      const lineTotal =
        service.price_unit === "persona" ? Number(service.price_client) * people : Number(service.price_client);
      subtotalMxn += lineTotal;

      let inventorySlotId = null;
      if (service.shared_inventory) {
        inventorySlotId = await reserveInventorySlot(client, {
          serviceId: service.id,
          day: item.day,
          time: item.time,
          capacityTotal: service.shared_inventory_capacity,
        });
        if (!inventorySlotId) {
          throw new OrderError(409, `Sin disponibilidad para ${service.name} el ${item.day} ${item.time}`);
        }
      }

      const commissionPct =
        service.commission_override_pct != null
          ? Number(service.commission_override_pct)
          : Number(service.default_commission_pct);
      const costProvider =
        service.price_unit === "persona" ? Number(service.cost_provider) * people : Number(service.cost_provider);

      bookingDrafts.push({
        serviceId: service.id,
        providerId: service.provider_id,
        inventorySlotId,
        day: item.day,
        time: item.time,
        people,
        isDeposit: service.is_deposit,
        priceClient: lineTotal,
        costProvider,
        commissionPct,
        commissionAmount: Math.round(lineTotal * (commissionPct / 100) * 100) / 100,
        payoutBasis: service.payout_basis,
        cancellationLossPolicy: service.cancellation_loss_policy,
      });
    }

    const discountAmount = promo ? Math.round(subtotalMxn * promo * 100) / 100 : 0;
    const totalMxn = subtotalMxn - discountAmount;

    let order;
    for (let attempt = 0; attempt < 5; attempt += 1) {
      try {
        order = await insertOrder(client, {
          idempotencyKey,
          guestName: guestInfo.name,
          guestEmail: guestInfo.email,
          guestPhone: guestInfo.phone,
          tripStart: trip.start,
          tripEnd: trip.end,
          guestsCount: trip.guests,
          currencyDisplay: currency || "MXN",
          exchangeRateMxnUsd: EXCHANGE_RATE_MXN_USD,
          promoCode: promo ? guestInfo.promoCode.trim().toUpperCase() : null,
          discountAmount,
          subtotalMxn,
          totalMxn,
          confirmationCode: generateConfirmationCode(),
        });
        break;
      } catch (err) {
        if (err.code === "23505" && err.constraint === "orders_confirmation_code_key") continue;
        throw err;
      }
    }

    const holdExpiresAt = new Date(Date.now() + HOLD_MINUTES * 60 * 1000);
    const bookings = [];
    for (const draft of bookingDrafts) {
      bookings.push(
        await insertBooking(client, { ...draft, orderId: order.id, holdExpiresAt })
      );
    }

    return { order, bookings, servicesById };
  });

  const session = await buildStripeSession({ order, bookings, servicesById });

  await withTransaction(async (client) => {
    await setOrderStripeSession(client, order.id, {
      sessionId: session.id,
      checkoutUrl: session.url,
    });
  });

  return {
    orderId: order.id,
    confirmationCode: order.confirmation_code,
    checkoutUrl: session.url,
  };
}

export async function getOrderWithBookings(orderId) {
  if (!UUID_RE.test(orderId)) throw new OrderError(404, "Orden no encontrada");

  const { rows: orderRows } = await pool.query(`select * from orders where id = $1`, [orderId]);
  const order = orderRows[0];
  if (!order) throw new OrderError(404, "Orden no encontrada");

  const { rows: bookings } = await pool.query(
    `select id, service_id, day, time, people, price_client, is_deposit, status
     from bookings where order_id = $1 order by day, time`,
    [orderId]
  );

  return {
    order: {
      id: order.id,
      confirmationCode: order.confirmation_code,
      guestName: order.guest_name,
      guestEmail: order.guest_email,
      currencyDisplay: order.currency_display,
      subtotalMxn: Number(order.subtotal_mxn),
      discountAmount: Number(order.discount_amount),
      totalMxn: Number(order.total_mxn),
      paymentStatus: order.payment_status,
      tripStart: order.trip_start.toISOString().slice(0, 10),
      tripEnd: order.trip_end.toISOString().slice(0, 10),
      guestsCount: order.guests_count,
    },
    bookings: bookings.map((b) => ({
      id: b.id,
      serviceId: b.service_id,
      day: b.day.toISOString().slice(0, 10),
      time: b.time,
      people: b.people,
      priceClient: Number(b.price_client),
      isDeposit: b.is_deposit,
      status: b.status,
    })),
  };
}

export { OrderError };
