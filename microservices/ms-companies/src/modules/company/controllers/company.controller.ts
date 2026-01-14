import { Request, Response } from "express";
import { CompanyService } from "../services/company.services";
import { CreateCompanySchema } from "../dto/company.dto";
import { ZodError, z } from "zod";
export class CompanyController {
    private companyService: CompanyService;

    constructor() {
        this.companyService = new CompanyService();
    }

    async registerCompany(req: Request, res: Response) {
        try {
            //get company id params
            const { id_user } = req.params;

            //validate if company id is a uuid format
            if (!id_user || !z.uuid().safeParse(id_user).success) {
                return res.status(400).json({ message: "A valid UUID for Company ID is required" });
            }

            //validate with zod scheme 
            const validateCompany = CreateCompanySchema.parse(req.body);

            // send to services to register
            const result = await this.companyService.registerCompany(id_user,validateCompany);
            
            // response
            return res.status(200).json({ data: result.company, token: result.token });

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
            res.status(400).json({message: error.message || "Internal server error"});
        }

    }
}