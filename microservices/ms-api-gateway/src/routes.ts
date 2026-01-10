import { Router } from "express";

import authProxy from "./proxy/auth.proxy";
import profilesProxy from "./proxy/profiles.proxy";
import challengesProxy from "./proxy/challenges.proxy";
import companiesProxy from "./proxy/companies.proxy";
import subscriptionsProxy from "./proxy/subscriptions.proxy";
import chatProxy from "./proxy/chat.proxy";

const router = Router();

router.use("/auth", authProxy);
router.use("/profiles", profilesProxy);
router.use("/challenges", challengesProxy);
router.use("/companies", companiesProxy);
router.use("/subscriptions", subscriptionsProxy);
router.use("/chat", chatProxy);

export default router;
