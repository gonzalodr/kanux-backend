import { Router } from "express";
import { AuthController } from "../controller/auth.controller";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.post("/pre-register", AuthController.preRegister);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.post("/logout-all", authMiddleware, AuthController.logoutAll);
router.get("/verify-session", AuthController.verifySession);
router.get("/sessions", authMiddleware, AuthController.getSessions);

export default router;
