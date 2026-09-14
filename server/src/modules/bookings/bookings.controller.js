import { Router } from "express";
import { pool } from "../../config/db.js";
import { opsAuth } from "../../middleware/opsAuth.js";
import { findBookingsAwaitingConfirmation } from "./bookings.repository.js";
import { BookingError, confirmBooking, rejectBooking } from "./bookings.service.js";

export const opsBookingsRouter = Router();
opsBookingsRouter.use(opsAuth);

opsBookingsRouter.get("/ops/bookings/pending-confirmation", async (req, res, next) => {
  try {
    const bookings = await findBookingsAwaitingConfirmation(pool);
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
});

opsBookingsRouter.post("/ops/bookings/:id/confirm", async (req, res, next) => {
  try {
    const booking = await confirmBooking(req.params.id, "ops");
    res.json({ booking });
  } catch (err) {
    if (err instanceof BookingError) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

opsBookingsRouter.post("/ops/bookings/:id/reject", async (req, res, next) => {
  try {
    const result = await rejectBooking(req.params.id, { actor: "ops", reason: req.body?.reason });
    res.json(result);
  } catch (err) {
    if (err instanceof BookingError) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});
