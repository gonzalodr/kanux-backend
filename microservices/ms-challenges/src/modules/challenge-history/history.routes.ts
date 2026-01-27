import { Router } from "express";
import { ChallengeHistoryController } from "./history.controller";
import { mockAuth } from "../../middlewares/mockAuth.middleware";
import { authMiddleware } from "../../middlewares/auth.middleware";

const auth = process.env.NODE_ENV === "production" ? authMiddleware : mockAuth;

const router = Router();
const controller = new ChallengeHistoryController();

console.log(
  "Auth middleware in Challenge History Routes:",
  auth === authMiddleware ? "Production Auth" : "Mock Auth",
);

router.get("/my", auth, controller.getMyHistory.bind(controller));
router.get(
  "/my/technical",
  auth,
  controller.getMyTechnicalHistory.bind(controller),
);

router.get(
  "/my/non-technical",
  auth,
  controller.getMyNonTechnicalHistory.bind(controller),
);

export default router;
