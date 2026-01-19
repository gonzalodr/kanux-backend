import { z } from "zod";

export const StartTechnicalChallengeSchema = z.object({
  challenge_id: z.string().uuid("Invalid challenge id"),
});

export const SubmitTechnicalChallengeSchema = z.object({
  submission_id: z.string().uuid("Invalid submission id"),

  programming_language: z.string().min(2).max(50),

  source_code: z.string().min(10, "Source code is too short"),
});

export type StartTechnicalChallengeDto = z.infer<
  typeof StartTechnicalChallengeSchema
>;

export type SubmitTechnicalChallengeDto = z.infer<
  typeof SubmitTechnicalChallengeSchema
>;
