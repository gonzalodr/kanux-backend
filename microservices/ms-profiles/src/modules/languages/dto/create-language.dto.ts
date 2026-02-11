import { z } from "zod";

export const CreateLanguageSchema = z.object({
  language_id: z.string().uuid({
    message: "Language ID must be a valid UUID",
  }),
  // Levels must be in Spanish because the database CHECK constraint is defined in Spanish:
  // CHECK (level IN ('Básico', 'Intermedio', 'Avanzado'))
  level: z.enum(["Básico", "Intermedio", "Avanzado"], {
    message: "Level must be one of: Básico, Intermedio or Avanzado",
  }),
});

export type CreateLanguageDto = z.infer<typeof CreateLanguageSchema>;
