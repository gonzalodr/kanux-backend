import { prisma } from "../../../lib/prisma";
import { CandidateResponse } from "../dto/candidateResponse.dto";

export class CandidateService {
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
      from public.get_company_candidates(${userId}::uuid);
    `;

    return candidates;
  }
}
