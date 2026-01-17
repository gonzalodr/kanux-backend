import { Router } from "express";
import { SubscriptionController } from "../controller/subscriptions.controller";
const router = Router();
const subscriptionController = new SubscriptionController();

router.post("/talent/:id_profile/plan/:id_plan",subscriptionController.subscribeTalent.bind(subscriptionController));
router.post("/company/:id_company/plan/:id_plan",subscriptionController.subscribeCompany.bind(subscriptionController));
export default router;
