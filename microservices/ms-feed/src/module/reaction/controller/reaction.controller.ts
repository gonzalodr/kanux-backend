import { Request, Response } from "express";
import { ReactionService } from "../service/reaction.service";

const reactionService = new ReactionService();

export class ReactionController {
  async toggleReaction(req: Request, res: Response) {
    try {
      const userId = req.user!.userId;
      const { postId } = req.params;

      const result = await reactionService.toggleReaction(userId, postId);

      res.status(200).json(result);
    } catch (error: any) {
      if (error.message === "POST_NOT_FOUND") {
        return res.status(404).json({ message: "Post no encontrado" });
      }
       if (error.message === "USER_NOT_FOUND") {
        return res.status(404).json({ message: "usuario no valido" });
      }
      res.status(500).json({ message: "Error inesperado" });
    }
  }
}
