import { Router } from "express";
import { ChallengeController } from "./challenge.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { mockAuth } from "../../middlewares/mockAuth.middleware";

const router = Router();
const controller = new ChallengeController();

const auth = process.env.NODE_ENV === "production" ? authMiddleware : mockAuth;

// Public technical challenges (no auth)
router.get("/public", controller.getPublicTechnicalChallenges.bind(controller));
router.get(
  "/public/:challengeId",
  controller.getPublicTechnicalChallengeDetail.bind(controller),
);

router.post(
  "/:challengeId/start",
  auth,
  controller.startTechnicalChallenge.bind(controller),
);

router.post(
  "/:challengeId/submit",
  auth,
  controller.submitTechnicalChallenge.bind(controller),
);

router.get(
  "/challenge/submit-challenges",
  auth,
  controller.getMyChallengeHistory.bind(controller),
);

export default router;
