import { Response } from "express";
import { CandidateService } from "../services/candidate.service";
import { AuthRequest } from "../../../types/auth-request";

const candidateService = new CandidateService();

export class CandidateController {
  async getMyCandidates(req: AuthRequest, res: Response) {
    try {
      const userId = req.user!.userId;

      const page = Number(req.query.page) || 1;
      const pageSize = Number(req.query.pageSize) || 10;

      const result = await candidateService.getMyCandidates(
        userId,
        page,
        pageSize
      );

      return res.status(200).json(result);
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
