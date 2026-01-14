import { Request, Response } from "express";
import { CommentService } from "../service/comment.service";
import { CreateCommentDto,createPostCommentSchema } from "../dto/comment.dto";
import { ZodError } from "zod";

const commentService = new CommentService();

export class CommentController{

 async createComment(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { postId } = req.params;

      const payloadToValidate = {
      ...req.body,
      post_id: req.params.postId,
    };
    
      const payload = createPostCommentSchema.parse(payloadToValidate);

     
      const comment = await commentService.createComment(userId, payload);

      res.status(201).json({
        message: "Se ha publicado tu comentario.",
        data: comment,
      });
    } catch (error: any) {
  
      if (error instanceof ZodError) {
        return res.status(422).json({
          message: "Error de validación",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      if (error.message === "POST_NOT_FOUND") {
        return res.status(404).json({
          message: "Post no encontrado",
        });
      }

      res.status(500).json({
        message: "Error inesperado",
      });
    }
  }

   async deleteComment(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { commentId } = req.params;

      if (!commentId) {
        return res.status(400).json({ message: "Comentario no seleccionado" });
      }

      const result = await commentService.deleteComment(userId, commentId);

      res.status(200).json({
        message: result.message,
      });
    } catch (error: any) {
      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      if (error.message === "COMMENT_NOT_FOUND") {
        return res.status(404).json({ message: "Comentario no encontrado" });
      }
      if (error.message === "UNAUTHORIZED_ACTION") {
        return res.status(403).json({ message: "No autorizado para eliminar este comentario" });
      }
      res.status(500).json({ message: "Error inesperado" });
    }
  }

  async getCommentsByPost(req: Request, res: Response) {
  try {
    const { postId } = req.params;

    if (!postId) {
      return res.status(400).json({ message: "postId es requerido" });
    }

    const comments = await commentService.getCommentsByPost(postId);

    res.status(200).json({
      message: "Comentarios obtenidos correctamente.",
      data: comments,
    });
  } catch (error: any) {
    res.status(500).json({ message: "Error inesperado" });
  }
}


}