import { Request, Response } from "express";
import { z } from "zod";
import { ExecutionService } from "./execution.service";
import { mapExecutionError } from "./error-mapper";

const executionService = new ExecutionService();

export class ExecutionController {
  async runInternalTechnicalChallenge(req: Request, res: Response) {
    try {
      const expectedToken =
        process.env.RUNNER_INTERNAL_TOKEN ||
        process.env.RUNNER_AUTH_TOKEN ||
        "";
      if (expectedToken) {
        const headerToken = (
          (req.headers["x-internal-token"] ||
            req.headers["x-runner-token"] ||
            req.headers.authorization ||
            "") as string
        ).replace("Bearer ", "");
        if (!headerToken || headerToken !== expectedToken) {
          return res.status(401).json({ message: "Unauthorized" });
        }
      }

      const { challengeId } = req.params;
      if (!z.uuid().safeParse(challengeId).success) {
        return res.status(400).json({ message: "Invalid challenge id" });
      }

      const parsedBody = z
        .object({
          source_code: z.string().min(1),
          programming_language: z.enum(["javascript", "typescript"]).optional(),
          user_id: z.string().optional(),
        })
        .safeParse(req.body);

      if (!parsedBody.success) {
        return res.status(422).json({
          message: "Validation error",
          errors: parsedBody.error.flatten(),
        });
      }

      const result = await executionService.executeChallenge({
        challengeId,
        code: parsedBody.data.source_code,
        language: parsedBody.data.programming_language,
        userId: parsedBody.data.user_id || req.user?.id,
      });

      if (result?.status === "error") {
        const errorInfo = mapExecutionError(result.error as string | undefined);
        return res.status(400).json({
          success: false,
          message: errorInfo.userFriendlyMessage,
          error: {
            code: errorInfo.code,
            category: errorInfo.category,
            suggestions: errorInfo.suggestions,
            originalError: errorInfo.originalError,
          },
          data: result,
        });
      }

      return res.status(200).json({
        success: true,
        message: "Execution completed",
        data: result,
      });
    } catch (error: any) {
      if (error.message === "CHALLENGE_ASSETS_NOT_FOUND") {
        return res
          .status(404)
          .json({ message: "Assets not found for challenge" });
      }

      if (error?.response) {
        console.error("runner upstream error", {
          status: error.response.status,
          data: error.response.data,
        });
        const errorInfo = mapExecutionError(
          error.response.data?.error || error.response.data?.message,
        );
        return res.status(error.response.status || 502).json({
          success: false,
          message: errorInfo.userFriendlyMessage,
          error: {
            code: errorInfo.code,
            category: errorInfo.category,
            suggestions: errorInfo.suggestions,
            originalError: errorInfo.originalError,
          },
          data: error.response.data,
        });
      }

      return res.status(500).json({
        message: error?.message || "Unexpected error",
      });
    }
  }
}
