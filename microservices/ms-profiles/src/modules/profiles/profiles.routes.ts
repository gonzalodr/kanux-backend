import { Router } from "express";
import { ProfilesController } from "./profiles.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { mockAuth } from "../../middlewares/mockAuth.middleware";

const router = Router();
const controller = new ProfilesController();

const auth = process.env.NODE_ENV === "production" ? authMiddleware : mockAuth;

router.get("/me", auth, controller.getMyProfile.bind(controller));
router.get("/talent/:id", controller.getPublicTalentProfile.bind(controller));
router.put("/me", auth, controller.updateMyProfile.bind(controller));

export default router;
