import { Router } from "express";
import { SubscriptionController } from "../controller/subscriptions.controller";
const router = Router();
const subscriptionController = new SubscriptionController();

router.post("/talent/:id_profile/plan/:id_plan",subscriptionController.subscribeTalent.bind(subscriptionController));
router.post("/company/:id_company/plan/:id_plan",subscriptionController.subscribeCompany.bind(subscriptionController));
/**
 * Query Params: ?action=VIEW_PROFILE
 */
router.get("/company/:id_company/validate", subscriptionController.validateActionCompany.bind(subscriptionController));

//increment profile view
router.patch("/company/:id_company/usage/profile-view", subscriptionController.incrementProfileView.bind(subscriptionController));

// increment challenge
router.patch("/company/:id_company/usage/challenge", subscriptionController.incrementChallenge.bind(subscriptionController));

// --- (GET) ---
// get subscription
router.get("/company/:id_company/my-subscription", subscriptionController.getMySubscriptionCompany.bind(subscriptionController));

// get subscription
router.get("/talent/:id_profile/my-subscription", subscriptionController.getMySubscriptionTalent.bind(subscriptionController));


// --- (PUT) ---
// update subscription
router.put("/company/:id_company/upgrade/:id_plan", subscriptionController.upgradeCompany.bind(subscriptionController));

// update subscription
router.put("/talent/:id_profile/upgrade/:id_plan", subscriptionController.upgradeTalent.bind(subscriptionController));

export default router;
