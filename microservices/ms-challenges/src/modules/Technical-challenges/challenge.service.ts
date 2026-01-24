import { prisma } from "../../lib/prisma";
import fs from "fs";
import path from "path";
import {
  StartTechnicalChallengeDto,
  SubmitTechnicalChallengeDto,
} from "./dto/start-schema-challenge.dto";

export class ChallengeService {
  private DEFAULT_CHALLENGE_FILES: Record<
    string,
    { language: "javascript" | "typescript"; folder: string }
  > = {
    "550e8400-e29b-41d4-a716-446655440001": {
      language: "javascript",
      folder: "001-sum-two-numbers",
    },
    "550e8400-e29b-41d4-a716-446655440002": {
      language: "javascript",
      folder: "002-reverse-string",
    },
    "550e8400-e29b-41d4-a716-446655440003": {
      language: "typescript",
      folder: "003-palindrome-checker",
    },
    "550e8400-e29b-41d4-a716-446655440004": {
      language: "typescript",
      folder: "004-fibonacci",
    },
    "550e8400-e29b-41d4-a716-446655440005": {
      language: "typescript",
      folder: "005-array-duplicates",
    },
  };

  async getPublicTechnicalChallenges(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [challenges, totalCount] = await Promise.all([
      prisma.challenges.findMany({
        where: { created_by_company: null, challenge_type: "Técnico" },
        skip,
        take: limit,
        include: { technical_challenge_metadata: true },
        orderBy: { created_at: "desc" },
      }),
      prisma.challenges.count({
        where: { created_by_company: null, challenge_type: "Técnico" },
      }),
    ]);

    return {
      data: challenges,
      meta: {
        total_records: totalCount,
        current_page: page,
        limit,
        total_pages: Math.ceil(totalCount / limit),
      },
    };
  }

  async getPublicTechnicalChallengeDetail(challengeId: string) {
    const challenge = await prisma.challenges.findUnique({
      where: { id: challengeId },
      include: { technical_challenge_metadata: true },
    });

    if (
      !challenge ||
      challenge.created_by_company !== null ||
      challenge.challenge_type !== "Técnico"
    ) {
      throw new Error("Challenge not found");
    }

    const metadata = challenge.technical_challenge_metadata?.[0];
    if (!metadata || metadata.source !== "KANUX_JSON") {
      throw new Error("Assets not available for this challenge");
    }

    const fileInfo = this.DEFAULT_CHALLENGE_FILES[challengeId];
    if (!fileInfo) {
      throw new Error("Assets mapping not found for challenge");
    }

    const baseDir = path.resolve(
      __dirname,
      "../../data/default-challenges",
      fileInfo.language,
      fileInfo.folder,
    );

    const [challengeJsonRaw, testCasesJsonRaw] = await Promise.all([
      fs.promises.readFile(path.join(baseDir, "challenge.json"), "utf8"),
      fs.promises.readFile(path.join(baseDir, "test-cases.json"), "utf8"),
    ]);

    return {
      data: challenge,
      assets: {
        challenge: JSON.parse(challengeJsonRaw),
        test_cases: JSON.parse(testCasesJsonRaw),
      },
    };
  }
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
