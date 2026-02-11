import { Router } from "express";
import { CommentController } from "../controller/comment.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { mockAuth } from "../../../middleware/mockAuth.middleware";

const router = Router();
const controller = new CommentController();


const auth = process.env.NODE_ENV === "production" ? authMiddleware : mockAuth;


router.post("/:postId/comment", auth, controller.createComment.bind(controller)); 

router.delete("/comment/:commentId",auth,controller.deleteComment.bind(controller));

router.get("/:postId/all-comment",auth,controller.getCommentsByPost.bind(controller));

export default router;