import { Request, Response } from "express";
import { CompanyService } from "../services/company.services";
import { CreateCompanySchema } from "../dto/company.dto";
import { ZodError } from "zod";

export class CompanyController {
    private companyService: CompanyService;

    constructor() {
        this.companyService = new CompanyService();
    }

    async registerCompany(req: Request, res: Response) {
        try {
            const validateCompany = CreateCompanySchema.parse(req.body);

            const result = await this.companyService.registerCompany(validateCompany);

            return res.status(200).json({ success:true, data: result });

        } catch (error:any) {
            if (error instanceof ZodError) {
                return res.status(422).json({
                    message: "Validation error",
                    errors: error.issues.map((e) => ({
                            field: e.path.join("."),
                            message: e.message,
                        })
                    ),
                });
            }
            res.status(500).json({message: error.message || "Internal server error"});
        }

    }
}