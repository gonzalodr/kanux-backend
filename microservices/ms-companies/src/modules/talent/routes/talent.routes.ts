import { Router } from "express";
import { TalentController } from "../controller/talent.controller";

const router = Router();
const talentController = new TalentController();

router.get("/search/:querySearch",talentController.searchTalent.bind(talentController))

export default router;