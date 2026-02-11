import { prisma } from "../../../lib/prisma";
import { CandidateResponse } from "../dto/candidateResponse.dto";

export class CandidateService {
  async getMyCandidates(
    userId: string,
    page: number = 1,
    pageSize: number = 10,
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
  async getMyCandidatesFiltered(
    userId: string,
    filters: {
      searchText?: string;
      skill?: string;
      learningBackgroundId?: string;
    },
    page: number = 1,
    pageSize: number = 10,
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
      from public.get_company_candidates_filtered(
        ${userId}::uuid,
        ${filters.searchText ?? null}::text,
        ${filters.skill ?? null}::text,
        ${filters.learningBackgroundId ?? null}::uuid,
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
  async getAllBackground() {
    const learningBackgrounds = await prisma.learning_backgrounds.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return learningBackgrounds;
  }
  async getTalentProfileSummaryByCompany(
    userId: string,
    talentProfileId: string,
  ): Promise<{
    talent_id: string;
    talent_profile: any;
    skills: any[];
    avg_score: number | null;
    allowed: boolean;
  } | null> {
    const comp = await prisma.company.findUnique({
      where: { id: userId },
    });
    if (!comp) {
      throw new Error("COMP_NOT_FOUND");
    }

    const rows = await prisma.$queryRaw<
      {
        talent_id: string;
        talent_profile: any;
        skills: any[];
        avg_score: number | null;
        total_count: number;
      }[]
    >`
      select *
      from public.get_talent_profile_summary_by_company(
        ${talentProfileId}::uuid,
        ${userId}::uuid
      );
    `;

    if (!rows.length) return null;
    const allowed = await consumeProfileView(userId);

    const { total_count, ...data } = rows[0];

    return {
      allowed,
      ...data
    };
  }
}

export async function consumeProfileView(companyId: string): Promise<boolean> {
  const result = await prisma.$queryRaw<{ allowed: boolean }[]>`
   select  public.consume_company_profile_view(${companyId}::uuid) as allowed
  `;
console.log("result");
  return result[0]?.allowed ?? false;
}

