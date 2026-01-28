import { Request, Response } from "express";
import { CandidateService } from "../services/candidate.service";
import { AuthRequest } from "../../../types/auth-request";

const candidateService = new CandidateService();

export class CandidateController {
  async getMyCandidates(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const candidates = await candidateService.getMyCandidates(userId);

      return res.status(200).json({
        data: candidates,
      });
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      if (error.message === "USER_NOT_ALLOWED") {
        return res.status(403).json({
          message: "No tienes permisos para ver candidatos",
        });
      }

      return res.status(500).json({
        message: "Unexpected error",
      });
    }
  }
}
