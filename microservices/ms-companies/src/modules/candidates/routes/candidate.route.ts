import { Router } from "express";
import { CandidateController } from "../controllers/candidate.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();
const controller = new CandidateController();

router.get(
  "/candidates",
  authMiddleware,
  controller.getMyCandidates.bind(controller)
);

router.get(
  "/candidates/filter",
  authMiddleware,
  controller.getMyCandidatesFiltered.bind(controller)
);

router.get(
  "/candidates/learning-backgrounds",
  authMiddleware,
  controller.getAll.bind(controller)
);


export default router;
