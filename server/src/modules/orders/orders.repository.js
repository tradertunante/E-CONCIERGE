export async function findOrderByIdempotencyKey(client, idempotencyKey) {
  const { rows } = await client.query(
    `select * from orders where idempotency_key = $1`,
    [idempotencyKey]
  );
  return rows[0] || null;
}

export async function findOrderById(client, orderId) {
  const { rows } = await client.query(`select * from orders where id = $1`, [orderId]);
  return rows[0] || null;
}

export async function findServiceWithProvider(client, serviceId) {
  const { rows } = await client.query(
    `select s.*, p.default_commission_pct, p.confirmation_type, p.name as provider_name, p.active as provider_active
     from services s
     join providers p on p.id = s.provider_id
     where s.id = $1`,
    [serviceId]
  );
  return rows[0] || null;
}

export async function reserveInventorySlot(client, { serviceId, day, time, capacityTotal }) {
  await client.query(
    `insert into inventory_slots (service_id, day, time, capacity_total)
     values ($1, $2, $3, $4)
     on conflict (service_id, day, time) do nothing`,
    [serviceId, day, time, capacityTotal]
  );
  const { rows } = await client.query(
    `update inventory_slots
     set capacity_booked = capacity_booked + 1
     where service_id = $1 and day = $2 and time = $3 and capacity_booked < capacity_total
     returning id`,
    [serviceId, day, time]
  );
  return rows[0]?.id || null;
}

export async function releaseInventorySlot(client, inventorySlotId) {
  if (!inventorySlotId) return;
  await client.query(
    `update inventory_slots set capacity_booked = capacity_booked - 1
     where id = $1 and capacity_booked > 0`,
    [inventorySlotId]
  );
}

export async function insertOrder(client, order) {
  const { rows } = await client.query(
    `insert into orders (
       idempotency_key, guest_name, guest_email, guest_phone,
       trip_start, trip_end, guests_count, currency_display, exchange_rate_mxn_usd,
       promo_code, discount_amount, subtotal_mxn, total_mxn, confirmation_code
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
     returning *`,
    [
      order.idempotencyKey,
      order.guestName,
      order.guestEmail,
      order.guestPhone,
      order.tripStart,
      order.tripEnd,
      order.guestsCount,
      order.currencyDisplay,
      order.exchangeRateMxnUsd,
      order.promoCode,
      order.discountAmount,
      order.subtotalMxn,
      order.totalMxn,
      order.confirmationCode,
    ]
  );
  return rows[0];
}

export async function setOrderStripeSession(client, orderId, { sessionId, checkoutUrl }) {
  await client.query(
    `update orders set stripe_checkout_session_id = $2, checkout_url = $3, updated_at = now()
     where id = $1`,
    [orderId, sessionId, checkoutUrl]
  );
}

export async function setOrderPaymentStatus(client, orderId, status, guardStatus) {
  const { rows } = await client.query(
    `update orders set payment_status = $2, updated_at = now()
     where id = $1 and payment_status = $3
     returning *`,
    [orderId, status, guardStatus]
  );
  return rows[0] || null;
}

export async function findPaymentByOrderId(client, orderId) {
  const { rows } = await client.query(
    `select * from payments where order_id = $1 order by created_at desc limit 1`,
    [orderId]
  );
  return rows[0] || null;
}

export async function insertBooking(client, booking) {
  const { rows } = await client.query(
    `insert into bookings (
       order_id, service_id, provider_id, inventory_slot_id, day, time, people,
       is_deposit, price_client, cost_provider, commission_pct, commission_amount,
       payout_basis, cancellation_loss_policy, hold_expires_at
     ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
     returning *`,
    [
      booking.orderId,
      booking.serviceId,
      booking.providerId,
      booking.inventorySlotId,
      booking.day,
      booking.time,
      booking.people,
      booking.isDeposit,
      booking.priceClient,
      booking.costProvider,
      booking.commissionPct,
      booking.commissionAmount,
      booking.payoutBasis,
      booking.cancellationLossPolicy,
      booking.holdExpiresAt,
    ]
  );
  return rows[0];
}

export async function findBookingsByOrderId(client, orderId) {
  const { rows } = await client.query(`select * from bookings where order_id = $1`, [orderId]);
  return rows;
}

export async function transitionBooking(client, bookingId, fromStatus, toStatus, extra = {}) {
  const extraKeys = Object.keys(extra);
  const setClauses = extraKeys.map((key, i) => `${key} = $${i + 4}`).join(", ");
  const values = extraKeys.map((key) => extra[key]);
  const { rows } = await client.query(
    `update bookings
     set status = $3, updated_at = now()${setClauses ? ", " + setClauses : ""}
     where id = $1 and status = $2
     returning *`,
    [bookingId, fromStatus, toStatus, ...values]
  );
  return rows[0] || null;
}

export async function logBookingEvent(client, { bookingId, fromStatus, toStatus, actor, note }) {
  await client.query(
    `insert into booking_events (booking_id, from_status, to_status, actor, note)
     values ($1,$2,$3,$4,$5)`,
    [bookingId, fromStatus, toStatus, actor, note || null]
  );
}
