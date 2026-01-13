import { Request, Response } from "express";
import { MessagesService } from "./messages.service";
import { CreateConversationSchema } from "./dto/create-conversation.dto";
import { ZodError } from "zod";

const messagesService = new MessagesService();

export class MessagesController {
  async createConversation(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const userId = req.user.id;
      const payload = CreateConversationSchema.parse(req.body);

      const conversation = await messagesService.createConversation(
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
}
