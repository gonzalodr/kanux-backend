import { Request, Response } from "express";
import { MessagesService } from "./messages.service";
import { CreateMessageSchema } from "./dto/create-message.dto";
import { ZodError } from "zod";

const messagesServices = new MessagesService();

export class MessagesController {
  async sendMessage(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const payload = CreateMessageSchema.parse(req.body);

      const message = await messagesServices.sendMessage(req.user.id, payload);
      return res.status(201).json(message);
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

  async getConversationMessages(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { id } = req.params;

      const data = await messagesServices.getConversationMessages(
        req.user.id,
        id,
      );

      return res.status(200).json(data);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }

  async markAsRead(req: Request, res: Response) {
    try {
      if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const { conversationId } = req.params;
      const { messageIds } = req.body;

      const result = await messagesServices.markMessagesAsRead(
        req.user.id,
        conversationId,
        messageIds,
      );

      return res.status(200).json({
        message: "Messages marked as read",
        ...result,
      });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  }
}
