import { prisma } from "../../lib/prisma";
import { CreateMessageDto } from "./dto/create-message.dto";

export class MessagesService {
  async sendMessage(userId: string, payload: CreateMessageDto) {
    const { conversation_id, content } = payload;

    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    const conversation = await prisma.conversations.findUnique({
      where: { id: conversation_id },
    });

    if (!conversation) {
      throw new Error("Conversation not found");
    }

    // In DB:
    //  - Company  -> "Companhia"
    //  - Talent   -> "Talento"
    let senderType: "Companhia" | "Talento";
    let senderId: string;

    if (user.user_type === "company") {
      const company = await prisma.company.findUnique({
        where: { id_user: userId },
      });

      if (!company) {
        throw new Error("Company profile not found");
      }

      if (company.id !== conversation.company_id) {
        throw new Error("You do not belong to this conversation");
      }

      senderType = "Companhia";
      senderId = company.id;
    } else if (user.user_type === "talent") {
      const talent = await prisma.talent_profiles.findUnique({
        where: { user_id: userId },
      });

      if (!talent) {
        throw new Error("Talent profile not found");
      }

      if (talent.id !== conversation.id_profile) {
        throw new Error("You do not belong to this conversation");
      }

      senderType = "Talento";
      senderId = talent.id;
    } else {
      throw new Error("Invalid user type");
    }

    const message = await prisma.messages.create({
      data: {
        conversation_id,
        sender_type: senderType,
        sender_id: senderId,
        content,
      },
    });

    await prisma.conversations.update({
      where: { id: conversation_id },
      data: {
        last_message_at: new Date(),
      },
    });

    return message;
  }
}
