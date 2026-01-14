import { Router } from "express";
import { FeedController } from "../controller/feed.controller";
import { authMiddleware } from "../../../middleware/auth.middleware";
import { mockAuth } from "../../../middleware/mockAuth.middleware";

const router = Router();
const controller = new FeedController();

const auth = process.env.NODE_ENV === "production"
  ? authMiddleware
  : mockAuth;


router.post("/post", auth, controller.createPost.bind(controller));

router.delete("/post/:postId",auth,controller.deletePost.bind(controller));

router.get("/my-post",auth,controller.getMyPosts.bind(controller));

router.get("/all-posts",auth,controller.getAllPosts.bind(controller));

export default router;
