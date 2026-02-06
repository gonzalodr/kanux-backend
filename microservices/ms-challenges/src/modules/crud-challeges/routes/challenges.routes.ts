import { Router } from "express";
import { ChallengesController } from "../controller/challenges.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";
import { mockAuthCompany } from "../../../middlewares/mockAuth.middleware";
import { checkSubscriptionPermission } from "../../../middlewares/validatePermissionCompany.middleware";
import { mockCheckSubscription } from "../../../middlewares/mockPermissionCompani.middleware";

const router = Router();
const challengeController = new ChallengesController();

const auth =
  process.env.NODE_ENV === "production" ? authMiddleware : mockAuthCompany;
const permissionCompany =
  process.env.NODE_ENV === "production"
    ? checkSubscriptionPermission
    : mockCheckSubscription;

// EVALUATE
router.post(
  "/submissions/:id_submission/evaluate",
  auth,
  challengeController.evaluateChallenges.bind(challengeController),
);

// CREATE
router.post(
  "/company/:id_company",
  auth,
  // permissionCompany,
  challengeController.createChallenges.bind(challengeController),
);
router.post(
  "/",
  challengeController.createChallenges.bind(challengeController),
);

// GET CHALLENGES
// GET by company (nueva ruta específica)
router.get(
  "/company/:id_company",
  mockAuthCompany,
  challengeController.getChallengesByCompany.bind(challengeController),
);

// GET all challenges
router.get("/", challengeController.getChallenges.bind(challengeController));

// GET challenge submissions by company
router.get(
  "/:id_challenge/submissions/:id_company",
  auth,
  challengeController.getSubmissionsByChallenge.bind(challengeController),
);

// UPDATE challenge base
router.patch(
  "/:challengeId",
  challengeController.updateChallengeBase.bind(challengeController),
);
router.patch(
  "/:challengeId/company/:id_company",
  auth,
  challengeController.updateChallengeBase.bind(challengeController),
);

// UPDATE technical metadata
router.patch(
  "/:challengeId/technical-metadata",
  challengeController.updateTechnicalMetadata.bind(challengeController),
);
router.patch(
  "/:challengeId/company/:id_company/technical-metadata",
  auth,
  challengeController.updateTechnicalMetadata.bind(challengeController),
);

// UPDATE non-technical details
router.patch(
  "/:challengeId/non-technical/details",
  challengeController.updateNonTechnicalDetails.bind(challengeController),
);
router.patch(
  "/:challengeId/company/:id_company/non-technical/details",
  auth,
  challengeController.updateNonTechnicalDetails.bind(challengeController),
);

// UPDATE question
router.patch(
  "/questions/:questionId",
  challengeController.updateNonTechnicalQuestion.bind(challengeController),
);
router.patch(
  "/questions/:questionId/company/:id_company",
  auth,
  challengeController.updateNonTechnicalQuestion.bind(challengeController),
);

// CREATE question
router.post(
  "/:challengeId/non-technical/:nonTechnicalChallengeId/questions",
  challengeController.createNonTechnicalQuestion.bind(challengeController),
);
router.post(
  "/:challengeId/company/:id_company/non-technical/:nonTechnicalChallengeId/questions",
  auth,
  challengeController.createNonTechnicalQuestion.bind(challengeController),
);

// UPDATE option
router.patch(
  "/options/:optionId",
  challengeController.updateNonTechnicalOption.bind(challengeController),
);
router.patch(
  "/options/:optionId/company/:id_company",
  auth,
  challengeController.updateNonTechnicalOption.bind(challengeController),
);

// CREATE option
router.post(
  "/questions/:questionId/options",
  challengeController.createNonTechnicalOption.bind(challengeController),
);
router.post(
  "/questions/:questionId/company/:id_company/options",
  auth,
  challengeController.createNonTechnicalOption.bind(challengeController),
);

export default router;
