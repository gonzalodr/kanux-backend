import { Router } from "express";
import { preRegister } from "../controller/auth.controller";

const router = Router();


router.post("/pre-register", preRegister);

export default router;
