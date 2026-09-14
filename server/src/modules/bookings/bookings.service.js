import { pool, withTransaction } from "../../config/db.js";
import { mxnToCents, mxnToUsdCents } from "../../config/money.js";
import { computeConfirmationDeadline } from "../../lib/sla.js";
import { stripe } from "../payments/stripeClient.js";
import {
  findBookingsByOrderId,
  findOrderById,
  findPaymentByOrderId,
  findServiceWithProvider,
  logBookingEvent,
  releaseInventorySlot,
  setOrderPaymentStatus,
  transitionBooking,
} from "../orders/orders.repository.js";
import { findBookingById } from "./bookings.repository.js";

class BookingError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Se llama dentro de la transacción que ya marcó la orden como pagada.
export async function markOrderBookingsAsPaidAndRoute(client, orderId, actor) {
  const bookings = await findBookingsByOrderId(client, orderId);
  for (const booking of bookings) {
    if (booking.status !== "pendiente_pago") continue;

    const paid = await transitionBooking(client, booking.id, "pendiente_pago", "pagado");
    if (!paid) continue;
    await logBookingEvent(client, {
      bookingId: booking.id,
      fromStatus: "pendiente_pago",
      toStatus: "pagado",
      actor,
    });

    const service = await findServiceWithProvider(client, booking.service_id);
    if (service.confirmation_type === "auto_cupos") {
      // El cupo ya se reservó de forma atómica antes del pago (inventory_slots),
      // así que no hace falta esperar confirmación externa.
      const confirmed = await transitionBooking(client, booking.id, "pagado", "confirmado", {
        confirmed_at: new Date(),
      });
      if (confirmed) {
        await logBookingEvent(client, {
          bookingId: booking.id,
          fromStatus: "pagado",
          toStatus: "confirmado",
          actor: "system",
          note: "auto_cupos: inventario pre-negociado",
        });
      }
      continue;
    }

    // auto_api (pendiente de integrar la API del proveedor) y manual
    // (equipo de operaciones contacta por WhatsApp) ambos esperan
    // confirmación externa antes de pasar a 'confirmado'.
    const deadline = computeConfirmationDeadline(booking.day, booking.time);
    const pending = await transitionBooking(client, booking.id, "pagado", "pendiente_confirmacion_proveedor", {
      confirmation_deadline: deadline.toISOString(),
    });
    if (pending) {
      await logBookingEvent(client, {
        bookingId: booking.id,
        fromStatus: "pagado",
        toStatus: "pendiente_confirmacion_proveedor",
        actor: "system",
        note: `confirmation_type=${service.confirmation_type}, deadline=${deadline.toISOString()}`,
      });
    }
  }
}

// Se llama cuando la sesión de checkout expira sin pago.
export async function cancelUnpaidOrderBookings(client, orderId, actor) {
  const bookings = await findBookingsByOrderId(client, orderId);
  for (const booking of bookings) {
    if (booking.status !== "pendiente_pago") continue;

    const cancelled = await transitionBooking(client, booking.id, "pendiente_pago", "cancelado", {
      cancelled_at: new Date(),
    });
    if (!cancelled) continue;

    await releaseInventorySlot(client, booking.inventory_slot_id);
    await logBookingEvent(client, {
      bookingId: booking.id,
      fromStatus: "pendiente_pago",
      toStatus: "cancelado",
      actor,
      note: "checkout expirado sin pago",
    });
  }
}

// El equipo de operaciones confirma manualmente con el proveedor (WhatsApp, etc).
export async function confirmBooking(bookingId, actor) {
  return withTransaction(async (client) => {
    const booking = await findBookingById(client, bookingId);
    if (!booking) throw new BookingError(404, "Booking no encontrado");

    const updated = await transitionBooking(
      client,
      bookingId,
      "pendiente_confirmacion_proveedor",
      "confirmado",
      { confirmed_at: new Date() }
    );
    if (!updated) {
      throw new BookingError(409, `No se puede confirmar desde el estado actual (${booking.status})`);
    }
    await logBookingEvent(client, {
      bookingId,
      fromStatus: "pendiente_confirmacion_proveedor",
      toStatus: "confirmado",
      actor,
    });
    return updated;
  });
}

// El proveedor no puede cumplir esa línea: se rechaza y se reembolsa solo esa
// parte del pago (rechazo parcial, no de toda la orden). El paso de marcar
// 'rechazado' y el reembolso en Stripe se hacen en pasos separados (con
// idempotencyKey en la llamada a Stripe) para poder reintentar con seguridad
// si el reembolso falla después de que el estado ya cambió en la DB.
export async function rejectBooking(bookingId, { actor, reason }) {
  const { alreadyRefunded, booking } = await withTransaction(async (client) => {
    const current = await findBookingById(client, bookingId);
    if (!current) throw new BookingError(404, "Booking no encontrado");

    if (current.status === "rechazado" && current.refund_status === "total") {
      return { alreadyRefunded: true, booking: current };
    }
    if (current.status !== "rechazado") {
      const updated = await transitionBooking(
        client,
        bookingId,
        "pendiente_confirmacion_proveedor",
        "rechazado",
        { rejected_reason: reason || null }
      );
      if (!updated) {
        throw new BookingError(409, `No se puede rechazar desde el estado actual (${current.status})`);
      }
      await logBookingEvent(client, {
        bookingId,
        fromStatus: "pendiente_confirmacion_proveedor",
        toStatus: "rechazado",
        actor,
        note: reason,
      });
      return { alreadyRefunded: false, booking: updated };
    }
    // Ya estaba 'rechazado' pero el reembolso no se completó antes: reintentar solo esa parte.
    return { alreadyRefunded: false, booking: current };
  });

  if (alreadyRefunded) {
    return { booking, refundId: null, note: "ya estaba reembolsado" };
  }

  const order = await findOrderById(pool, booking.order_id);
  const payment = await findPaymentByOrderId(pool, booking.order_id);
  if (!order || !payment) {
    throw new BookingError(500, "No se encontró el pago de la orden para reembolsar");
  }

  const useUsd = order.currency_display === "USD";
  const refundAmountCents = useUsd
    ? mxnToUsdCents(Number(booking.price_client), Number(order.exchange_rate_mxn_usd))
    : mxnToCents(Number(booking.price_client));

  const refund = await stripe.refunds.create(
    {
      payment_intent: payment.gateway_transaction_id,
      amount: refundAmountCents,
      reason: "requested_by_customer",
    },
    { idempotencyKey: `refund-booking-${bookingId}` }
  );

  return withTransaction(async (client) => {
    await client.query(
      `update bookings set refund_amount = $2, refund_status = 'total', updated_at = now() where id = $1`,
      [bookingId, booking.price_client]
    );
    await logBookingEvent(client, {
      bookingId,
      fromStatus: "rechazado",
      toStatus: "rechazado",
      actor: "system",
      note: `reembolso Stripe ${refund.id} (${refundAmountCents} centavos ${useUsd ? "USD" : "MXN"})`,
    });
    // Guardado: si ya estaba 'parcialmente_reembolsado' por otro booking de la
    // misma orden, este update no hace nada (no pisa un estado más avanzado).
    await setOrderPaymentStatus(client, order.id, "parcialmente_reembolsado", "pagado");

    return {
      booking: { ...booking, status: "rechazado", refund_amount: booking.price_client, refund_status: "total" },
      refundId: refund.id,
    };
  });
}

export { BookingError };
