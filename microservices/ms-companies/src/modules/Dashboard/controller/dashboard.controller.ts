import { Request, Response } from "express";
import { DashboardService } from "../service/dashboard.service";
import { AuthRequest } from "../../../types/auth-request";

const dashboardService = new DashboardService();

export class DashboardController {
  async getCompanyDashboard(req: AuthRequest, res: Response) {
    try {
      const userId = req.user?.userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const stats = await dashboardService.getCompanyDashboardStats(userId);
      return res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        message: error.message || "Error fetching dashboard stats",
      });
    }
  }
}
