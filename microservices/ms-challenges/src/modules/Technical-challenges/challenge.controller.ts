import { Request, Response } from "express";
import { ZodError } from "zod";
import { ChallengeService } from "./challenge.service";
import {
  StartTechnicalChallengeSchema,
  SubmitTechnicalChallengeSchema,
} from "./schema/submission.schema";

const challengeService = new ChallengeService();

export class ChallengeController {
  async startTechnicalChallenge(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const { challengeId } = req.params;

      const payload = StartTechnicalChallengeSchema.parse({
        challenge_id: challengeId,
      });

      const result = await challengeService.startTechnicalChallenge(
        userId,
        payload,
      );

      return res.status(200).json({
        message: "Reto técnico iniciado correctamente.",
        data: result,
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          message: "Validation error",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }
      if (error.message === "USER_NOT_TALENT") {
        return res.status(403).json({
          message: "El usuario no tiene un perfil de talento",
        });
      }

      if (error.message === "CHALLENGE_NOT_FOUND") {
        return res.status(404).json({
          message: "El reto no existe",
        });
      }

      if (error.message === "INVALID_CHALLENGE_TYPE") {
        return res.status(400).json({
          message: "El reto no es de tipo técnico",
        });
      }

      return res.status(500).json({
        message: "Unexpected error",
      });
    }
  }

  async submitTechnicalChallenge(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const payload = SubmitTechnicalChallengeSchema.parse({
        submission_id: req.params.challengeId,
        programming_language: req.body.programming_language,
        source_code: req.body.source_code,
      });

      const result = await challengeService.submitTechnicalChallenge(
        userId,
        payload,
      );

      return res.status(200).json({
        message: "Solución enviada correctamente.",
        data: result,
      });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          message: "Validation error",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      if (error.message === "USER_NOT_TALENT") {
        return res.status(403).json({
          message: "El usuario no tiene un perfil de talento",
        });
      }

      if (error.message === "SUBMISSION_NOT_FOUND") {
        return res.status(404).json({
          message: "La submission no existe",
        });
      }

      if (error.message === "UNAUTHORIZED_SUBMISSION") {
        return res.status(403).json({
          message: "No tienes permisos para esta submission",
        });
      }

      if (error.message === "SUBMISSION_NOT_ACTIVE") {
        return res.status(400).json({
          message: "La submission no está activa",
        });
      }

      return res.status(500).json({
        message: "Unexpected error",
      });
    }
  }
  async getMyChallengeHistory(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const history = await challengeService.getTalentChallengeHistory(userId);

      return res.status(200).json({
        message: "Historial de retos obtenido correctamente",
        data: history,
      });
    } catch (error: any) {
      if (error.message === "USER_NOT_TALENT") {
        return res.status(403).json({
          message: "El usuario no tiene un perfil de talento",
        });
      }

      return res.status(500).json({
        message: "Unexpected error",
      });
    }
  }
}
