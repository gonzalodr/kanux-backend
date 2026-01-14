import { Router } from "express";
import { ReactionController } from "../controller/reaction.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { mockAuth } from "../../../middleware/mockAuth.middleware";

const router = Router();
const controller = new ReactionController();

const auth = process.env.NODE_ENV === "production" ? authMiddleware : mockAuth;

router.post("/:postId/reaction", auth, controller.toggleReaction.bind(controller));

export default router;
