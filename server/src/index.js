import cors from "cors";
import express from "express";
import { env } from "./config/env.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { stripeWebhookRouter } from "./modules/payments/webhooks.controller.js";
import { apiRouter } from "./routes/index.js";

const app = express();

app.use(cors());

// El webhook de Stripe necesita el body crudo para verificar la firma, por
// eso se monta ANTES de express.json() y con su propio parser raw.
app.use("/api/webhooks/stripe", express.raw({ type: "application/json" }), stripeWebhookRouter);

app.use(express.json());
app.use("/api", apiRouter);
app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`E-Concierge server listening on port ${env.port} (${env.nodeEnv})`);
});
