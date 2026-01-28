import { prisma } from "../../lib/prisma";
import { FeedPostResponse, DashboardStatsResponse } from "./dto/feed.response";

export class DashboardService {
  async getFirstChallenges() {
    const challenges = await prisma.$queryRaw<
      {
        id: string;
        title: string;
        description: string | null;
        challenge_type: string;
        difficulty: string;
        duration_minutes: number | null;
        created_by_company: string | null;
        created_at: Date;
      }[]
    >`
      select * from public.get_first_challenges();
    `;

    return challenges;
  }

  async getDashboardStats(user_id: string): Promise<DashboardStatsResponse> {
    const profile = await prisma.talent_profiles.findUnique({
      where: { user_id: user_id },
      select: { id: true },
    });

    if (!profile) {
      throw new Error("TALENT_PROFILE_NOT_FOUND");
    }

    const [result] = await prisma.$queryRaw<
      {
        skills_count: number;
        completed_challenges_count: number;
        unread_messages_count: number;
        posts_count: number;
      }[]
    >`
    select *
    from get_talent_dashboard_stats(${profile.id}::uuid);
  `;

    return {
      skillsCount: Number(result.skills_count),
      completedChallengesCount: Number(result.completed_challenges_count),
      unreadMessagesCount: Number(result.unread_messages_count),
      postsCount: Number(result.posts_count),
    };
  }

  async getAllPosts(userId?: string): Promise<FeedPostResponse[]> {
    const posts = await prisma.posts.findMany({
      take: 5,
      orderBy: { created_at: "desc" },
      where: userId
        ? {
            NOT: { id_profile: userId },
          }
        : {},
      include: {
        post_comments: {
          include: {
            talent_profiles: {
              include: {
                users: {
                  include: {
                    company: true,
                  },
                },
              },
            },
          },
        },
        post_reactions: {
          include: {
            talent_profiles: {
              include: {
                users: {
                  include: {
                    company: true,
                  },
                },
              },
            },
          },
        },
        talent_profiles: {
          include: {
            users: {
              include: {
                company: true,
              },
            },
          },
        },
      },
    });

    return posts.map((post: (typeof posts)[number]) => {
      const isOwner = userId ? post.id_profile === userId : false;

      const isLikedByMe = userId
        ? post.post_reactions.some(
            (reaction: { id_profile: string | null }) =>
              reaction.id_profile === userId,
          )
        : false;

      let author: FeedPostResponse["author"] = null;
      const profile = post.talent_profiles;

      if (profile?.users) {
        if (
          profile.users.company &&
          Array.isArray(profile.users.company) &&
          profile.users.company.length > 0
        ) {
          author = {
            id: profile.id,
            first_name: profile.users.company[0].name ?? null,
            last_name: null,
            title: null,
          };
        } else {
          author = {
            id: profile.id,
            first_name: profile.first_name ?? null,
            last_name: profile.last_name ?? null,
            title: profile.title ?? null,
          };
        }
      }
      const commentsCount = post.post_comments.length;
      const reactionsCount = post.post_reactions.length;

      return {
        id: post.id,
        content: post.content,
        created_at: post.created_at,
        author,
        commentsCount,
        reactionsCount,
        comments: [],
        reactions: [],
        isOwner,
        isLikedByMe,
      };
    });
  }
}
