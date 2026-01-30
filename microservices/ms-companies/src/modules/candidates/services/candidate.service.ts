import { prisma } from "../../../lib/prisma";
import { CandidateResponse } from "../dto/candidateResponse.dto";

export class CandidateService {
  async getMyCandidates(
    userId: string,
    page: number = 1,
    pageSize: number = 10
  ): Promise<{
    data: CandidateResponse[];
    pagination: {
      page: number;
      pageSize: number;
      total: number;
      totalPages: number;
    };
  }> {
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

    const rows = await prisma.$queryRaw<
      (CandidateResponse & { total_count: number })[]
    >`
      select *
      from public.get_company_candidates(
        ${userId}::uuid,
        ${page}::int,
        ${pageSize}::int
      );
    `;

    const total = rows.length ? Number(rows[0].total_count) : 0;

    return {
      data: rows.map(({ total_count, ...candidate }) => candidate),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }
}
