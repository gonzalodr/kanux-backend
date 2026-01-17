import { Request, Response } from "express";
import { SubscriptionServices } from "../services/subscriptions.service";
import { CreateCompanySubscriptionSchema } from "../dto/companySubscription.dto";
import { CreateTalentSubscriptionSchema } from "../dto/talentSubscription.dto";
import { CompanyActionType } from "../enums/actionType.enum";
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
  async validateActionCompany(req: Request, res: Response) {
    try {
      const { id_company } = req.params;
      const { action } = req.query;

      // Validate Path Parameters
      if (!z.uuid().safeParse(id_company).success) {
        return res.status(400).json({ success: false, message: "A valid UUID for Company ID is required" });
      }

      // Validate Query Parameters
      if (!action) {
        return res.status(400).json({ success: false, message: "Action type is required as a query parameter" });
      }

      // Validate typeSubscription
      const isValidAction = Object.values(CompanyActionType).includes(action as CompanyActionType);

      if (!isValidAction) {
        return res.status(400).json({ success: false, reason: 'INVALID_ACTION_TYPE', message: `The action '${action}' is not recognized by the system. Allowed values are: ${Object.values(CompanyActionType).join(', ')}` });
      }

      // consult to services
      const result = await this.subscribtionServices.validateActionOfCompany(id_company, action as CompanyActionType);

      // Handle Business response 
      if (!result.allowed) {
        return res.status(403).json({ success: false, ...result });
      }

      // success Response
      return res.status(200).json({ success: true, ...result });

    } catch (error: any) {
      // Zod Error Handling 
      if (error.name === "ZodError") {
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors.map((e: any) => ({
            path: e.path.join('.'),
            message: e.message
          }))
        });
      }
      return res.status(500).json({ success: false, reason: 'INTERNAL_SERVER_ERROR', message: 'An unexpected error occurred while processing the validation.' });
    }
  }

  async incrementProfileView(req: Request, res: Response) {
    try {
      const { id_company } = req.params;

      if (!z.uuid().safeParse(id_company).success) {
        return res.status(400).json({ success: false, message: "A valid UUID for Company ID is required" });
      }

      await this.subscribtionServices.incrementProfileViewUsage(id_company);

      return res.status(200).json({success: true,message: "Profile view count incremented successfully"});
    } catch (error: any) {
      return res.status(500).json({success: false,message: error.message || "Failed to increment profile view usage"});
    }
  }

  async incrementChallenge(req: Request, res: Response) {
    try {
      const { id_company } = req.params;

      if (!z.uuid().safeParse(id_company).success) {
        return res.status(400).json({ success: false, message: "A valid UUID for Company ID is required" });
      }

      await this.subscribtionServices.incrementChallengeUsage(id_company);

      return res.status(200).json({success: true,message: "Challenge count incremented successfully"});
    } catch (error: any) {
      return res.status(500).json({success: false,message: error.message || "Failed to increment challenge usage"});
    }
  }
}