import { z } from "zod";

export const CreateTalentProfileSchema = z.object({

  first_name: z.string().min(1, "First name is required").max(50),
  last_name: z.string().min(1, "Last name is required").max(50),

  title: z.string().max(100),
  location: z.string().max(100),
  experience_level: z.string().max(50),
  education: z.string().max(100),
  about: z.string().max(1000),

  contact: z.record(z.string(), z.any()),

  learning_background_id: z
    .uuid("learning_background_id must be a valid UUID")
    .optional(),

  opportunity_status_id: z
    .uuid("opportunity_status_id must be a valid UUID")
    .optional(),
});

// Extraemos el tipo
export type CreateTalentProfileDto = z.infer<typeof CreateTalentProfileSchema>;