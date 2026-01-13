import { Request, Response } from "express";
import { ConversationsService } from "./conversations.service";
import { CreateConversationSchema } from "./dto/create-conversation.dto";
import { ZodError } from "zod";

const conversationsService = new ConversationsService();

export class ConversationsController {
  async createConversation(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.id;
      const payload = CreateConversationSchema.parse(req.body);

      const conversation = await conversationsService.createConversation(
        userId,
        payload
      );

      res.status(201).json(conversation);
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

      res.status(400).json({ message: error.message });
    }
  }

  async getUserConversations(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.id;
      const conversations = await conversationsService.getUserConversations(
        userId
      );

      res.status(200).json(conversations);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
