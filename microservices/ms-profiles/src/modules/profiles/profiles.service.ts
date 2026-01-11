import { prisma } from "../../lib/prisma";
import { UpdateTalentProfileDto } from "./dto/update-talent-profile.dto";

export class ProfilesService {
  async updateMyProfile(userId: string, payload: UpdateTalentProfileDto) {
    const profile = await prisma.talent_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    const {
      title,
      location,
      experience_level,
      education,
      about,
      contact,
      learning_background_id,
      opportunity_status_id,
    } = payload;

    return prisma.talent_profiles.update({
      where: { user_id: userId },
      data: {
        title,
        location,
        experience_level,
        education,
        about,
        contact,
        ...(learning_background_id && {
          learning_backgrounds: {
            connect: { id: learning_background_id },
          },
        }),
        ...(opportunity_status_id && {
          opportunity_statuses: {
            connect: { id: opportunity_status_id },
          },
        }),
      },
    });
  }
}
