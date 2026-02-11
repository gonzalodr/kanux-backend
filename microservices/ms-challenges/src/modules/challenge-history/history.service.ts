import { prisma } from "../../lib/prisma";

export class ChallengeHistoryService {
  /**
   * Get unified challenge history for a talent user.
   * Returns all evaluated challenges (technical and non-technical) in a single list.
   */
  async getMyHistory(userId: string, page = 1, limit = 10) {
    // Get talent profile
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { talent_profiles: true },
    });

    if (!user || !user.talent_profiles) {
      throw new Error("USER_NOT_TALENT");
    }

    const skip = (page - 1) * limit;

    // Fetch all evaluated submissions with pagination
    const [submissions, total] = await prisma.$transaction([
      prisma.challenge_submissions.findMany({
        where: {
          id_profile: user.talent_profiles.id,
          status: "evaluated",
        },
        include: {
          challenges: {
            select: {
              id: true,
              title: true,
              description: true,
              challenge_type: true,
              difficulty: true,
              duration_minutes: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.challenge_submissions.count({
        where: {
          id_profile: user.talent_profiles.id,
          status: "evaluated",
        },
      }),
    ]);

    return {
      data: submissions.map((submission) => ({
        submission_id: submission.id,
        challenge: {
          id: submission.challenges?.id,
          title: submission.challenges?.title,
          description: submission.challenges?.description,
          type: submission.challenges?.challenge_type,
          difficulty: submission.challenges?.difficulty,
          duration_minutes: submission.challenges?.duration_minutes,
        },
        score: submission.score ?? 0,
        status: submission.status,
        evaluation_type: submission.evaluation_type,
        submitted_at: submission.created_at,
      })),
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get history filtered by challenge type.
   * Useful for specific views (only technical or only non-technical).
   */
  async getHistoryByType(
    userId: string,
    challengeType: "Técnico" | "No Técnico",
    page = 1,
    limit = 10,
  ) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { talent_profiles: true },
    });

    if (!user || !user.talent_profiles) {
      throw new Error("USER_NOT_TALENT");
    }

    const skip = (page - 1) * limit;

    const [submissions, total] = await prisma.$transaction([
      prisma.challenge_submissions.findMany({
        where: {
          id_profile: user.talent_profiles.id,
          status: "evaluated",
          challenges: {
            challenge_type: challengeType,
          },
        },
        include: {
          challenges: {
            select: {
              id: true,
              title: true,
              description: true,
              challenge_type: true,
              difficulty: true,
              duration_minutes: true,
            },
          },
        },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.challenge_submissions.count({
        where: {
          id_profile: user.talent_profiles.id,
          status: "evaluated",
          challenges: {
            challenge_type: challengeType,
          },
        },
      }),
    ]);

    return {
      data: submissions.map((submission) => ({
        submission_id: submission.id,
        challenge: {
          id: submission.challenges?.id,
          title: submission.challenges?.title,
          description: submission.challenges?.description,
          type: submission.challenges?.challenge_type,
          difficulty: submission.challenges?.difficulty,
          duration_minutes: submission.challenges?.duration_minutes,
        },
        score: submission.score ?? 0,
        status: submission.status,
        evaluation_type: submission.evaluation_type,
        submitted_at: submission.created_at,
      })),
      meta: {
        total,
        page,
        limit,
        total_pages: Math.ceil(total / limit),
      },
    };
  }
}
