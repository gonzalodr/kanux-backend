import { Router } from "express";
import { SoftChallengesController } from "./soft-challenges.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { mockAuth } from "../../middlewares/mockAuth.middleware";

const router = Router();
const controller = new SoftChallengesController();

const auth = process.env.NODE_ENV === "production" ? authMiddleware : mockAuth;

router.get("/", controller.listChallenges.bind(controller));
router.get("/:id", auth, controller.getChallenge.bind(controller));

export default router;
