import { Router } from "express";
import { ProfilesController } from "./profiles.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { mockAuth } from "../../middlewares/mockAuth.middleware";

const router = Router();
const controller = new ProfilesController();

const auth = process.env.NODE_ENV === "production" ? authMiddleware : mockAuth;

router.put("/me", auth, controller.updateMyProfile.bind(controller));

export default router;
