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
   async getMyCandidatesFiltered(req: AuthRequest, res: Response) {
  try {
    const userId = req.user!.userId;

    const page = Number(req.query.page) || 1;
    const pageSize = Number(req.query.pageSize) || 10;

    const searchText =
      typeof req.query.search === "string" ? req.query.search : undefined;

    const skill =
      typeof req.query.skill === "string" ? req.query.skill : undefined;

    const learningBackgroundId =
      typeof req.query.learningBackgroundId === "string"
        ? req.query.learningBackgroundId
        : undefined;


    const result = await candidateService.getMyCandidatesFiltered(
      userId,
      {
        searchText,
        skill,
        learningBackgroundId, 
      },
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
async getAll(req: AuthRequest, res: Response) {
    try {
      const data = await candidateService.getAllBackground();

      return res.status(200).json({
        data,
      });
    } catch (error) {
      return res.status(500).json({
        message: "Unexpected error",
      });
    }
  }
    async getTalentProfileSummary(req: AuthRequest, res: Response) {
    try {
      const { compId, talentProfileId } = req.params;

      if (!talentProfileId) {
        return res.status(400).json({
          message: "talentProfileId is required",
        });
      }

      const result =
        await candidateService.getTalentProfileSummaryByCompany(
          compId,
          talentProfileId
        );

      if (!result) {
        return res.status(404).json({
          message: "Talent profile not found",
        });
      }

      return res.status(200).json(result);

    } catch (error: any) {

      if (error.message === "COMP_NOT_FOUND") {
        return res.status(404).json({
          message: "Empresa no encontrada",
        });
      }

      if (error.message === "USER_NOT_ALLOWED") {
        return res.status(403).json({
          message: "No tienes permisos para ver este talento",
        });
      }

      return res.status(500).json({
        message: "Unexpected error",
      });
    }
  }
}
