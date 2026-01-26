import { Request, Response } from "express";
import { z } from "zod";
import { RUNNER_AUTH_TOKEN } from "../../config/constants";
import { ExecutionService } from "./execution.service";

const requestSchema = z.object({
  language: z.enum(["javascript", "typescript"]).default("javascript"),
  code: z.string().min(1),
  entrypoint: z.string().min(1),
  tests: z
    .array(
      z.object({
        id: z.union([z.string(), z.number()]),
        input: z.any(),
        expected_output: z.any(),
        description: z.string().optional(),
        timeout_ms: z.number().optional(),
      }),
    )
    .min(1),
  userId: z.string().optional(),
  timeoutMs: z.number().optional(),
  perTestTimeoutMs: z.number().optional(),
});

export class ExecutionController {
  constructor(private executionService = new ExecutionService()) {}

  async handle(req: Request, res: Response) {
    try {
      if (RUNNER_AUTH_TOKEN) {
        const token = (req.headers["x-runner-token"] ||
          req.headers.authorization ||
          "") as string;
        if (!token || token.replace("Bearer ", "") !== RUNNER_AUTH_TOKEN) {
          return res.status(401).json({ message: "Unauthorized" });
        }
      }

      const parsed = requestSchema.safeParse(req.body);
      if (!parsed.success) {
        return res.status(422).json({
          message: "Validation error",
          errors: parsed.error.flatten(),
        });
      }

      const result = await this.executionService.execute(parsed.data);

      if (result.status !== "ok") {
        console.error("runner: execution error", {
          error: result.error,
          logs: result.logs,
          exitCode: result.exitCode,
        });
      }

      return res.status(200).json(result);
    } catch (error: any) {
      console.error("runner: unexpected error", error);
      return res.status(200).json({
        status: "error",
        error: error?.message || "Unexpected runner error",
      });
    }
  }
}
