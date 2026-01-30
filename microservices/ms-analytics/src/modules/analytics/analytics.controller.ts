import { Request, Response } from "express";
import { AnalyticsService } from "./analytics.service";

const analyticsService = new AnalyticsService();

export class AnalyticsController {
  static async getDashboard(req: Request, res: Response) {
    try {
      const userId = "acf58b47-28a9-435a-b149-ce0c0eacf73a";

      if (!userId) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      const data = await analyticsService.getDashboard(userId);

      return res.status(200).json({
        success: true,
        data,
      });
    } catch (error: any) {
      console.error("Analytics dashboard error:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Internal server error",
      });
    }
  }
}
