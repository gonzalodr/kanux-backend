import { z } from "zod";

export const SubmitChallengeSchema = z.object({
  id_profile: z.string().uuid({ message: "Invalid profile ID" }),
  answers: z
    .array(
      z.object({
        question_id: z.string().uuid({ message: "Invalid question ID" }),
        selected_option_id: z.string().uuid({ message: "Invalid option ID" }),
      }),
    )
    .min(1, { message: "At least one answer is required" }),
});

export type SubmitChallengeDto = z.infer<typeof SubmitChallengeSchema>;
