import { Router } from "express";
import { DashboardController } from "../controller/dashboard.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();
const controller = new DashboardController();

router.get("/dashboard", authMiddleware, controller.getCompanyDashboard);
router.get("/dashboard/candidates", authMiddleware, controller.getMyCandidates);

export default router;
