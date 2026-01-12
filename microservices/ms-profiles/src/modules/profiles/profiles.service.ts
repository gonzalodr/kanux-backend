import { prisma } from "../../lib/prisma";
import { UpdateTalentProfileDto } from "./dto/update-talent-profile.dto";
import { calculateProfileCompleteness } from "./profile-completeness.utils";

export class ProfilesService {
  async updateMyProfile(userId: string, payload: UpdateTalentProfileDto) {
    const profile = await prisma.talent_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    const {
      first_name,
      last_name,
      title,
      location,
      experience_level,
      education,
      about,
      contact,
      learning_background_id,
      opportunity_status_id,
    } = payload;

    // 1. Update profile data
    const updatedProfile = await prisma.talent_profiles.update({
      where: { user_id: userId },
      data: {
        first_name,
        last_name,
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

    // 2. Calculate profile completeness
    const completeness = await calculateProfileCompleteness(updatedProfile.id);

    // 3. Save profile completeness
    const finalProfile = await prisma.talent_profiles.update({
      where: { id: updatedProfile.id },
      data: {
        profile_completeness: completeness,
      },
    });

    // 4. Return final profile
    return finalProfile;
  }
}
