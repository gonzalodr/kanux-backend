import { Router } from "express";
import { CompanyController } from "../controllers/company.controller";
import { uploadLogoMiddleware } from "../../../middlewares/multer.middlewares";

const router = Router();
const companyController = new CompanyController();


/**
* @route POST /company/register
* @group Companies - Registration/create operations
* @route @param id_user to find company register
* @request @body {CompanySchema} body.req - Object with the company's legal information
*/
router.post("/register/:id_user",uploadLogoMiddleware.single('logo'),companyController.registerCompany.bind(companyController));

export default router;