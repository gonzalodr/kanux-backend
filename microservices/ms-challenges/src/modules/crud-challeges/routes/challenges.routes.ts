import { Router } from "express";
import { ChallengesController } from "../controller/challenges.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { mockAuthCompany } from "../../../middlewares/mockAuth.middleware";
const router = Router();
const challengeController = new ChallengesController();


const auth = process.env.NODE_ENV === "production" ? authMiddleware : mockAuthCompany;

// CREATE
router.post("/", challengeController.createChallenges.bind(challengeController));
router.post("/:id_company",auth,challengeController.createChallenges.bind(challengeController));

// GET CHALLENGES
///?page=1&limit=5
router.get("/", challengeController.getChallenges.bind(challengeController));
// /uuid-empresa?page=2&limit=10
router.get("/:id_company",auth, challengeController.getChallenges.bind(challengeController));

// get challenge whith sumision
router.get("/:id_challenge/submissions/:id_company",auth,challengeController.getSubmissionsByChallenge.bind(challengeController));

//update challenge
router.patch("/:challengeId",challengeController.updateChallengeBase.bind(challengeController));
router.patch("/:challengeId/company/:id_company",auth,challengeController.updateChallengeBase.bind(challengeController));

//update metada
router.patch("/:challengeId/technical-metadata",challengeController.updateTechnicalMetadata.bind(challengeController));
router.patch("/:challengeId/company/:id_company/technical-metadata",auth,challengeController.updateTechnicalMetadata.bind(challengeController));

//update detaills
router.patch("/:challengeId/non-technical/details",challengeController.updateNonTechnicalDetails.bind(challengeController));
router.patch("/:challengeId/company/:id_company/non-technical/details",auth,challengeController.updateNonTechnicalDetails.bind(challengeController));

// update question
router.patch("/questions/:questionId",challengeController.updateNonTechnicalQuestion.bind(challengeController));
router.patch("/questions/:questionId/company/:id_company",auth,challengeController.updateNonTechnicalQuestion.bind(challengeController));

// create question
router.post("/:challengeId/non-technical/:nonTechnicalChallengeId/questions",challengeController.createNonTechnicalQuestion.bind(challengeController));
router.post("/:challengeId/company/:id_company/non-technical/:nonTechnicalChallengeId/questions",auth,challengeController.createNonTechnicalQuestion.bind(challengeController));

// update option
router.patch("/options/:optionId",challengeController.updateNonTechnicalOption.bind(challengeController));
router.patch("/options/:optionId/company/:id_company",auth,challengeController.updateNonTechnicalOption.bind(challengeController));

// create option
router.post("/questions/:questionId/options",challengeController.createNonTechnicalOption.bind(challengeController));
router.post("/questions/:questionId/company/:id_company/options",auth,challengeController.createNonTechnicalOption.bind(challengeController));

export default router;