import { Router } from "express";
import { ConversationsController } from "./conversations.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { mockAuth } from "../../middlewares/mockAuth.middleware";

const router = Router();
const controller = new ConversationsController();

const auth = process.env.NODE_ENV === "production" ? authMiddleware : mockAuth;

router.post("/", auth, controller.createConversation.bind(controller));

export default router;
