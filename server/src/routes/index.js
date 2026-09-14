import { Router } from "express";
import { opsBookingsRouter } from "../modules/bookings/bookings.controller.js";
import { ordersRouter } from "../modules/orders/orders.controller.js";
import { opsPayoutsRouter } from "../modules/payouts/payouts.controller.js";
import { opsProvidersRouter } from "../modules/providers/providers.controller.js";
import { opsServicesRouter, publicServicesRouter } from "../modules/services/services.controller.js";
import { healthRouter } from "./health.js";

export const apiRouter = Router();

apiRouter.use(healthRouter);
apiRouter.use(publicServicesRouter);
apiRouter.use(ordersRouter);
apiRouter.use(opsBookingsRouter);
apiRouter.use(opsPayoutsRouter);
apiRouter.use(opsProvidersRouter);
apiRouter.use(opsServicesRouter);
