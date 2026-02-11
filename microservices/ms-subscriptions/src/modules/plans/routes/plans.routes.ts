import { Router } from "express";
import { PlanController } from "../controller/plans.controller";

const router = Router();
const planController = new PlanController();

router.get("/company", planController.getAllPlansCompany.bind(planController));
router.get("/talent", planController.getAllPlansTalent.bind(planController));
router.post("/company",planController.createCompanyPlan.bind(planController));
router.post("/talent",planController.createPlansTalent.bind(planController));

export default router;
