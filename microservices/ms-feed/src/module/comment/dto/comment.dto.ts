import { z } from "zod";

export const createPostCommentSchema = z.object({
  post_id: z.string().uuid({ message: "Post no valido." }),
  content: z.string().min(1, { message: "El contenido no puede estar vacío" }),
});


export type CreatePostCommentDTO = z.infer<typeof createPostCommentSchema>;

export const updatePostCommentSchema = z.object({
  id: z.string().uuid({ message: "Post no valido." }),
  content: z.string().min(1, { message: "El contenido no puede estar vacío" }).optional(),
});


export type UpdatePostCommentDTO = z.infer<typeof updatePostCommentSchema>;



export interface CreateCommentDto {
  post_id: string;
  content: string;
}