import { Router } from "express";
import { MessagesController } from "./messages.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { mockAuth } from "../../middlewares/mockAuth.middleware";

const router = Router();
const controller = new MessagesController();

const auth = process.env.NODE_ENV === "production" ? authMiddleware : mockAuth;

router.post("/", auth, controller.sendMessage.bind(controller));
router.get(
  "/conversations/:id",
  auth,
  controller.getConversationMessages.bind(controller)
);

export default router;
