import { prisma } from "../../lib/prisma";
import { UpdateTalentProfileDto } from "./dto/update-talent-profile.dto";
import { CreateTalentProfileDto } from "./dto/create-talent-profile.dto";
import { calculateProfileCompleteness } from "./profile-completeness.utils";
import { uploadToCloudinary } from "../../utility/claudinary.utility";

export class ProfilesService {
  async getMyProfile(userId: string) {
    const profile = await prisma.talent_profiles.findUnique({
      where: { user_id: userId },
      include: {
        skills: {
          include: {
            category: true,
          },
        },
        languages_talent: {
          include: {
            languages: true,
          },
        },
        learning_backgrounds: true,
        opportunity_statuses: true,
      },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    return profile;
  }

  async getPublicTalentProfile(profileId: string) {
    console.log("Fetching public profile for ID:", profileId);
    const profile = await prisma.talent_profiles.findUnique({
      where: { id: profileId },
      select: {
        id: true,
        first_name: true,
        last_name: true,
        title: true,
        location: true,
        experience_level: true,
        about: true,
        education: true,
        profile_completeness: true,
        contact: true,

        skills: {
          select: {
            id: true,
            name: true,
            level: true,
            category: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        languages_talent: {
          select: {
            id: true,
            level: true,
            languages: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },

        learning_backgrounds: {
          select: {
            id: true,
            name: true,
          },
        },

        opportunity_statuses: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    if (!profile) {
      throw new Error("Public profile not found");
    }

    return profile;
  }

  async updateMyProfile(userId: string, payload: UpdateTalentProfileDto, file?: Express.Multer.File) {
    const profile = await prisma.talent_profiles.findUnique({
      where: { user_id: userId },
    });

    if (!profile) {
      throw new Error("Profile not found");
    }

    let imageProfileUrl = profile.image_url;

    if (file) {
      try {
        const result = await uploadToCloudinary(file.buffer, `user_${userId}`);
        imageProfileUrl = result.secure_url;
      } catch (error) {
        throw new Error("Failed to upload profile image");
      }
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
        image_url:imageProfileUrl,
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

  async preregisterProfile(userId: string, data: CreateTalentProfileDto) {
    try {
      const existingProfile = await prisma.talent_profiles.findUnique({ where: { user_id: userId }, });
      if (!existingProfile) { throw new Error("Profile does not exist for this user."); }

      const existingUser = await prisma.users.findUnique({ where: { id: userId } });
      if (!existingUser) { throw new Error("The associated user was not found."); }

      const newProfile = await prisma.talent_profiles.update({
        where: { user_id: userId },
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          title: data.title,
          location: data.location,
          experience_level: data.experience_level,
          education: data.education,
          about: data.about,
          contact: data.contact,
        },
        include: {
          users: true
        }
      });

      const { users, ...profileData } = newProfile;

      return {
        success: true,
        user: {
          id: users?.id,
          email: users?.email,
          user_type: users?.user_type,
          profile: profileData
        }
      };

    } catch (error: any) {
      throw new Error(error.message || "Error during profile pre-registration");
    }
  }
}
