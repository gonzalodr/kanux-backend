import { Router } from "express";
import { DashboardController } from "./dashboard.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";

const router = Router();
const controller = new DashboardController();

router.get(
  "/challenges",
  authMiddleware,
  controller.getFirstChallenges.bind(controller),
);
router.get("/feed", authMiddleware, controller.getFeedPosts.bind(controller));
router.get(
  "/stats",
  authMiddleware,
  controller.getDashboardStats.bind(controller),
);
export default router;
