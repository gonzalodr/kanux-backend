import { z } from "zod";

export const CreateMessageSchema = z.object({
  conversation_id: z.string().uuid(),
  content: z.string().min(1, "Message content is required"),
});

export type CreateMessageDto = z.infer<typeof CreateMessageSchema>;
