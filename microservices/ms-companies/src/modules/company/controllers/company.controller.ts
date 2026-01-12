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
            //get user id params
            const { id_user } = req.params;

            //validate id_user format
            if (!id_user || id_user.trim() === "") {
                return res.status(400).json({ message: "User ID is required in the URL parameters"});
            }

            //validate if is a uuid format
            if (!z.uuid().safeParse(id_user).success) {
                return res.status(400).json({ message: "The provided User ID is not a valid UUID" });
            }

            //validate with zod scheme 
            const validateCompany = CreateCompanySchema.parse(req.body);

            // send to services to register
            const result = await this.companyService.registerCompany(id_user,validateCompany);

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