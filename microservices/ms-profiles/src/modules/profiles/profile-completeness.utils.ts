import { prisma } from "../../lib/prisma";

// const PROFILE_COMPLETENESS_RULES = {
//   basicInfo: 20,        // name, title, location, about
//   skills: 20,           // at least 1 skill
//   languages: 20,        // at least 1 language
//   background: 20,       // learning_background_id
//   opportunity: 20,      // opportunity_status_id
// };

export async function calculateProfileCompleteness(profileId: string) {
  let score = 0;

  const profile = await prisma.talent_profiles.findUnique({
    where: { id: profileId },
    include: {
      skills: true,
      languages_talent: true,
    },
  });

  if (!profile) return 0;

  // 1. Basic info
  if (
    profile.first_name &&
    profile.last_name &&
    profile.title &&
    profile.location &&
    profile.about
  ) {
    score += 20;
  }

  // 2. Skills
  if (profile.skills.length > 0) {
    score += 20;
  }

  // 3. Languages
  if (profile.languages_talent.length > 0) {
    score += 20;
  }

  // 4. Background
  if (profile.learning_background_id) {
    score += 20;
  }

  // 5. Opportunity status
  if (profile.opportunity_status_id) {
    score += 20;
  }

  return score;
}
