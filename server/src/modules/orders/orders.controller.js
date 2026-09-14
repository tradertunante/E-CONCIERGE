import { Router } from "express";
import { createOrder, getOrderWithBookings, OrderError } from "./orders.service.js";

export const ordersRouter = Router();

ordersRouter.post("/orders", async (req, res, next) => {
  try {
    const idempotencyKey = req.get("Idempotency-Key") || req.body.idempotencyKey;
    const { guestInfo, trip, items, currency } = req.body;
    const result = await createOrder({ idempotencyKey, guestInfo, trip, items, currency });
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof OrderError) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});

ordersRouter.get("/orders/:id", async (req, res, next) => {
  try {
    const result = await getOrderWithBookings(req.params.id);
    res.json(result);
  } catch (err) {
    if (err instanceof OrderError) {
      return res.status(err.status).json({ error: err.message });
    }
    next(err);
  }
});
