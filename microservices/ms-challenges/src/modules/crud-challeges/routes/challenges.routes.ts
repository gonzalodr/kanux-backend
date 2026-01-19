import { Router } from "express";
import { ChallengesController } from "../controller/challenges.controller";
const router = Router();
const challengeController = new ChallengesController();

// CREATE
router.post("/", challengeController.createChallenges.bind(challengeController));
router.post("/:id_company", challengeController.createChallenges.bind(challengeController));

//update challenge
router.patch("/:challengeId",challengeController.updateChallengeBase.bind(challengeController));
router.patch("/:challengeId/company/:id_company",challengeController.updateChallengeBase.bind(challengeController));

//update metada
router.patch("/:challengeId/technical-metadata",challengeController.updateTechnicalMetadata.bind(challengeController));
router.patch("/:challengeId/company/:id_company/technical-metadata",challengeController.updateTechnicalMetadata.bind(challengeController));

//update detaills
router.patch("/:challengeId/non-technical/details",challengeController.updateNonTechnicalDetails.bind(challengeController));
router.patch("/:challengeId/company/:id_company/non-technical/details",challengeController.updateNonTechnicalDetails.bind(challengeController));

// update question
router.patch("/questions/:questionId",challengeController.updateNonTechnicalQuestion.bind(challengeController));
router.patch("/questions/:questionId/company/:id_company",challengeController.updateNonTechnicalQuestion.bind(challengeController));

// create question
router.post("/:challengeId/non-technical/:nonTechnicalChallengeId/questions",challengeController.createNonTechnicalQuestion.bind(challengeController));
router.post("/:challengeId/company/:id_company/non-technical/:nonTechnicalChallengeId/questions",challengeController.createNonTechnicalQuestion.bind(challengeController));

// update option
router.patch("/options/:optionId",challengeController.updateNonTechnicalOption.bind(challengeController));
router.patch("/options/:optionId/company/:id_company",challengeController.updateNonTechnicalOption.bind(challengeController));

// create option
router.post("/questions/:questionId/options",challengeController.createNonTechnicalOption.bind(challengeController));
router.post("/questions/:questionId/company/:id_company/options",challengeController.createNonTechnicalOption.bind(challengeController));

export default router;