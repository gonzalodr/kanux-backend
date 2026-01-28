import { Request, Response } from "express";
import { CreateChallengeScheme } from "../dto/create-challenges.dto";
import { ZodError, z } from "zod";
import { ChallengesServices } from "../services/challenges.services";

import {
  ChallengeBaseUpdateSchema,
  TechnicalMetadataUpdateSchema,
  NonTechnicalDetailsUpdateSchema,
  NonTechnicalQuestionUpdateSchema,
  NonTechnicalOptionUpdateSchema,
} from "../dto/upadte-challenges.dto";

export class ChallengesController {
  private challengesServices: ChallengesServices;
  constructor() {
    this.challengesServices = new ChallengesServices();
  }
  //===================
  // Create challenges
  //=======================
  async createChallenges(req: Request, res: Response) {
    try {
      const { id_company } = req.params;

      if (id_company && !z.uuid().safeParse(id_company).success) {
        return res
          .status(400)
          .json({ message: "A valid UUID for Company ID is required" });
      }
      const validChallenges = CreateChallengeScheme.parse(req.body);

      const result = await this.challengesServices.createChallenges(
        id_company,
        validChallenges,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.issues.map((e: any) => ({
            path: e.path.join("."),
            message: e.message,
          })),
        });
      }
      return res.status(500).json({ message: error.message });
    }
  }

  //=====================
  // UPDATE CHALLENGES
  //====================
  async updateChallengeBase(req: Request, res: Response) {
    try {
      const { challengeId, id_company } = req.params;

      if (!z.uuid().safeParse(challengeId).success) {
        return res.status(400).json({ message: "Invalid challenge id" });
      }

      const data = ChallengeBaseUpdateSchema.parse(req.body);

      const result = await this.challengesServices.updateChallengeBase(
        challengeId,
        id_company,
        data,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }

  // =========================
  // UPDATE TECHNICAL METADATA
  // =========================
  async updateTechnicalMetadata(req: Request, res: Response) {
    try {
      const { challengeId, id_company } = req.params;

      if (!z.uuid().safeParse(challengeId).success) {
        return res.status(400).json({ message: "Invalid challenge id" });
      }

      const data = TechnicalMetadataUpdateSchema.parse(req.body);

      const result = await this.challengesServices.updateTechnicalMetadata(
        challengeId,
        id_company,
        data,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }

  // =========================
  // UPDATE NON TECHNICAL DETAILS
  // =========================
  async updateNonTechnicalDetails(req: Request, res: Response) {
    try {
      const { challengeId, id_company } = req.params;

      if (!z.uuid().safeParse(challengeId).success) {
        return res.status(400).json({ message: "Invalid challenge id" });
      }

      const data = NonTechnicalDetailsUpdateSchema.parse(req.body);

      const result = await this.challengesServices.updateNonTechnicalDetails(
        challengeId,
        id_company,
        data,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }

  // =========================
  // UPDATE QUESTION
  // =========================
  async updateNonTechnicalQuestion(req: Request, res: Response) {
    try {
      const { questionId, id_company } = req.params;

      if (!z.uuid().safeParse(questionId).success) {
        return res.status(400).json({ message: "Invalid question id" });
      }

      const data = NonTechnicalQuestionUpdateSchema.parse(req.body);

      const result = await this.challengesServices.updateNonTechnicalQuestion(
        questionId,
        id_company,
        data,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }

  // =========================
  // CREATE QUESTION TO TECHNICAL EXISTING
  // =========================
  async createNonTechnicalQuestion(req: Request, res: Response) {
    try {
      const { challengeId, nonTechnicalChallengeId, id_company } = req.params;

      if (
        !z.uuid().safeParse(challengeId).success ||
        !z.uuid().safeParse(nonTechnicalChallengeId).success
      ) {
        return res.status(400).json({ message: "Invalid id provided" });
      }

      const data = z
        .object({
          question: z.string().min(1),
          question_type: z.string().min(1),
        })
        .parse(req.body);

      const result = await this.challengesServices.createNonTechnicalQuestion(
        nonTechnicalChallengeId,
        challengeId,
        id_company,
        data,
      );

      return res.status(201).json(result);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }

  // =========================
  // UPDATE OPTION
  // =========================
  async updateNonTechnicalOption(req: Request, res: Response) {
    try {
      const { optionId, id_company } = req.params;

      if (!z.uuid().safeParse(optionId).success) {
        return res.status(400).json({ message: "Invalid option id" });
      }

      const data = NonTechnicalOptionUpdateSchema.parse(req.body);

      const result = await this.challengesServices.updateNonTechnicalOption(
        optionId,
        id_company,
        data,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }

  // =========================
  // CREATE OPTION TO QUESTION EXISTING
  // =========================
  async createNonTechnicalOption(req: Request, res: Response) {
    try {
      const { questionId, id_company } = req.params;

      if (!z.uuid().safeParse(questionId).success) {
        return res.status(400).json({ message: "Invalid question id" });
      }

      const data = z
        .object({
          option_text: z.string().min(1),
          is_correct: z.boolean(),
        })
        .parse(req.body);

      const result = await this.challengesServices.createNonTechnicalOption(
        questionId,
        id_company,
        data,
      );

      return res.status(201).json(result);
    } catch (error: any) {
      return this.handleError(res, error);
    }
  }
  // =========================
  // GET CHALLENGES BY COMPANY
  // =========================

  async getChallengesByCompany(req: Request, res: Response) {
    try {
      const { id_company } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.challengesServices.getChallengesByCompany(
        id_company,
        page,
        limit,
      );

      if (result.data.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No challenges found",
          ...result,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Challenges retrieved successfully",
        ...result,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  async getChallenges(req: Request, res: Response) {
    try {
      // get id company
      const { id_company } = req.params;

      // get params (?page=1&limit=10)
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const result = await this.challengesServices.getChallengesByCompany(
        id_company,
        page,
        limit,
      );

      if (result.data.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No challenges found",
          ...result,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Challenges retrieved successfully",
        ...result, // Incluye data y meta
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  async getSubmissionsByChallenge(req: Request, res: Response) {
    try {
      const { id_challenge, id_company } = req.params;

      // validate type
      if (!z.uuid().safeParse(id_company).success) {
        return res
          .status(400)
          .json({ message: "A valid UUID for Company ID is required" });
      }
      // call services
      const result = await this.challengesServices.getChallengeSubmissions(
        id_challenge,
        id_company,
      );

      //
      if (result.length === 0) {
        return res.status(200).json({
          success: true,
          message: "No submissions found for this challenge",
          data: [],
        });
      }

      // 4
      return res.status(200).json({
        success: true,
        message: "Challenge submissions retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }

  async evaluateChallenges(req: Request, res: Response) {
    try {
      const { id_submission } = req.params;
      // valid
      if (!z.uuid().safeParse(id_submission).success) {
        return res
          .status(400)
          .json({ message: "A valid UUID for submission ID is required" });
      }
      // call services
      const evaluation =
        await this.challengesServices.technicalEvaluation(id_submission);

      return res.status(200).json({
        message: "Automated evaluation completed successfully",
        data: {
          submission_id: evaluation.id,
          score: evaluation.score,
          feedback: evaluation.ai_feedback,
          status: evaluation.status,
        },
      });
    } catch (error: any) {
      this.handleError(res, error);
    }
  }
  // =========================
  // handle error
  // ========================
  private handleError(res: Response, error: any) {
    if (error instanceof ZodError) {
      return res.status(400).json({
        message: "Validation error",
        errors: error.issues.map((e) => ({
          path: e.path.join("."),
          message: e.message,
        })),
      });
    }

    return res.status(500).json({
      message: error.message ?? "Internal server error",
    });
  }
}
