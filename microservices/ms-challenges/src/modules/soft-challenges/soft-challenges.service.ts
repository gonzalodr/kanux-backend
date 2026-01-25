import { prisma } from "../../lib/prisma";
import { SubmitChallengeDto } from "./dto/submit-challenge.dto";
import { isUUID } from "../../lib/isUUID";
import { FeedbackService } from "../feedback/feedback.service";

export class SoftChallengesService {
  // LIST SOFT CHALLENGES
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
          created_by_company: true,
          company: {
            select: {
              name: true,
              about: true,
              url_logo: true,
            },
          },
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

    const normalizedChallenges = challenges.map((challenge) => ({
      ...challenge,
      company: challenge.created_by_company ? challenge.company : null,
    }));

    return {
      data: normalizedChallenges,
      meta: {
        total,
        page,
        limit,
        lastPage: Math.ceil(total / limit),
      },
    };
  }

  // GET SOFT CHALLENGE DETAIL
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
        company: {
          select: {
            name: true,
            about: true,
            url_logo: true,
          },
        },
      },
    });

    if (!challenge || challenge.challenge_type !== "No Técnico") {
      throw new Error("Soft challenge not found");
    }

    return {
      ...challenge,
      company: challenge.created_by_company ? challenge.company : null,
    };
  }

  // SUBMIT SOFT CHALLENGE
  async submit(challengeId: string, payload: SubmitChallengeDto) {
    if (!isUUID(challengeId)) {
      throw new Error("Invalid challenge id format");
    }

    const { id_profile, answers } = payload;

    await this.validateChallenge(challengeId);
    await this.validateProfile(id_profile);
    await this.preventDoubleSubmit(challengeId, id_profile);

    const correctMap = await this.loadCorrectAnswers(challengeId);

    const { score, correctCount, totalQuestions } = this.calculateScore(
      correctMap,
      answers,
    );

    const feedback = this.generateFeedback(score);

    const submission = await this.saveSubmission(challengeId, payload, score);

    return this.buildResponse(
      submission.id,
      score,
      correctCount,
      totalQuestions,
      feedback,
    );
  }

  // PRIVATE DOMAIN METHODS (BUSINESS LOGIC)

  /**
   * Ensures the challenge exists and is a non-technical challenge.
   * Centralizes business rule: only "No Técnico" challenges are valid here.
   */
  private async validateChallenge(challengeId: string) {
    const challenge = await prisma.challenges.findUnique({
      where: { id: challengeId },
      select: { challenge_type: true },
    });

    if (!challenge) {
      throw new Error("Challenge not found");
    }

    if (challenge.challenge_type !== "No Técnico") {
      throw new Error("Invalid challenge type");
    }
  }

  /**
   * Ensures the profile id is valid and exists in the system.
   * Prevents orphan submissions and FK database errors.
   */
  private async validateProfile(profileId: string) {
    if (!isUUID(profileId)) {
      throw new Error("Invalid profile id format");
    }

    const profile = await prisma.talent_profiles.findUnique({
      where: { id: profileId },
      select: { id: true },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }
  }

  /**
   * Business rule: a profile can only submit a challenge once.
   * Protects against double attempts and cheating.
   */
  private async preventDoubleSubmit(challengeId: string, profileId: string) {
    const exists = await prisma.challenge_submissions.findFirst({
      where: {
        challenge_id: challengeId,
        id_profile: profileId,
      },
      select: { id: true },
    });

    if (exists) {
      throw new Error("Challenge already submitted by this profile");
    }
  }

  /**
   * Loads only correct options to minimize DB payload.
   * Builds a map: QuestionID -> CorrectOptionID for O(1) scoring.
   */
  private async loadCorrectAnswers(challengeId: string) {
    const correctOptions = await prisma.non_technical_question_options.findMany(
      {
        where: {
          is_correct: true,
          non_technical_questions: {
            non_technical_challenges: {
              challenge_id: challengeId,
            },
          },
        },
        select: {
          id: true,
          question_id: true,
        },
      },
    );

    const correctMap = new Map<string, string>();

    correctOptions.forEach((opt) => {
      if (opt.question_id) {
        correctMap.set(opt.question_id, opt.id);
      }
    });

    return correctMap;
  }

  /**
   * Computes score entirely in memory.
   * Avoids N+1 queries and guarantees O(n) performance.
   */
  private calculateScore(
    correctMap: Map<string, string>,
    answers: { question_id: string; selected_option_id: string }[],
  ) {
    const totalQuestions = correctMap.size;
    let correctCount = 0;

    for (const answer of answers) {
      const correctOptionId = correctMap.get(answer.question_id);
      if (correctOptionId === answer.selected_option_id) {
        correctCount++;
      }
    }

    const score =
      totalQuestions > 0
        ? Math.round((correctCount / totalQuestions) * 100)
        : 0;

    return { score, correctCount, totalQuestions };
  }

  /**
   * Translates numeric score into human feedback.
   * Keeps business rules centralized and easy to change.
   */
  private generateFeedback(score: number): string {
    if (score === 100) return "¡Excelente! Dominas perfectamente este tema.";
    if (score >= 80) return "¡Muy bien! Tienes un nivel avanzado.";
    if (score >= 60) return "Bien, pero puedes mejorar algunos conceptos.";
    return "Sigue practicando para mejorar.";
  }

  /**
   * Persists submission and answers in a single transaction.
   * Guarantees atomicity: all data is saved or nothing is saved.
   */
  private async saveSubmission(
    challengeId: string,
    payload: SubmitChallengeDto,
    score: number,
  ) {
    const submission = await prisma.challenge_submissions.create({
      data: {
        challenge_id: challengeId,
        id_profile: payload.id_profile,
        status: "submitted",
        score,
        evaluation_type: "Simulada",
        non_technical_answers: {
          createMany: {
            data: payload.answers.map((a) => ({
              question_id: a.question_id,
              selected_option_id: a.selected_option_id,
            })),
          },
        },
      },
    });

    // Generate AI feedback automatically (non-blocking best-effort)
    try {
      const feedbackService = new FeedbackService();
      await feedbackService.generateAndStore(submission.id);
    } catch (err) {
      console.error("AI feedback generation failed (soft challenge)", err);
    }

    return submission;
  }

  /**
   * Standardizes API output format.
   * Decouples internal DB models from public API contract.
   */
  private buildResponse(
    submissionId: string,
    score: number,
    correctCount: number,
    totalQuestions: number,
    feedback: string,
  ) {
    return {
      submission_id: submissionId,
      score,
      total_questions: totalQuestions,
      correct_answers: correctCount,
      feedback,
    };
  }
}
