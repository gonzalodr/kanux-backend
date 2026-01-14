import { Router } from "express";
import { CatalogsController } from "./catalogs.controller";
const router = Router();
const controller = new CatalogsController();

router.get("/catalogs", controller.getCatalogs.bind(controller));

export default router;
