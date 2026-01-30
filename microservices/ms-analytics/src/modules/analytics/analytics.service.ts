import { prisma } from "../../lib/prisma";

export class AnalyticsService {
  // Helpers
  private async getCompanyIdByUser(userId: string): Promise<string> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

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

  // Public API
  async getDashboard(userId: string) {
    const companyId = await this.getCompanyIdByUser(userId);

    const [
      summary,
      challengePerformance,
      scoreDistribution,
      topCandidates,
      candidateQuality,
    ] = await Promise.all([
      this.getSummary(companyId),
      this.getChallengePerformance(companyId),
      this.getScoreDistribution(companyId),
      this.getTopCandidates(companyId),
      this.getCandidateQuality(companyId),
    ]);

    return {
      summary,
      challengePerformance,
      scoreDistribution,
      topCandidates,
      candidateQuality,
    };
  }

  // Summary
  private async getSummary(companyId: string) {
    const [totalSubmissions, totalChallenges, avgScore, maxScore] =
      await Promise.all([
        prisma.challenge_submissions.count({
          where: {
            challenges: {
              created_by_company: companyId,
            },
          },
        }),
        prisma.challenges.count({
          where: {
            created_by_company: companyId,
          },
        }),
        prisma.challenge_submissions.aggregate({
          _avg: { score: true },
          where: {
            challenges: {
              created_by_company: companyId,
            },
            score: { not: null },
          },
        }),
        prisma.challenge_submissions.aggregate({
          _max: { score: true },
          where: {
            challenges: {
              created_by_company: companyId,
            },
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

  // Performance por Challenge
  private async getChallengePerformance(companyId: string) {
    return prisma.$queryRaw<
      {
        challengeId: string;
        title: string;
        avgScore: number;
        submissions: number;
      }[]
    >`
    SELECT
      c.id as "challengeId",
      c.title,
      AVG(cs.score)::int as "avgScore",
      COUNT(cs.id)::int as submissions
    FROM challenges c
    JOIN challenge_submissions cs ON cs.challenge_id = c.id
    WHERE c.created_by_company = ${companyId}::uuid
      AND cs.score IS NOT NULL
    GROUP BY c.id, c.title
    ORDER BY 3 DESC
    LIMIT 5;
  `;
  }

  // Score Distribution
  private async getScoreDistribution(companyId: string) {
    const rows = await prisma.$queryRaw<{ range: string; total: number }[]>`
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
      GROUP BY range;
    `;

    interface ScoreDistributionRow {
      range: string;
      total: number;
    }

    return rows.reduce(
      (acc: Record<string, number>, r: ScoreDistributionRow) => {
        acc[r.range] = r.total;
        return acc;
      },
      {},
    );
  }

  // Top Performing Candidates
  private async getTopCandidates(companyId: string) {
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
        CONCAT(tp.first_name, ' ', tp.last_name) as name,
        MAX(cs.score)::int as score,
        ARRAY_AGG(DISTINCT s.name) as skills
      FROM talent_profiles tp
      JOIN challenge_submissions cs ON cs.id_profile = tp.id
      JOIN challenges c ON c.id = cs.challenge_id
      LEFT JOIN skills s ON s.id_profile = tp.id
      WHERE c.created_by_company = ${companyId}::uuid
        AND cs.score IS NOT NULL
      GROUP BY tp.id, tp.first_name, tp.last_name
      ORDER BY score DESC
      LIMIT 5;
    `;
  }

  // Candidate Quality Tiers
  private async getCandidateQuality(companyId: string) {
    const rows = await prisma.$queryRaw<
      {
        tier: string;
        total: number;
      }[]
    >`
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
    GROUP BY cs.id_profile;
  `;

    return rows.reduce(
      (
        acc: Record<string, number>,
        r: { tier: string | number; total: number },
      ) => {
        acc[r.tier] = (acc[r.tier] ?? 0) + r.total;
        return acc;
      },
      { high: 0, medium: 0, low: 0 },
    );
  }
}
