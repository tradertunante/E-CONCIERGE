import { withTransaction } from "../../config/db.js";
import { logBookingEvent, transitionBooking } from "../orders/orders.repository.js";
import {
  assignBookingToPayout,
  findBookingsByPayoutId,
  findEligibleBookingsForPayout,
  findPayoutById,
  insertPayout,
  markPayoutPaid,
} from "./payouts.repository.js";

class PayoutError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Un booking solo puede pertenecer a un payout (payout_id se asigna una sola
// vez); el "for update" en findEligibleBookingsForPayout bloquea esas filas
// para que dos generaciones concurrentes no tomen los mismos bookings.
export async function generatePayout({ providerId, periodStart, periodEnd }) {
  if (!providerId || !periodStart || !periodEnd) {
    throw new PayoutError(400, "Faltan providerId, periodStart o periodEnd");
  }

  return withTransaction(async (client) => {
    const bookings = await findEligibleBookingsForPayout(client, { providerId, periodStart, periodEnd });
    if (bookings.length === 0) {
      throw new PayoutError(404, "No hay bookings elegibles para ese proveedor y periodo");
    }

    const totalAmount = bookings.reduce((sum, b) => sum + Number(b.cost_provider), 0);

    let payout;
    try {
      payout = await insertPayout(client, { providerId, periodStart, periodEnd, totalAmount });
    } catch (err) {
      if (err.code === "23505") {
        throw new PayoutError(409, "Ya existe un payout para ese proveedor y periodo");
      }
      throw err;
    }

    for (const booking of bookings) {
      await assignBookingToPayout(client, booking.id, payout.id, booking.status);
      await logBookingEvent(client, {
        bookingId: booking.id,
        fromStatus: booking.status,
        toStatus: "incluido_en_payout",
        actor: "ops",
        note: `payout ${payout.id}`,
      });
    }

    return { payout, bookingsCount: bookings.length };
  });
}

export async function markPayoutAsPaid({ payoutId, paymentReference }) {
  return withTransaction(async (client) => {
    const existing = await findPayoutById(client, payoutId);
    if (!existing) throw new PayoutError(404, "Payout no encontrado");

    const payout = await markPayoutPaid(client, payoutId, paymentReference);
    if (!payout) throw new PayoutError(409, "Ese payout ya estaba marcado como pagado");

    const bookings = await findBookingsByPayoutId(client, payoutId);
    for (const booking of bookings) {
      const updated = await transitionBooking(client, booking.id, "incluido_en_payout", "pagado_a_proveedor");
      if (updated) {
        await logBookingEvent(client, {
          bookingId: booking.id,
          fromStatus: "incluido_en_payout",
          toStatus: "pagado_a_proveedor",
          actor: "ops",
        });
      }
    }

    return payout;
  });
}

export { PayoutError };
