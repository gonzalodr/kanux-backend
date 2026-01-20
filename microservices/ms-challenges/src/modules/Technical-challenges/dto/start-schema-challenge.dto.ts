import { z } from "zod";
import { StartTechnicalChallengeSchema,SubmitTechnicalChallengeSchema } from "../schema/submission.schema";

export type StartTechnicalChallengeDto = z.infer<
  typeof StartTechnicalChallengeSchema
>;

export type SubmitTechnicalChallengeDto = z.infer<
  typeof SubmitTechnicalChallengeSchema
>;
