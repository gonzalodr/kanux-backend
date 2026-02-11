import { z } from "zod";

export const CreateSkillSchema = z.object({
  category_id: z.string().uuid({
    message: "Category ID must be a valid UUID",
  }),
  name: z
    .string()
    .min(1, { message: "Name is required" })
    .max(100, { message: "Name must be at most 100 characters long" }),

  level: z
    .enum(["beginner", "intermediate", "advanced", "expert"], {
      message:
        "Level must be one of the following: beginner, intermediate, advanced, expert",
    })
    .optional(),
});

export type CreateSkillDto = z.infer<typeof CreateSkillSchema>;
