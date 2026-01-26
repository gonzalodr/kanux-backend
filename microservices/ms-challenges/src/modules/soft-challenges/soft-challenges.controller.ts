import { Request, Response } from "express";
import { SoftChallengesService } from "./soft-challenges.service";
import { serializeBigInt } from "../../lib/serialize";
import { SubmitChallengeSchema } from "./dto/submit-challenge.dto";
import { ZodError } from "zod";

const softChallengesService = new SoftChallengesService();

export class SoftChallengesController {
  async listChallenges(req: Request, res: Response) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 10;

      const result = await softChallengesService.findAll(page, limit);
      res.status(200).json(serializeBigInt(result));
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  }

  async getChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params;

      const challenge = await softChallengesService.findById(id);
      res.status(200).json(serializeBigInt(challenge));
    } catch (error: any) {
      res.status(404).json({ message: error.message });
    }
  }

  async submitChallenge(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const payload = SubmitChallengeSchema.parse(req.body);

      const result = await softChallengesService.submit(id, payload);

      res.status(201).json(result); // created submission
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

      res.status(400).json({ message: error.message });
    }
  }

  async getMyChallengeHistory(req: Request, res: Response) {
    try {
      const userId = req.user!.id;

      const history = await softChallengesService.getMyChallengeHistory(userId);

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
