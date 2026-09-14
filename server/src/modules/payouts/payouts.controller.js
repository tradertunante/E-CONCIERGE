import { Router } from "express";
import { opsAuth } from "../../middleware/opsAuth.js";
import { generatePayout, markPayoutAsPaid, PayoutError } from "./payouts.service.js";

export const opsPayoutsRouter = Router();
opsPayoutsRouter.use(opsAuth);

opsPayoutsRouter.post("/ops/payouts/generate", async (req, res, next) => {
  try {
    const { providerId, periodStart, periodEnd } = req.body;
    const result = await generatePayout({ providerId, periodStart, periodEnd });
    res.status(201).json(result);
  } catch (err) {
    if (err instanceof PayoutError) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

opsPayoutsRouter.post("/ops/payouts/:id/mark-paid", async (req, res, next) => {
  try {
    const payout = await markPayoutAsPaid({ payoutId: req.params.id, paymentReference: req.body?.paymentReference });
    res.json({ payout });
  } catch (err) {
    if (err instanceof PayoutError) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});
