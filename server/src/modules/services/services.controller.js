import { Router } from "express";
import { opsAuth } from "../../middleware/opsAuth.js";
import { createService, getPublicCatalog, getServicesForOps, patchService, ServiceError } from "./services.service.js";

export const publicServicesRouter = Router();

publicServicesRouter.get("/services", async (req, res, next) => {
  try {
    res.json({ services: await getPublicCatalog() });
  } catch (err) {
    next(err);
  }
});

export const opsServicesRouter = Router();
opsServicesRouter.use(opsAuth);

opsServicesRouter.get("/ops/services", async (req, res, next) => {
  try {
    res.json({ services: await getServicesForOps() });
  } catch (err) {
    next(err);
  }
});

opsServicesRouter.post("/ops/services", async (req, res, next) => {
  try {
    const service = await createService(req.body);
    res.status(201).json({ service });
  } catch (err) {
    if (err instanceof ServiceError) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});

opsServicesRouter.patch("/ops/services/:id", async (req, res, next) => {
  try {
    const service = await patchService(req.params.id, req.body);
    res.json({ service });
  } catch (err) {
    if (err instanceof ServiceError) return res.status(err.status).json({ error: err.message });
    next(err);
  }
});
