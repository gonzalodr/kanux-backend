import { Router } from "express";
import { FeedbackController } from "./feedback.controller";

const router = Router();
const controller = new FeedbackController();

router.post("/:submissionId/generate", controller.generate.bind(controller));
router.get("/:submissionId", controller.list.bind(controller));

export default router;
