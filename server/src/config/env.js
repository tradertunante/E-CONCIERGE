import "dotenv/config";

function required(name) {
  const value = process["env"][name];
  if (!value) {
    throw new Error(`Falta la variable de entorno ${name}`);
  }
  return value;
}

export const env = {
  nodeEnv: process["env"]["NODE_ENV"] || "development",
  port: Number(process["env"]["PORT"]) || 4000,
  pgConnectionString: required("PG_CONNECTION_STRING"),
  stripeApiKey: required("STRIPE_API_KEY"),
  stripeWebhookSigningSecret: required("STRIPE_WEBHOOK_SIGNING_SECRET"),
  opsApiKey: required("OPS_API_KEY"),
  frontendSuccessUrl: process["env"]["FRONTEND_SUCCESS_URL"] || "http://localhost:5173/confirmation",
  frontendCancelUrl: process["env"]["FRONTEND_CANCEL_URL"] || "http://localhost:5173/checkout",
};
