import { Router } from "express";
import { MetricsController } from "../controller/metrics.controller";

const router = Router();
const metricsController = new MetricsController();

router.get("/:id_company", metricsController.getMetricsCompany.bind(metricsController));

export default router;