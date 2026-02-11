import { Request, Response } from "express";
import { TalentServices } from "../services/talent.service";
import { TalentSearchSchema } from "../dto/talent.dto";

export class TalentController {
    private talentService: TalentServices;
    constructor() {
        this.talentService = new TalentServices();
    }
    async searchTalent(req: Request, res: Response) {
        try {
            const validated = TalentSearchSchema.parse(req.params);
            const results = await this.talentService.searchTalent(validated);
            return res.status(200).json({ data: results });
            
        } catch (error: any) {
            if (error.name === "ZodError") {
                return res.status(422).json({
                    message: "The search format is incorrect",
                    errors: error.errors
                });
            }
            res.status(500).json({ message: error.message || "Internal server error" });
        }
    }

}