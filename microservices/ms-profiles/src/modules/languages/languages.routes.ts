import { Router } from "express";
import { LanguagesController } from "./languages.controller";
import { mockAuth } from "../../middlewares/mockAuth.middleware";

const router = Router();
const controller = new LanguagesController();

router.get("/me", mockAuth, controller.getMyLanguages.bind(controller));
router.post("/me", mockAuth, controller.addLanguage.bind(controller));
router.delete("/me/:id", mockAuth, controller.deleteLanguage.bind(controller));

export default router;
