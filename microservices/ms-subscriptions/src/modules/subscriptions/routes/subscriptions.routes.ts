import { Router } from "express";
import { SubscriptionController } from "../controller/subscriptions.controller";
import { authMiddleware } from "../../../middlewares/auth.middleware";

const router = Router();
const subscriptionController = new SubscriptionController();

router.post("/talent/plan/:id_plan",authMiddleware,subscriptionController.subscribeTalent.bind(subscriptionController));
router.post("/company/plan/:id_plan",authMiddleware,subscriptionController.subscribeCompany.bind(subscriptionController));
/**
 * Query Params: ?action=VIEW_PROFILE
 */
router.get("/company/:id_company/validate", subscriptionController.validateActionCompany.bind(subscriptionController));

//increment profile view
router.patch("/company/:id_company/usage/profile-view", subscriptionController.incrementProfileView.bind(subscriptionController));

// increment challenge
router.patch("/company/:id_company/usage/challenge", subscriptionController.incrementChallenge.bind(subscriptionController));

// --- (GET) ---
// get subscription company
router.get("/company/my-subscription",authMiddleware,subscriptionController.getMySubscriptionCompany.bind(subscriptionController));

// get subscription taleent
router.get("/talent/my-subscription", authMiddleware, subscriptionController.getMySubscriptionTalent.bind(subscriptionController));


// --- (PUT) ---
// update subscription
router.put("/company/upgrade/:id_plan",authMiddleware, subscriptionController.upgradeCompany.bind(subscriptionController));

// update subscription
router.put("/talent/upgrade/:id_plan",authMiddleware, subscriptionController.upgradeTalent.bind(subscriptionController));

export default router;
