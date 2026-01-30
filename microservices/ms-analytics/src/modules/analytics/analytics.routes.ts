import { Router } from "express";
import { AnalyticsController } from "./analytics.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get("/dashboard", authMiddleware, AnalyticsController.getDashboard);

export default router;
