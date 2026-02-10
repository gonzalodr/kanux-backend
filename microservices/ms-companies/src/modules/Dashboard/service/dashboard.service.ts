import { prisma } from "../../../lib/prisma";
import { CandidateResponse } from "../../candidates/dto/candidateResponse.dto";

export interface CompanyProfileViewsStatus {
  viewsUsed: number;
  maxViews: number;
  periodStart: string;
  periodEnd: string;
}

export class DashboardService {
  async getCompanyDashboardStats(userId: string) {
    const result = await prisma.$queryRaw<
      {
        total_challenges: bigint;
        total_talents_participated: bigint;
        unread_messages: bigint;
        total_users_participated: bigint;
      }[]
    >`
      select *
      from public.get_company_dashboard_stats(${userId}::uuid);
    `;

    const stats = result[0];

    return {
      totalChallenges: Number(stats.total_challenges),
      totalTalentsParticipated: Number(stats.total_talents_participated),
      unreadMessages: Number(stats.unread_messages),
      totalUsersParticipated: Number(stats.total_users_participated),
    };
  }

  async getMyCandidates(userId: string): Promise<CandidateResponse[]> {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      select: {
        id: true,
        user_type: true,
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    if (user.user_type !== "company") {
      throw new Error("USER_NOT_ALLOWED");
    }

    const candidates = await prisma.$queryRaw<CandidateResponse[]>`
        select *
        from public.get_company_candidates_basic(${userId}::uuid);
      `;

    return candidates;
  }
  async getProfileViewsStatus(
    userId: string,
  ): Promise<CompanyProfileViewsStatus | null> {
    const comp = await prisma.company.findUnique({
      where: { id_user: userId },
    });

    if (!comp) {
      throw new Error("COMP_NOT_FOUND");
    }

    const result = await prisma.$queryRaw<
      {
        views_used: number;
        max_views: number;
        period_start: Date;
        period_end: Date;
      }[]
    >`
      select *
      from public.get_company_profile_views_status(
        ${comp?.id}::uuid
      );
    `;

    if (!result.length) return null;

    const row = result[0];

    return {
      viewsUsed: Number(row.views_used ?? 0),
      maxViews: Number(row.max_views ?? 0),
      periodStart: row.period_start.toISOString(),
      periodEnd: row.period_end.toISOString(),
    };
  }
}
