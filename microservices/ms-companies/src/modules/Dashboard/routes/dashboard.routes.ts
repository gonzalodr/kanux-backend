import { Router } from "express";
import { DashboardController } from "../controller/dashboard.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();
const controller = new DashboardController();

router.get("/dashboard", authMiddleware, controller.getCompanyDashboard);
router.get("/dashboard/candidates", authMiddleware, controller.getMyCandidates);
router.get("/dashboard/getViewUsed", authMiddleware, controller.getProfileViewsStatus);
export default router;
