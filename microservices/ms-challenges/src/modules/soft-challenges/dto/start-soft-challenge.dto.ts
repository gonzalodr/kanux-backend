import { z } from "zod";

export const StartSoftChallengeSchema = z.object({
  challenge_id: z.string().uuid({ message: "Invalid challenge id" }),
});

export type StartSoftChallengeDto = z.infer<typeof StartSoftChallengeSchema>;
