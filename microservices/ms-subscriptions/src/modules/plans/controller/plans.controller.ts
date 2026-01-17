import { Request, Response } from "express";
import { PlanServices } from "../services/plans.service";
import { CreateTalentPlanSchema } from "../dto/talent_plan.dto";
import { CreateCompanyPlanSchema } from "../dto/company_plan.dto";


export class PlanController {
  private planServices: PlanServices;
  constructor() {
    this.planServices = new PlanServices();
  }
  async getAllPlansCompany(req: Request, res: Response) {
    try {
      const result = await this.planServices.getAllPlanCompany();
      return res.status(200).json({ data: result });
    } catch (error: any) {
      return res.status(500).json({
        message: "An internal server error occurred while fetching company plans."
      });
    }
  }

  async getAllPlansTalent(req: Request, res: Response) {
    try {
      const result = await this.planServices.getAllPlanTalent();
      return res.status(200).json({ data: result });
    } catch (error: any) {
      return res.status(500).json({
        message: "An internal server error occurred while fetching talent plans."
      });
    }
  }

  async createPlansTalent(req: Request, res: Response) {
    try {
      // validation
      const validatedPlan = CreateTalentPlanSchema.parse(req.body);
      const result = await this.planServices.createPlanTalent(validatedPlan);
      return res.status(201).json({ data: result });
    } catch (error: any) {
      // Error validation and response
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map((e: any) => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return res.status(500).json({
        message: "Failed to create the talent plan. Please try again later."
      });
    }
  }

  async createCompanyPlan(req: Request, res: Response) {
    try {
      // validate
      const validatedPlan = CreateCompanyPlanSchema.parse(req.body);

      // register
      const result = await this.planServices.createPlanCompany(validatedPlan);

      //
      return res.status(201).json({
        message: "Company plan created successfully",
        data: result
      });

    } catch (error: any) {
      // Handle Zod validation errors
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map((e: any) => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }

      // Handle unexpected server errors
      console.error("Error in createCompanyPlan:", error);
      return res.status(500).json({
        message: "An internal server error occurred while creating the company plan."
      });
    }
  }
}
