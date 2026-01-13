import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { CreateConversationDto } from "./dto/create-conversation.dto";

export class MessagesService {
  private async getCompanyIdByUserId(userId: string): Promise<string> {
    const company = await prisma.company.findUnique({
      where: { id_user: userId },
    });

    if (!company) {
      throw new Error("Company profile not found");
    }

    return company.id;
  }

  async createConversation(userId: string, payload: CreateConversationDto) {
    const companyId = await this.getCompanyIdByUserId(userId);
    const { talent_profile_id } = payload;

    // 1. Verify talent profile exists
    const talent = await prisma.talent_profiles.findUnique({
      where: { id: talent_profile_id },
    });

    if (!talent) {
      throw new Error("Talent profile does not exist");
    }

    // 2. Search for existing conversation (using the unique index)
    const existingConversation = await prisma.conversations.findUnique({
      where: {
        conversations_company_profile_unique: {
          company_id: companyId,
          id_profile: talent_profile_id,
        },
      },
    });

    if (existingConversation) {
      return existingConversation;
    }

    // 3. Create new conversation
    try {
      const conversation = await prisma.conversations.create({
        data: {
          company_id: companyId,
          id_profile: talent_profile_id,
          last_message_at: new Date(),
        },
      });

      return conversation;
    } catch (error: any) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002"
      ) {
        const conversation = await prisma.conversations.findUnique({
          where: {
            conversations_company_profile_unique: {
              company_id: companyId,
              id_profile: talent_profile_id,
            },
          },
        });

        if (conversation) {
          return conversation;
        }
      }

      throw error;
    }
  }
}
