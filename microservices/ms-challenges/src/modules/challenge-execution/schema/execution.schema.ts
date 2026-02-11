import { z } from "zod";

export const ExecutionSchema = z.object({
  source_code: z.string().min(1, "Source code is required"),
  programming_language: z
    .enum(["javascript", "typescript"])
    .optional()
    .default("javascript"),
  user_id: z.string().optional(),
});

export type ExecutionSchemaType = z.infer<typeof ExecutionSchema>;
