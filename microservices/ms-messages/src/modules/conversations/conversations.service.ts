import { prisma } from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import { CreateConversationDto } from "./dto/create-conversation.dto";
import { th } from "zod/v4/locales";

export class ConversationsService {
  private async getCompanyIdByUserId(userId: string): Promise<string> {
    const company = await prisma.company.findUnique({
      where: { id_user: userId },
    });

    if (!company) {
      throw new Error("Company profile not found");
    }

    return company.id;
  }

  private async getTalentIdByUserId(userId: string): Promise<string> {
    const talent = await prisma.talent_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!talent) {
      throw new Error("Talent profile not found");
    }

    return talent.id;
  }

  async createConversation(userId: string, payload: CreateConversationDto) {
    const companyId = await this.getCompanyIdByUserId(userId);
    const { talent_profile_id } = payload;

    const talent = await prisma.talent_profiles.findUnique({
      where: { id: talent_profile_id },
    });

    if (!talent) {
      throw new Error("Talent profile does not exist");
    }

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

        if (conversation) return conversation;
      }

      throw error;
    }
  }

  async getUserConversations(userId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("User not found");
    }

    let whereClause: Prisma.conversationsWhereInput = {};

    if (user.user_type === "company") {
      const companyId = await this.getCompanyIdByUserId(userId);
      whereClause.company_id = companyId;
    } else if (user.user_type === "talent") {
      const talentId = await this.getTalentIdByUserId(userId);
      whereClause.id_profile = talentId;
    } else {
      throw new Error("Invalid user type");
    }

    const conversations = await prisma.conversations.findMany({
      where: whereClause,
      include: {
        messages: {
          orderBy: { created_at: "desc" },
          take: 1,
        },
        company: {
          select: {
            id: true,
            name: true,
            url_logo: true,
          },
        },
        talent_profiles: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            // url_photo: true,
          },
        },
      },
      orderBy: {
        last_message_at: "desc",
      },
    });

    return conversations.map((c) => ({
      id: c.id,
      last_message_at: c.last_message_at,
      last_message: c.messages[0] || null,
      company: c.company,
      talent: c.talent_profiles,
    }));
  }
}
