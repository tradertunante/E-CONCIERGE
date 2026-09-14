import { Router } from "express";
import { opsAuth } from "../../middleware/opsAuth.js";
import { createProvider, getProviders, patchProvider, ProviderError } from "./providers.service.js";

export const opsProvidersRouter = Router();
opsProvidersRouter.use(opsAuth);

opsProvidersRouter.get("/ops/providers", async (req, res, next) => {
  try {
    res.json({ providers: await getProviders() });
  } catch (err) {
    next(err);
  }
});

opsProvidersRouter.post("/ops/providers", async (req, res, next) => {
  try {
    const provider = await createProvider(req.body);
    res.status(201).json({ provider });
  } catch (err) {
    if (err instanceof ProviderError) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

opsProvidersRouter.patch("/ops/providers/:id", async (req, res, next) => {
  try {
    const provider = await patchProvider(req.params.id, req.body);
    res.json({ provider });
  } catch (err) {
    if (err instanceof ProviderError) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});
