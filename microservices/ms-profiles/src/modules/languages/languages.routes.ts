import { Router } from "express";
import { LanguagesController } from "./languages.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { mockAuth } from "../../middlewares/mockAuth.middleware";

const router = Router();
const controller = new LanguagesController();

const auth = process.env.NODE_ENV === "production" ? authMiddleware : mockAuth;

router.get("/me", auth, controller.getMyLanguages.bind(controller));
router.post("/me", auth, controller.addLanguage.bind(controller));
router.put("/me/:id",auth, controller.updateLanguage.bind(controller));
router.delete("/me/:id", auth, controller.deleteLanguage.bind(controller));

export default router;
