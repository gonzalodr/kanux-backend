import { prisma } from "../../lib/prisma";
import { CreateLanguageDto } from "./dto/create-language.dto";

export class LanguagesService {
  private async getProfileIdByUserId(userId: string): Promise<string> {
    const profile = await prisma.talent_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new Error("Talent profile not found");
    }

    return profile.id;
  }

  async getMyLanguages(userId: string) {
    const profileId = await this.getProfileIdByUserId(userId);

    return prisma.languages_talent.findMany({
      where: { id_profile: profileId },
      include: {
        languages: true,
      },
    });
  }

  async addLanguage(userId: string, payload: CreateLanguageDto) {
    const profileId = await this.getProfileIdByUserId(userId);
    const { language_id, level } = payload;

    const exists = await prisma.languages_talent.findFirst({
      where: {
        id_profile: profileId,
        id_languages: language_id,
      },
    });

    if (exists) {
      throw new Error("Language already added to this profile");
    }

    return prisma.languages_talent.create({
      data: {
        id_profile: profileId,
        id_languages: language_id,
        level,
      },
    });
  }

  async deleteLanguage(userId: string, languageTalentId: string) {
    const profileId = await this.getProfileIdByUserId(userId);

    const record = await prisma.languages_talent.findUnique({
      where: { id: languageTalentId },
    });

    if (!record) {
      throw new Error("Language not found");
    }

    if (record.id_profile !== profileId) {
      throw new Error("You cannot delete this language");
    }

    return prisma.languages_talent.delete({
      where: { id: languageTalentId },
    });
  }

  async updateLanguage(userId: string, languageTalentId: string, payload: Partial<CreateLanguageDto>) {
    const profileId = await this.getProfileIdByUserId(userId);

    const record = await prisma.languages_talent.findUnique({
      where: { id: languageTalentId },
    });

    if (!record) {
      throw new Error("Language record not found");
    }

    if (record.id_profile !== profileId) {
      throw new Error("You do not have permission to update this language");
    }

    return prisma.languages_talent.update({
      where: { id: languageTalentId },
      data: {
        level:payload.level??"Básico"
      },
    });
  }
}
