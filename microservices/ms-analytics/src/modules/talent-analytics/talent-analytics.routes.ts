import { Router } from "express";
import { TalentAnalyticsController } from "./talent-analytics.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();

router.get(
  "/talent/dashboard",
  authMiddleware,
  TalentAnalyticsController.getDashboard,
);

export default router;
