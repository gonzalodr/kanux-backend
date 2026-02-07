import { prisma } from "../../lib/prisma";
import {
  ScoreRange,
  TalentAnalyticsDashboard,
  TalentAnalyticsSummary,
  TalentChallengePerformance,
  TalentCompanyContact,
} from "../../types/analytics.types";
import {
  buildScoreDistribution,
  buildStatChange,
} from "../../helpers/analytics.helpers";

export class TalentAnalyticsService {
  private async getTalentProfileIdByUser(userId: string): Promise<string> {
    const user = await prisma.users.findUnique({ where: { id: userId } });

    if (!user || user.user_type !== "talent") {
      throw new Error("Unauthorized: talent access only");
    }

    const talentProfile = await prisma.talent_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!talentProfile) {
      throw new Error("Talent profile not found");
    }

    return talentProfile.id;
  }

  async getDashboard(userId: string): Promise<TalentAnalyticsDashboard> {
    const talentProfileId = await this.getTalentProfileIdByUser(userId);

    const now = new Date();
    const currentFrom = new Date(now);
    currentFrom.setDate(now.getDate() - 30);

    const previousFrom = new Date(currentFrom);
    previousFrom.setDate(currentFrom.getDate() - 30);

    const [summary, previousSummary, topChallenges, scoreRows, companies] =
      await Promise.all([
        this.getSummary(talentProfileId, currentFrom, now),
        this.getSummary(talentProfileId, previousFrom, currentFrom),
        this.getTopChallenges(talentProfileId, currentFrom, now),
        this.getScoreDistribution(talentProfileId, currentFrom, now),
        this.getContactedCompanies(talentProfileId),
      ]);

    return {
      summary,
      summaryChanges: {
        totalSubmissions: buildStatChange(
          summary.totalSubmissions,
          previousSummary.totalSubmissions,
        ),
        avgScore: buildStatChange(summary.avgScore, previousSummary.avgScore),
        contactedCompanies: buildStatChange(
          summary.contactedCompanies,
          previousSummary.contactedCompanies,
        ),
      },
      topChallenges,
      scoreDistribution: buildScoreDistribution(scoreRows),
      contactedCompanies: companies,
    };
  }

  private async getSummary(
    talentProfileId: string,
    from: Date,
    to: Date,
  ): Promise<TalentAnalyticsSummary> {
    const [totalSubmissions, avgScore, maxScore, contactedCompanies] =
      await Promise.all([
        prisma.challenge_submissions.count({
          where: {
            id_profile: talentProfileId,
            created_at: { gte: from, lt: to },
          },
        }),
        prisma.challenge_submissions.aggregate({
          _avg: { score: true },
          where: {
            id_profile: talentProfileId,
            created_at: { gte: from, lt: to },
            score: { not: null },
          },
        }),
        prisma.challenge_submissions.aggregate({
          _max: { score: true },
          where: {
            id_profile: talentProfileId,
            created_at: { gte: from, lt: to },
            score: { not: null },
          },
        }),
        this.getContactedCompaniesCount(talentProfileId, from, to),
      ]);

    return {
      totalSubmissions,
      avgScore: avgScore._avg.score ? Math.round(avgScore._avg.score) : 0,
      bestScore: maxScore._max.score ?? 0,
      contactedCompanies,
    };
  }

  private async getTopChallenges(
    talentProfileId: string,
    from: Date,
    to: Date,
  ): Promise<TalentChallengePerformance[]> {
    return prisma.$queryRaw<TalentChallengePerformance[]>`
      SELECT
        c.id as "challengeId",
        c.title,
        AVG(cs.score)::int as "avgScore",
        MAX(cs.score)::int as "bestScore",
        COUNT(cs.id)::int as attempts
      FROM challenge_submissions cs
      JOIN challenges c ON c.id = cs.challenge_id
      WHERE cs.id_profile = ${talentProfileId}::uuid
        AND cs.score IS NOT NULL
        AND cs.created_at >= ${from}
        AND cs.created_at < ${to}
      GROUP BY c.id, c.title
      ORDER BY "avgScore" DESC, attempts DESC
      LIMIT 5;
    `;
  }

  private async getScoreDistribution(
    talentProfileId: string,
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
      WHERE cs.id_profile = ${talentProfileId}::uuid
        AND cs.score IS NOT NULL
        AND cs.created_at >= ${from}
        AND cs.created_at < ${to}
      GROUP BY range;
    `;
  }

  private async getContactedCompanies(
    talentProfileId: string,
  ): Promise<TalentCompanyContact[]> {
    return prisma.$queryRaw<TalentCompanyContact[]>`
      SELECT
        c.id,
        c.name,
        conv.last_message_at as "lastMessageAt"
      FROM conversations conv
      JOIN company c ON c.id = conv.company_id
      WHERE conv.id_profile = ${talentProfileId}::uuid
      ORDER BY conv.last_message_at DESC NULLS LAST, conv.created_at DESC
      LIMIT 5;
    `;
  }

  private async getContactedCompaniesCount(
    talentProfileId: string,
    from: Date,
    to: Date,
  ): Promise<number> {
    const rows = await prisma.$queryRaw<{ total: number }[]>`
      SELECT
        COUNT(DISTINCT conv.company_id)::int as total
      FROM conversations conv
      WHERE conv.id_profile = ${talentProfileId}::uuid
        AND COALESCE(conv.last_message_at, conv.created_at) >= ${from}
        AND COALESCE(conv.last_message_at, conv.created_at) < ${to};
    `;

    return rows[0]?.total ?? 0;
  }
}
