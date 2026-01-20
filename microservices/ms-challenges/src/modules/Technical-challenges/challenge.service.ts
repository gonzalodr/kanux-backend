import { prisma } from "../../lib/prisma";
import {
  StartTechnicalChallengeDto,
  SubmitTechnicalChallengeDto,
} from "./dto/start-schema-challenge.dto";

export class ChallengeService {
  async startTechnicalChallenge(
    userId: string,
    payload: StartTechnicalChallengeDto,
  ) {
    const { challenge_id } = payload;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        talent_profiles: true,
      },
    });

    if (!user || !user.talent_profiles) {
      throw new Error("USER_NOT_TALENT");
    }
    const challenge = await prisma.challenges.findUnique({
      where: { id: challenge_id },
      select: {
        id: true,
        challenge_type: true,
      },
    });

    if (!challenge) {
      throw new Error("CHALLENGE_NOT_FOUND");
    }

    if (challenge.challenge_type !== "Técnico") {
      throw new Error("INVALID_CHALLENGE_TYPE");
    }
    const existingSubmission = await prisma.challenge_submissions.findFirst({
      where: {
        challenge_id,
        id_profile: user.talent_profiles.id,
        status: {
          in: ["started", "submitted"],
        },
      },
    });

    if (existingSubmission) {
      if (existingSubmission.status === "started") {
        return {
          submission_id: existingSubmission.id,
          status: existingSubmission.status,
        };
      }
    }
    const submission = await prisma.challenge_submissions.create({
      data: {
        challenge_id,
        id_profile: user.talent_profiles.id,
        status: "started",
        evaluation_type: "Automatica",
      },
    });

    return {
      submission_id: submission.id,
      status: submission.status,
    };
  }

  async submitTechnicalChallenge(
    userId: string,
    payload: SubmitTechnicalChallengeDto,
  ) {
    const { submission_id, programming_language, source_code } = payload;

    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: { talent_profiles: true },
    });

    if (!user || !user.talent_profiles) {
      throw new Error("USER_NOT_TALENT");
    }

    const submission = await prisma.challenge_submissions.findUnique({
      where: { id: submission_id },
      include: {
        challenges: true,
      },
    });

    if (!submission) {
      throw new Error("SUBMISSION_NOT_FOUND");
    }

    if (submission.id_profile !== user.talent_profiles.id) {
      throw new Error("UNAUTHORIZED_SUBMISSION");
    }

    if (submission.status !== "started") {
      throw new Error("SUBMISSION_NOT_ACTIVE");
    }

    await prisma.technical_challenge_submissions.create({
      data: {
        submission_id,
        programming_language,
        source_code,
      },
    });

    const updatedSubmission = await prisma.challenge_submissions.update({
      where: { id: submission_id },
      data: {
        status: "submitted",
      },
    });

    return {
      submission_id: updatedSubmission.id,
      status: "submitted",
    };
  }
  async getTalentChallengeHistory(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        talent_profiles: true,
      },
    });

    if (!user || !user.talent_profiles) {
      throw new Error("USER_NOT_TALENT");
    }
    const submissions = await prisma.challenge_submissions.findMany({
      where: {
        id_profile: user.talent_profiles.id,
        status: "submitted",
      },
      include: {
        challenges: {
          select: {
            id: true,
            title: true,
            challenge_type: true,
            difficulty: true,
          },
        },
      },
      orderBy: {
        created_at: "desc",
      },
    });

    return submissions.map((submission) => ({
      submission_id: submission.id,
      challenge: {
        id: submission.challenges?.id,
        title: submission.challenges?.title,
        type: submission.challenges?.challenge_type,
        difficulty: submission.challenges?.difficulty,
      },
      score: submission.score ?? 0,
      status: submission.status ?? "N/E",
      submitted_at: submission.created_at,
    }));
  }
}
