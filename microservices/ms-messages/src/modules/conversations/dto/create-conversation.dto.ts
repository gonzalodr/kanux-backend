import { z } from "zod";

export const CreateConversationSchema = z.object({
  talent_profile_id: z.string().uuid(),
});

export type CreateConversationDto = z.infer<typeof CreateConversationSchema>;
