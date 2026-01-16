import { Request, Response } from "express";
import { z } from "zod";
import { MetricsServices } from "../services/metrics.service";

export class MetricsController {
    private metricsServices: MetricsServices;

    constructor() {
        this.metricsServices = new MetricsServices();
    }

    async getMetricsCompany(req: Request, res: Response) {
        try {
            const { id_company } = req.params

            if (!id_company || !z.uuid().safeParse(id_company).success) {
                return res.status(400).json({ message: "A valid UUID for Company ID is required" });
            }

            const result = await this.metricsServices.getMetricsCompany(id_company);

            return res.status(200).json({
                total_candidates: result.candidates_evaluated,
                active_challenges: result.active_challenges,
                total_conversations: result.total_conversation
            })
        } catch (error: any) {
            if (error.name === "ZodError") {
                return res.status(422).json({ errors: error.errors });
            }
            res.status(400).json({ message: error.message || "Internal server error" });
        }
    }
}