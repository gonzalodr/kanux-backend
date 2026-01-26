import { prisma } from "../../lib/prisma";
import { sendChat } from "../../lib/openrouter";
import { buildTechnicalFeedbackPrompt } from "../../lib/prompts/technicalFeedback";
import { buildNonTechnicalFeedbackPrompt } from "../../lib/prompts/nonTechnicalFeedback";
import { ExecutionService } from "../challenge-execution/execution.service";

export class FeedbackService {
  private executionService = new ExecutionService();

  /**
   * Generate and store AI feedback with pre-calculated test results.
   * This avoids re-running tests if they were already executed.
   */
  async generateAndStoreWithTestResults(
    submissionId: string,
    testResult?: any,
  ) {
    const submission = await prisma.challenge_submissions.findUnique({
      where: { id: submissionId },
      include: {
        challenges: true,
        technical_challenge_submissions: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
        non_technical_answers: {
          include: {
            non_technical_questions: true,
            non_technical_question_options: true,
          },
        },
      },
    });

    if (!submission || !submission.challenges) {
      throw new Error("SUBMISSION_NOT_FOUND");
    }

    let payload: any = null;

    if (
      submission.challenges.challenge_type === "Técnico" &&
      submission.technical_challenge_submissions?.length
    ) {
      const tech = submission.technical_challenge_submissions[0];

      // Use provided test results or execute tests if not provided
      let finalTestResult = testResult;
      if (!finalTestResult) {
        try {
          finalTestResult = await this.executionService.executeChallenge({
            challengeId: submission.challenges.id,
            code: tech.source_code,
            language: (tech.programming_language as any) || undefined,
            userId: undefined,
          });
        } catch (err: any) {
          finalTestResult = {
            status: "error",
            summary: err?.message || "runner error",
          };
        }
      }

      const messages = buildTechnicalFeedbackPrompt({
        challenge: {
          id: submission.challenges.id,
          title: submission.challenges.title,
          description: submission.challenges.description,
          difficulty: submission.challenges.difficulty,
          duration_minutes: submission.challenges.duration_minutes,
        },
        submission: {
          submissionId: submission.id,
          language: tech.programming_language,
          sourceCode: tech.source_code,
          createdAt: submission.created_at ?? undefined,
        },
        testResult: finalTestResult
          ? {
              status: finalTestResult.status || "unknown",
              summary:
                finalTestResult.message || finalTestResult.error || undefined,
              passed:
                finalTestResult.passed ??
                finalTestResult.summary?.passed ??
                undefined,
              failed:
                finalTestResult.failed ??
                finalTestResult.summary?.failed ??
                undefined,
              total:
                finalTestResult.total ??
                finalTestResult.summary?.total ??
                undefined,
              details: finalTestResult,
            }
          : undefined,
      });

      const completion = await sendChat(messages, { stream: false });
      const content = completion.choices?.[0]?.message?.content || "";
      payload = safeParseJson(content);
    } else if (submission.challenges.challenge_type !== "Técnico") {
      const answers = submission.non_technical_answers.map((ans) => ({
        question_id: ans.question_id || "",
        question_text: ans.non_technical_questions?.question || "",
        question_type: ans.non_technical_questions?.question_type || "",
        selected_option_id: ans.selected_option_id || null,
        selected_option_text:
          ans.non_technical_question_options?.option_text || null,
        is_correct: ans.non_technical_question_options?.is_correct ?? null,
      }));

      const messages = buildNonTechnicalFeedbackPrompt({
        challenge: {
          id: submission.challenges.id,
          title: submission.challenges.title,
          instructions: submission.challenges.description,
        },
        submission: {
          submissionId: submission.id,
          createdAt: submission.created_at ?? undefined,
        },
        answers,
      });

      const completion = await sendChat(messages, { stream: false });
      const content = completion.choices?.[0]?.message?.content || "";
      payload = safeParseJson(content);
    } else {
      throw new Error("SUBMISSION_TYPE_UNSUPPORTED");
    }

    if (!payload) {
      throw new Error("AI_FEEDBACK_EMPTY");
    }

    await prisma.challenge_ai_feedback.create({
      data: {
        submission_id: submission.id,
        feedback: JSON.stringify(payload),
      },
    });

    return payload;
  }

  /**
   * Legacy method for backward compatibility.
   * Calls the optimized method without pre-calculated test results.
   */
  async generateAndStore(submissionId: string) {
    return this.generateAndStoreWithTestResults(submissionId, undefined);
  }

  async list(submissionId: string) {
    const rows = await prisma.challenge_ai_feedback.findMany({
      where: { submission_id: submissionId },
      orderBy: { created_at: "desc" },
    });
    return rows.map((r) => ({
      id: r.id,
      submission_id: r.submission_id,
      feedback: safeParseJson(r.feedback || ""),
      created_at: r.created_at,
    }));
  }
}

function safeParseJson(text: string) {
  try {
    const start = text.indexOf("{");
    const end = text.lastIndexOf("}");
    const slice = start >= 0 && end > start ? text.slice(start, end + 1) : text;
    return JSON.parse(slice);
  } catch {
    return { raw: text };
  }
}
