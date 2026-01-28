import { prisma } from "../../lib/prisma";
import fs from "fs";
import path from "path";
import { DEFAULT_CHALLENGE_FILES } from "../challenge-execution/execution.service";
import {
  StartTechnicalChallengeDto,
  SubmitTechnicalChallengeDto,
} from "./dto/start-schema-challenge.dto";
import { FeedbackService } from "../feedback/feedback.service";

export class ChallengeService {
  async getPublicTechnicalChallenges(page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;
    const [challenges, totalCount] = await Promise.all([
      prisma.challenges.findMany({
        where: { created_by_company: null, challenge_type: "Técnico" },
        skip,
        take: limit,
        select: {
          id: true,
          title: true,
          description: true,
          difficulty: true,
          duration_minutes: true,
          created_at: true,
          created_by_company: true,
          technical_challenge_metadata: true,
          company: {
            select: {
              name: true,
              about: true,
              url_logo: true,
            },
          },
        },
        orderBy: { created_at: "desc" },
      }),
      prisma.challenges.count({
        where: { created_by_company: null, challenge_type: "Técnico" },
      }),
    ]);

    const normalizedChallenges = challenges.map((challenge) => ({
      ...challenge,
      company: challenge.created_by_company ? challenge.company : null,
    }));

    return {
      data: normalizedChallenges,
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
      include: {
        technical_challenge_metadata: true,
        company: {
          select: {
            name: true,
            about: true,
            url_logo: true,
          },
        },
      },
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

    const fileInfo = DEFAULT_CHALLENGE_FILES[challengeId];
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

    const challengeData = {
      ...challenge,
      company: challenge.created_by_company ? challenge.company : null,
    };

    return {
      data: challengeData,
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

    // Execute tests ONCE to get immediate score
    let testResult: any = null;
    let immediateScore = 0; // Default score

    try {
      const executionService = new (
        await import("../challenge-execution/execution.service")
      ).ExecutionService();
      testResult = await executionService.executeChallenge({
        challengeId: submission.challenges!.id,
        code: source_code,
        language: programming_language as any,
        userId: undefined,
      });

      // Calculate score based on test results
      if (testResult?.status === "ok" && testResult?.results) {
        const results = testResult.results;
        const totalTests = results.length;
        const passedTests = results.filter((r: any) => r.pass === true).length;
        immediateScore =
          totalTests > 0 ? Math.round((passedTests / totalTests) * 100) : 0;
      } else if (testResult?.status === "error") {
        console.error("Test execution error:", testResult?.error);
        // Keep score at 0 on execution error
        immediateScore = 0;
      }
    } catch (testErr) {
      console.error("Test execution failed", testErr);
      immediateScore = 0;
    }

    // Update to evaluated with test-based score immediately
    const updatedSubmission = await prisma.challenge_submissions.update({
      where: { id: submission_id },
      data: {
        status: "evaluated",
        score: immediateScore,
      },
    });

    // Process AI feedback in background (non-blocking)
    // This will refine the score if AI is available
    this.processAIFeedbackInBackground(
      updatedSubmission.id,
      testResult,
      immediateScore,
    ).catch((err) => {
      console.error("Background AI feedback processing failed", err);
    });

    return {
      submission_id: updatedSubmission.id,
      status: "evaluated",
      score: immediateScore,
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
        status: "evaluated",
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

  async getSubmissionResult(userId: string, submissionId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
        talent_profiles: true,
      },
    });

    if (!user || !user.talent_profiles) {
      throw new Error("USER_NOT_TALENT");
    }

    const submission = await prisma.challenge_submissions.findUnique({
      where: { id: submissionId },
      include: {
        challenges: {
          select: {
            id: true,
            title: true,
            difficulty: true,
            challenge_type: true,
          },
        },
        challenge_ai_feedback: {
          select: {
            id: true,
            feedback: true,
            created_at: true,
          },
          orderBy: {
            created_at: "desc",
          },
          take: 1,
        },
      },
    });

    if (!submission) {
      throw new Error("SUBMISSION_NOT_FOUND");
    }

    if (submission.id_profile !== user.talent_profiles.id) {
      throw new Error("UNAUTHORIZED_SUBMISSION");
    }

    const latestFeedback = submission.challenge_ai_feedback?.[0];

    // Parse feedback JSON if it exists
    let parsedFeedback = null;
    if (latestFeedback?.feedback) {
      try {
        parsedFeedback = JSON.parse(latestFeedback.feedback);
      } catch (err) {
        console.error("Failed to parse feedback JSON", err);
        parsedFeedback = latestFeedback.feedback;
      }
    }

    return {
      submission_id: submission.id,
      status: submission.status,
      score: submission.score ?? 0,
      challenge: {
        id: submission.challenges?.id,
        title: submission.challenges?.title,
        difficulty: submission.challenges?.difficulty,
      },
      feedback: parsedFeedback,
      submitted_at: submission.created_at,
      feedback_generated_at: latestFeedback?.created_at || null,
    };
  }

  /**
   * Process AI feedback in background to refine the score.
   * This runs asynchronously without blocking the user response.
   * If AI provides a better evaluation, the score will be updated.
   */
  private async processAIFeedbackInBackground(
    submissionId: string,
    testResult: any,
    initialScore: number,
  ) {
    try {
      const feedbackService = new FeedbackService();
      // Generate AI feedback (not score refinement)
      const feedback = await feedbackService.generateAndStoreWithTestResults(
        submissionId,
        testResult,
      );

      // Only update score if AI provides a HIGHER score than the initial test-based score
      if (
        feedback?.final_score != null &&
        feedback.final_score > initialScore
      ) {
        await prisma.challenge_submissions.update({
          where: { id: submissionId },
          data: {
            score: feedback.final_score,
          },
        });
        console.log(
          `AI improved score for ${submissionId}: ${initialScore} → ${feedback.final_score}`,
        );
      } else if (feedback?.final_score != null) {
        console.log(
          `AI score ${feedback.final_score} not higher than test score ${initialScore}, keeping test score`,
        );
      }
    } catch (err) {
      console.error(
        "Background AI feedback processing failed, keeping test-based score",
        err,
      );
    }
  }
}
