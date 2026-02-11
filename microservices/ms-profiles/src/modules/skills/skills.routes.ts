import { Router } from "express";
import { SkillsController } from "./skills.controller";
import { authMiddleware } from "../../middlewares/auth.middleware";
import { mockAuth } from "../../middlewares/mockAuth.middleware";

const router = Router();
const controller = new SkillsController();

const auth = process.env.NODE_ENV === "production" ? authMiddleware : mockAuth;

router.get("/me", auth, controller.getMySkills.bind(controller));
router.post("/me", auth, controller.addSkill.bind(controller));
router.delete("/me/:id", auth, controller.deleteSkill.bind(controller));
router.put("/me/:id",auth, controller.updateSkillByUser.bind(controller))

router.get("/all-skills", controller.getSkillsWithSubSkills);
router.get("/subskills/:categoryId", controller.getSubSkillsByCategory);

export default router;
