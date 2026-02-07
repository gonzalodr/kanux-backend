import { Request, Response } from "express";
import { TalentAnalyticsService } from "./talent-analytics.service";

const talentAnalyticsService = new TalentAnalyticsService();

export class TalentAnalyticsController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const data = await talentAnalyticsService.getDashboard(userId);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error("Talent analytics dashboard error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
