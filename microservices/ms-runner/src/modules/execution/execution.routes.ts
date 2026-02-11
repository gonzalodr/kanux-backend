import { Router } from "express";
import { rateLimiter } from "../../middleware/rate-limiter";
import { ExecutionController } from "./execution.controller";

const router = Router();
const controller = new ExecutionController();

router.post("/", rateLimiter, controller.handle.bind(controller));

export default router;
