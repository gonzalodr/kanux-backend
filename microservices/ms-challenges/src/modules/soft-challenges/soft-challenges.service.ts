import { prisma } from "../../lib/prisma";
export class SoftChallengesService {
  async findAll(page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [challenges, total] = await prisma.$transaction([
      prisma.challenges.findMany({
        where: {
          challenge_type: "No Técnico",
        },
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          duration_minutes: true,
          created_at: true,
        },
        orderBy: {
          created_at: "desc",
        },
        skip,
        take: limit,
      }),
      prisma.challenges.count({
        where: {
          challenge_type: "No Técnico",
        },
      }),
    ]);

    return {
      data: challenges,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  async findById(challengeId: string) {
    const challenge = await prisma.challenges.findUnique({
      where: {
        id: challengeId,
      },
      include: {
        non_technical_challenges: {
          include: {
            non_technical_questions: {
              orderBy: {
                id: "asc",
              },
              include: {
                non_technical_question_options: {
                  select: {
                    id: true,
                    option_text: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!challenge || challenge.challenge_type !== "No Técnico") {
      throw new Error("Soft challenge not found");
    }

    return challenge;
  }
}
