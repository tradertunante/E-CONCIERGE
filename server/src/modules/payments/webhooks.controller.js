import { Router } from "express";
import { withTransaction } from "../../config/db.js";
import { env } from "../../config/env.js";
import { markOrderBookingsAsPaidAndRoute, cancelUnpaidOrderBookings } from "../bookings/bookings.service.js";
import { findOrderById, setOrderPaymentStatus } from "../orders/orders.repository.js";
import { stripe } from "./stripeClient.js";

export const stripeWebhookRouter = Router();

async function recordWebhookEventOnce(client, { gateway, eventId, eventType, payload }) {
  const { rows } = await client.query(
    `insert into webhook_events (gateway, event_id, event_type, payload)
     values ($1,$2,$3,$4)
     on conflict (gateway, event_id) do nothing
     returning id`,
    [gateway, eventId, eventType, payload]
  );
  return rows.length > 0;
}

async function handleCheckoutCompleted(client, session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) return;

  const order = await findOrderById(client, orderId);
  if (!order) return;

  const updated = await setOrderPaymentStatus(client, orderId, "pagado", "pendiente");
  if (!updated) return; // ya estaba pagada (reintento de webhook) o en otro estado

  await client.query(
    `insert into payments (order_id, gateway, gateway_transaction_id, gateway_payment_method, amount_mxn, status, raw_event)
     values ($1,'stripe',$2,$3,$4,'succeeded',$5)
     on conflict (gateway, gateway_transaction_id) do nothing`,
    [
      orderId,
      session.payment_intent,
      session.payment_method_types?.[0] || null,
      order.total_mxn,
      session,
    ]
  );

  await markOrderBookingsAsPaidAndRoute(client, orderId, "webhook:stripe");
}

async function handleCheckoutExpired(client, session) {
  const orderId = session.metadata?.order_id;
  if (!orderId) return;

  const updated = await setOrderPaymentStatus(client, orderId, "fallido", "pendiente");
  if (!updated) return; // ya se pagó o ya se marcó, no pisar ese estado
  await cancelUnpaidOrderBookings(client, orderId, "webhook:stripe");
}

stripeWebhookRouter.post("/", async (req, res) => {
  let event;
  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      req.headers["stripe-signature"],
      env.stripeWebhookSigningSecret
    );
  } catch (err) {
    return res.status(400).json({ error: `Firma de webhook inválida: ${err.message}` });
  }

  try {
    // Registrar el evento (dedup) y procesarlo ocurre en la MISMA transacción:
    // si el procesamiento falla, el rollback también deshace el registro del
    // evento, así Stripe puede reintentar sin que quede marcado como atendido.
    const result = await withTransaction(async (client) => {
      const isNewEvent = await recordWebhookEventOnce(client, {
        gateway: "stripe",
        eventId: event.id,
        eventType: event.type,
        payload: event,
      });
      if (!isNewEvent) return { deduped: true };

      if (event.type === "checkout.session.completed") {
        await handleCheckoutCompleted(client, event.data.object);
      } else if (event.type === "checkout.session.expired") {
        await handleCheckoutExpired(client, event.data.object);
      }
      return { deduped: false };
    });

    res.status(200).json({ received: true, deduped: result.deduped });
  } catch (err) {
    console.error("Error procesando webhook de Stripe", err);
    res.status(500).json({ error: "Error procesando el evento" });
  }
});
