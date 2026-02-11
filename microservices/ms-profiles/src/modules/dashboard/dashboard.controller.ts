import { Request, Response } from "express";
import { DashboardService } from "./dashboard.service";
import { prisma } from "../../lib/prisma";

const dashboardService = new DashboardService();

export class DashboardController {
  async getFirstChallenges(req: Request, res: Response) {
    try {
      const challenges = await dashboardService.getFirstChallenges();
      return res.status(200).json(challenges);
    } catch (error) {
      console.error("GET_DASHBOARD_CHALLENGES_ERROR", error);
      return res.status(500).json({
        message: "FAILED_TO_FETCH_DASHBOARD_CHALLENGES",
      });
    }
  }
  async getFeedPosts(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      const posts = await dashboardService.getAllPosts(userId);

      return res.status(200).json(posts);
    } catch (error) {
      console.error("GET_DASHBOARD_FEED_ERROR", error);
      return res.status(500).json({
        message: "FAILED_TO_FETCH_DASHBOARD_FEED",
      });
    }
  }
  async getDashboardStats(req: Request, res: Response) {
    try {
      const userId = req.user?.id;

      if (!userId) {
        return res.status(401).json({ message: "UNAUTHORIZED" });
      }

      const stats = await dashboardService.getDashboardStats(userId);

      return res.status(200).json(stats);
    } catch (error) {
      console.error("GET_DASHBOARD_STATS_ERROR", error);

      return res.status(500).json({
        message: "FAILED_TO_FETCH_DASHBOARD_STATS",
      });
    }
  }
}
