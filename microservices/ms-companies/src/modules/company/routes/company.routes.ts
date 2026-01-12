import { Router } from "express";
import { CompanyController } from "../controllers/company.controller";

const router = Router();
const companyController = new CompanyController();


/**
* @route POST /company/create
* @group Companies - Registration/create operations
* @param {CompanySchema} body.req - Object with the company's legal information
*/
router.post("/",companyController.registerCompany.bind(companyController));

export default router;