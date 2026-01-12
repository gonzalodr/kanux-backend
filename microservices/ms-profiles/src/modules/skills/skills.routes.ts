import { Router } from "express";
import { SkillsController } from "./skills.controller";
import { mockAuth } from "../../middlewares/mockAuth.middleware";

const router = Router();
const controller = new SkillsController();

router.get("/me", mockAuth, controller.getMySkills.bind(controller));
router.post("/me", mockAuth, controller.addSkill.bind(controller));
router.delete("/me/:id", mockAuth, controller.deleteSkill.bind(controller));

export default router;
