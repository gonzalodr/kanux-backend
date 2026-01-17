import { Request, Response } from "express";
import { SubscriptionServices } from "../services/subscriptions.service";
import { CreateCompanySubscriptionSchema } from "../dto/companySubscription.dto";
import { CreateTalentSubscriptionSchema } from "../dto/talentSubscription.dto";
import { z } from 'zod'

export class SubscriptionController {

  private subscribtionServices: SubscriptionServices;

  constructor() {
    this.subscribtionServices = new SubscriptionServices();
  }

  async subscribeCompany(req: Request, res: Response) {
    try {
      const { id_company, id_plan } = req.params;
      
      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          message: "Request body is required"
        });
      }

      if (!z.uuid().safeParse(id_company).success) {
        return res.status(400).json({ message: "A valid UUID for Company ID is required" });
      }
      if (!z.uuid().safeParse(id_plan).success) {
        return res.status(400).json({ message: "A valid UUID for Plan ID is required" });
      }

      const validatedData = CreateCompanySubscriptionSchema.parse(req.body);

      const result = await this.subscribtionServices.subscribeCompany(
        id_company,
        id_plan,
        validatedData
      );

      return res.status(201).json({
        message: "Company subscribed successfully",
        data: result
      });

    } catch (error: any) {
      // Handle Zod Validation Errors
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map((e: any) => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return res.status(500).json({ message: error.message });
    }
  }

  async subscribeTalent(req: Request, res: Response) {
    try {
      const { id_profile, id_plan } = req.params;

      if (!req.body || Object.keys(req.body).length === 0) {
        return res.status(400).json({
          message: "Request body is required"
        });
      }
      // Manual UUID Validation for parameters
      if (!z.uuid().safeParse(id_profile).success) {
        return res.status(400).json({ message: "A valid UUID for Profile ID is required" });
      }
      if (!z.uuid().safeParse(id_plan).success) {
        return res.status(400).json({ message: "A valid UUID for Plan ID is required" });
      }

      const validatedData = CreateTalentSubscriptionSchema.parse(req.body);

      const result = await this.subscribtionServices.subscribeTalent(id_profile, id_plan, validatedData);

      return res.status(201).json({
        message: "Talent subscription created successfully",
        data: result
      });
    } catch (error: any) {
      // Handle Zod Validation Errors
      if (error.name === "ZodError") {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors.map((e: any) => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return res.status(500).json({ message: error.message });
    }
  }

}