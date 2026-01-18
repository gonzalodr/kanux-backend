import { Router } from "express";
import { ChallengesController } from "../controller/challenges.controller";
const router = Router();
const challengeController = new ChallengesController();

// CREATE
router.post("/", challengeController.createChallenges.bind(challengeController));
router.post("/:id_company", challengeController.createChallenges.bind(challengeController));

export default router;