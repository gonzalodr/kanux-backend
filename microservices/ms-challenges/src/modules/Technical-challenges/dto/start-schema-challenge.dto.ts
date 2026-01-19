import { z } from "zod";
import { StartTechnicalChallengeSchema } from "../schema/submission.schema";

export type StartTechnicalChallengeDto = z.infer<
  typeof StartTechnicalChallengeSchema
>;
