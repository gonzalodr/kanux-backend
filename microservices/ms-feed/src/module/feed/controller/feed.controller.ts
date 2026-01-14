import { Request, Response } from "express";
import { FeedService } from "../service/feed.service";
import { CreatePostSchema } from "../dto/post.dto";
import { ZodError } from "zod";

const feedService = new FeedService();

export class FeedController {

  async createPost(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const payload = CreatePostSchema.parse(req.body);

      const post = await feedService.createPost(userId, payload);

      res.status(201).json({
    message: "Se ha publicado correctamente en tu feed.",
    data: post,
    });
    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          message: "Validation error",
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

      res.status(500).json({
        message:  "Unexpected error",
      });
    }
  }

  async updatePost(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { postId } = req.params;

      const payload = CreatePostSchema.parse(req.body);

      const updatedPost = await feedService.updatePost(userId, postId, payload);

      res.status(200).json({
        message: "Publicacion actualizada correctamente.",
        data: updatedPost,
      });

    } catch (error: any) {
      if (error instanceof ZodError) {
        return res.status(422).json({
          message: "Validation error",
          errors: error.issues.map((e) => ({
            field: e.path.join("."),
            message: e.message,
          })),
        });
      }

      if (error.message === "POST_NOT_FOUND") {
        return res.status(404).json({ message: "Post no encontrado" });
      }

      if (error.message === "UNAUTHORIZED_ACTION") {
        return res.status(403).json({ message: "No autorizado para actualizar esta publicacion" });
      }

      res.status(500).json({ message: "Unexpected error" });
    }
  }


 async deletePost(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { postId } = req.params;

      const deletedPost = await feedService.deletePost(userId, postId);

      return res.status(200).json({
        message: "Publicación eliminada correctamente.",
        data: deletedPost,
      });

    } catch (error: any) {

      if (error.message === "POST_NOT_FOUND") {
        return res.status(404).json({
          message: "La publicación no existe",
        });
      }

      if (error.message === "FORBIDDEN_DELETE_POST") {
        return res.status(403).json({
          message: "No tienes permiso para eliminar esta publicación",
        });
      }

      return res.status(500).json({
        message: "Unexpected error",
      });
    }
  }


  async getAllPosts(req: Request, res: Response) {
    try {
      const userId = req.user?.userId; // opcional
      const posts = await feedService.getAllPosts(userId);

      res.status(200).json({
        data: posts,
      });
    } catch (error: any) {
      res.status(500).json({
        message: "Unexpected error",
      });
    }
  }

 
  async getMyPosts(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;

      const posts = await feedService.getMyPosts(userId);

      res.status(200).json({
        data: posts,
      });
    } catch (error: any) {

      if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({
          message: "Usuario no encontrado",
        });
      }

      res.status(500).json({
        message: "Unexpected error",
      });
    }
  }
  
}
