import { z } from "zod";

export const UpdateTalentProfileSchema = z
  .object({
    title: z.string().min(1).max(100),
    location: z.string().min(1).max(100),
    experiece_level: z.string().min(1).max(50),
    education: z.string().min(1).max(100).optional(),
    about: z.string().min(1).max(1000).optional(),
    contact: z.any().optional(),

    learning_background_id: z
      .string()
      .uuid({
        message: "learning_background_id must be a valid UUID",
      })
      .optional(),

    opportunity_status_id: z
      .string()
      .uuid({
        message: "opportunity_status_id must be a valid UUID",
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided for update",
  });
