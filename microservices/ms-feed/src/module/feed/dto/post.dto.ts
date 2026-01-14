import { z } from "zod";

export const CreatePostSchema = z.object({
  content: z
    .string()
    .min(1, "Contenido requerido.")
    .max(2000, "La publicacion sobrepasa la cantidad de caracteres permitidos."),
});

export type CreatePostDto = z.infer<typeof CreatePostSchema>;
