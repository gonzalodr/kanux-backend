import { Router } from "express";
import { ChallengeHistoryController } from "./history.controller";
import { mockAuth } from "../../middlewares/mockAuth.middleware";

const router = Router();
const controller = new ChallengeHistoryController();

router.get("/my", mockAuth, controller.getMyHistory.bind(controller));
router.get(
  "/my/technical",
  mockAuth,
  controller.getMyTechnicalHistory.bind(controller),
);

router.get(
  "/my/non-technical",
  mockAuth,
  controller.getMyNonTechnicalHistory.bind(controller),
);

export default router;
