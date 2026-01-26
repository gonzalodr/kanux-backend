import { Request, Response } from "express";
import { ChallengeHistoryService } from "./history.service";

const historyService = new ChallengeHistoryService();

export class ChallengeHistoryController {
  /**
   * GET /api/challenges/history/my
   * Returns all evaluated challenges for the current user (both technical and non-technical)
   */
  async getMyHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const history = await historyService.getMyHistory(userId, page, limit);

      return res.status(200).json({
        message: "Challenge history retrieved successfully",
        ...history,
      });
    } catch (error: any) {
      console.error("Error getting challenge history:", error);
      return res.status(500).json({
        message: error.message || "Error retrieving challenge history",
      });
    }
  }

  /**
   * GET /api/challenges/history/my/technical
   * Returns only technical challenges for the current user
   */
  async getMyTechnicalHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const history = await historyService.getHistoryByType(
        userId,
        "Técnico",
        page,
        limit,
      );

      return res.status(200).json({
        message: "Technical challenge history retrieved successfully",
        ...history,
      });
    } catch (error: any) {
      console.error("Error getting technical challenge history:", error);
      return res.status(500).json({
        message:
          error.message || "Error retrieving technical challenge history",
      });
    }
  }

  /**
   * GET /api/challenges/history/my/non-technical
   * Returns only non-technical challenges for the current user
   */
  async getMyNonTechnicalHistory(req: Request, res: Response) {
    try {
      const userId = (req as any).user?.id;
      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;

      const history = await historyService.getHistoryByType(
        userId,
        "No Técnico",
        page,
        limit,
      );

      return res.status(200).json({
        message: "Non-technical challenge history retrieved successfully",
        ...history,
      });
    } catch (error: any) {
      console.error("Error getting non-technical challenge history:", error);
      return res.status(500).json({
        message:
          error.message || "Error retrieving non-technical challenge history",
      });
    }
  }
}
