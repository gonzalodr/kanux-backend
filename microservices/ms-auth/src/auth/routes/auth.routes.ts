import { Router } from "express";
import { AuthController } from "../controller/auth.controller";

const router = Router();


router.post("/pre-register", AuthController.preRegister);
router.post("/login", AuthController.login);

export default router;
