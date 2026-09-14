export async function findEligibleBookingsForPayout(client, { providerId, periodStart, periodEnd }) {
  const { rows } = await client.query(
    `select * from bookings
     where provider_id = $1
       and payout_id is null
       and status in ('confirmado','completado')
       and payout_basis != 'none'
       and day between $2 and $3
     order by day
     for update`,
    [providerId, periodStart, periodEnd]
  );
  return rows;
}

export async function insertPayout(client, { providerId, periodStart, periodEnd, totalAmount }) {
  const { rows } = await client.query(
    `insert into payouts (provider_id, period_start, period_end, total_amount)
     values ($1,$2,$3,$4)
     returning *`,
    [providerId, periodStart, periodEnd, totalAmount]
  );
  return rows[0];
}

export async function assignBookingToPayout(client, bookingId, payoutId, fromStatus) {
  const { rows } = await client.query(
    `update bookings set status = 'incluido_en_payout', payout_id = $2, updated_at = now()
     where id = $1 and status = $3
     returning *`,
    [bookingId, payoutId, fromStatus]
  );
  return rows[0] || null;
}

export async function findPayoutById(client, id) {
  const { rows } = await client.query(`select * from payouts where id = $1`, [id]);
  return rows[0] || null;
}

export async function markPayoutPaid(client, id, paymentReference) {
  const { rows } = await client.query(
    `update payouts set status = 'pagado', paid_at = now(), payment_reference = $2
     where id = $1 and status = 'pendiente'
     returning *`,
    [id, paymentReference]
  );
  return rows[0] || null;
}

export async function findBookingsByPayoutId(client, payoutId) {
  const { rows } = await client.query(`select * from bookings where payout_id = $1`, [payoutId]);
  return rows;
}
