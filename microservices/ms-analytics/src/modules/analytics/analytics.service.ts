// analytics.service.ts

import { prisma } from "../../lib/prisma";
import {
  AnalyticsDashboard,
  AnalyticsSummary,
  ChallengePerformance,
  ScoreRange,
  CandidateQualityTier,
} from "../../types/analytics.types";
import {
  buildScoreDistribution,
  buildCandidateQuality,
  buildStatChange,
} from "../../helpers/analytics.helpers";

export class AnalyticsService {
  private async getCompanyIdByUser(userId: string): Promise<string> {
    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user || user.user_type !== "company") {
      throw new Error("Unauthorized: company access only");
    }

    const company = await prisma.company.findUnique({
      where: { id_user: userId },
    });

    if (!company) {
      throw new Error("Company profile not found");
    }

    return company.id;
  }

  async getDashboard(userId: string): Promise<AnalyticsDashboard> {
    const companyId = await this.getCompanyIdByUser(userId);

    const now = new Date();
    const currentFrom = new Date(now);
    currentFrom.setDate(now.getDate() - 30);

    const previousFrom = new Date(currentFrom);
    previousFrom.setDate(currentFrom.getDate() - 30);

    const [
      summary,
      previousSummary,
      challengePerformance,
      scoreDistributionRows,
      topCandidates,
      candidateQualityRows,
    ] = await Promise.all([
      this.getSummary(companyId, currentFrom, now),
      this.getSummary(companyId, previousFrom, currentFrom),
      this.getChallengePerformance(companyId, currentFrom, now),
      this.getScoreDistribution(companyId, currentFrom, now),
      this.getTopCandidates(companyId, currentFrom, now),
      this.getCandidateQuality(companyId, currentFrom, now),
    ]);

    return {
      summary,
      summaryChanges: {
        totalCandidates: buildStatChange(
          summary.totalCandidates,
          previousSummary.totalCandidates,
        ),
        completionRate: buildStatChange(
          summary.completionRate,
          previousSummary.completionRate,
        ),
        activeChallenges: buildStatChange(
          summary.activeChallenges,
          previousSummary.activeChallenges,
        ),
      },
      challengePerformance,
      scoreDistribution: buildScoreDistribution(scoreDistributionRows),
      topCandidates,
      candidateQuality: buildCandidateQuality(candidateQualityRows),
    };
  }

  private async getSummary(
    companyId: string,
    from: Date,
    to: Date,
  ): Promise<AnalyticsSummary> {
    const [totalSubmissions, totalChallenges, avgScore, maxScore] =
      await Promise.all([
        prisma.challenge_submissions.count({
          where: {
            created_at: { gte: from, lt: to },
            challenges: { created_by_company: companyId },
          },
        }),
        prisma.challenges.count({
          where: {
            created_by_company: companyId,
            created_at: { gte: from, lt: to },
          },
        }),
        prisma.challenge_submissions.aggregate({
          _avg: { score: true },
          where: {
            created_at: { gte: from, lt: to },
            challenges: { created_by_company: companyId },
            score: { not: null },
          },
        }),
        prisma.challenge_submissions.aggregate({
          _max: { score: true },
          where: {
            created_at: { gte: from, lt: to },
            challenges: { created_by_company: companyId },
            score: { not: null },
          },
        }),
      ]);

    return {
      totalCandidates: totalSubmissions,
      activeChallenges: totalChallenges,
      completionRate: avgScore._avg.score ? Math.round(avgScore._avg.score) : 0,
      topMatchScore: maxScore._max.score ?? 0,
    };
  }

  private async getChallengePerformance(
    companyId: string,
    from: Date,
    to: Date,
  ): Promise<ChallengePerformance[]> {
    return prisma.$queryRaw<ChallengePerformance[]>`
      SELECT
        c.id as "challengeId",
        c.title,
        AVG(cs.score)::int as "avgScore",
        COUNT(cs.id)::int as submissions
      FROM challenges c
      JOIN challenge_submissions cs ON cs.challenge_id = c.id
      WHERE c.created_by_company = ${companyId}::uuid
        AND cs.score IS NOT NULL
        AND cs.created_at >= ${from}
        AND cs.created_at < ${to}
      GROUP BY c.id, c.title
      ORDER BY "avgScore" DESC
      LIMIT 5;
    `;
  }

  private async getScoreDistribution(
    companyId: string,
    from: Date,
    to: Date,
  ): Promise<{ range: ScoreRange; total: number }[]> {
    return prisma.$queryRaw<{ range: ScoreRange; total: number }[]>`
      SELECT
        CASE
          WHEN cs.score >= 90 THEN '90-100'
          WHEN cs.score >= 80 THEN '80-89'
          WHEN cs.score >= 70 THEN '70-79'
          WHEN cs.score >= 60 THEN '60-69'
          ELSE 'below-60'
        END AS range,
        COUNT(*)::int as total
      FROM challenge_submissions cs
      JOIN challenges c ON c.id = cs.challenge_id
      WHERE c.created_by_company = ${companyId}::uuid
        AND cs.score IS NOT NULL
        AND cs.created_at >= ${from}
        AND cs.created_at < ${to}
      GROUP BY range;
    `;
  }

  private async getTopCandidates(companyId: string, from: Date, to: Date) {
    return prisma.$queryRaw<
      {
        id: string;
        name: string;
        score: number;
        skills: string[];
      }[]
    >`
      SELECT
        tp.id,
        TRIM(CONCAT(tp.first_name, ' ', tp.last_name)) as name,
        MAX(cs.score)::int as score,
        ARRAY_REMOVE(ARRAY_AGG(DISTINCT s.name), NULL) as skills
      FROM talent_profiles tp
      JOIN challenge_submissions cs ON cs.id_profile = tp.id
      JOIN challenges c ON c.id = cs.challenge_id
      LEFT JOIN skills s ON s.id_profile = tp.id
      WHERE c.created_by_company = ${companyId}::uuid
        AND cs.score IS NOT NULL
        AND cs.created_at >= ${from}
        AND cs.created_at < ${to}
      GROUP BY tp.id, tp.first_name, tp.last_name
      ORDER BY score DESC
      LIMIT 5;
    `;
  }

  private async getCandidateQuality(
    companyId: string,
    from: Date,
    to: Date,
  ): Promise<{ tier: CandidateQualityTier; total: number }[]> {
    return prisma.$queryRaw<{ tier: CandidateQualityTier; total: number }[]>`
      SELECT
        CASE
          WHEN MAX(cs.score) >= 85 THEN 'high'
          WHEN MAX(cs.score) >= 70 THEN 'medium'
          ELSE 'low'
        END as tier,
        COUNT(*)::int as total
      FROM challenge_submissions cs
      JOIN challenges c ON c.id = cs.challenge_id
      WHERE c.created_by_company = ${companyId}::uuid
        AND cs.score IS NOT NULL
        AND cs.created_at >= ${from}
        AND cs.created_at < ${to}
      GROUP BY cs.id_profile;
    `;
  }
}
