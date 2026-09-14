export async function findBookingById(client, id) {
  const { rows } = await client.query(`select * from bookings where id = $1`, [id]);
  return rows[0] || null;
}

export async function findBookingsAwaitingConfirmation(client) {
  const { rows } = await client.query(
    `select b.*, o.guest_name, o.guest_email, o.confirmation_code, s.name as service_name
     from bookings b
     join orders o on o.id = b.order_id
     join services s on s.id = b.service_id
     where b.status = 'pendiente_confirmacion_proveedor'
     order by b.confirmation_deadline asc nulls last`
  );
  return rows;
}

export async function setBookingRefund(client, bookingId, { refundAmount, refundStatus }) {
  await client.query(
    `update bookings set refund_amount = $2, refund_status = $3, updated_at = now() where id = $1`,
    [bookingId, refundAmount, refundStatus]
  );
}
