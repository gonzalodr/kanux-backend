import { prisma } from "../../../lib/prisma";

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
}
