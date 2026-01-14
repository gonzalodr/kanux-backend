import { z } from "zod";

export const UpdateTalentProfileSchema = z
  .object({
    first_name: z.string().min(1, "First name is required").max(50),
    last_name: z.string().min(1, "Last name is required").max(50),

    title: z.string().min(1).max(100).optional(),
    location: z.string().min(1).max(100).optional(),
    experience_level: z.string().min(1).max(50).optional(),
    education: z.string().min(1).max(100).optional(),
    about: z.string().min(1).max(1000).optional(),
    contact: z.any().optional(),

    learning_background_id: z
      .string()
      .uuid("learning_background_id must be a valid UUID")
      .optional(),

    opportunity_status_id: z
      .string()
      .uuid("opportunity_status_id must be a valid UUID")
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });

export type UpdateTalentProfileDto = z.infer<typeof UpdateTalentProfileSchema>;
