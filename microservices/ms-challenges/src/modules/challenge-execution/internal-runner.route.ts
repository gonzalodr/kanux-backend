import { Router } from "express";
import { ExecutionController } from "./execution.controller";

const router = Router();
const controller = new ExecutionController();

router.post(
  "/:challengeId/execute",
  controller.runInternalTechnicalChallenge.bind(controller),
);

export default router;
