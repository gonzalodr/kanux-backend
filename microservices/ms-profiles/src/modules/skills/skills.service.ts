import { prisma } from "../../lib/prisma";
import { CreateSkillDto } from "./dto/create-skill.dto";

export class SkillsService {
  private async getProfileIdByUserId(userId: string): Promise<string> {
    const profile = await prisma.talent_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new Error("Talent profile not found");
    }

    return profile.id;
  }

  async getMySkills(userId: string) {
    const profileId = await this.getProfileIdByUserId(userId);

    return prisma.skills.findMany({
      where: { id_profile: profileId },
      include: {
        category: true,
      },
    });
  }

  async addSkill(userId: string, payload: CreateSkillDto) {
    const profileId = await this.getProfileIdByUserId(userId);
    const { category_id, name, level } = payload;

    const exists = await prisma.skills.findFirst({
      where: {
        id_profile: profileId,
        id_category: category_id,
        name: name,
      },
    });

    if (exists) {
      throw new Error("Skill already exists for this profile in this category");
    }

    return prisma.skills.create({
      data: {
        id_profile: profileId,
        id_category: category_id,
        name,
        level,
      },
    });
  }

  async deleteSkill(userId: string, skillId: bigint) {
    const profileId = await this.getProfileIdByUserId(userId);

    const skill = await prisma.skills.findUnique({
      where: { id: skillId },
    });

    if (!skill) {
      throw new Error("Skill not found");
    }

    if (skill.id_profile !== profileId) {
      throw new Error("You cannot delete this skill");
    }

    return prisma.skills.delete({
      where: { id: skillId },
    });
  }
}
