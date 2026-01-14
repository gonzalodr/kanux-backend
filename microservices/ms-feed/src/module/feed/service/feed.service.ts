import { prisma } from "../../../lib/prisma";
import { CreatePostDto } from "../dto/post.dto";
import { FeedPostResponse } from "../dto/feed.response";






export class FeedService {
  async createPost(userId: string, payload: CreatePostDto) {

      const user = await prisma.users.findUnique({
      where: { id: userId },
      include: {
         company: true,
      talent_profiles: true,
      },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    return prisma.posts.create({
      data: {
        content: payload.content,
        id_profile: userId,
      },
    });
  }

  async updatePost(userId: string, postId: string, payload: CreatePostDto) {

  const post = await prisma.posts.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new Error("POST_NOT_FOUND");
  }


  if (post.id_profile !== userId) {
    throw new Error("UNAUTHORIZED_ACTION");
  }

  const updatedPost = await prisma.posts.update({
    where: { id: postId },
    data: {
      content: payload.content,
    },
  });

  return updatedPost;
}


   async deletePost(userId: string, postId: string) {
   
    const post = await prisma.posts.findUnique({
      where: { id: postId },
    });

    if (!post) {
      throw new Error("POST_NOT_FOUND");
    }

    if (post.id_profile !== userId) {
      throw new Error("FORBIDDEN_DELETE_POST");
    }
    await prisma.$transaction([
      prisma.post_reactions.deleteMany({
        where: { post_id: postId },
      }),

      prisma.post_comments.deleteMany({
        where: { post_id: postId },
      }),

      prisma.posts.delete({
        where: { id: postId },
      }),
    ]);

    return true;
  }
async getAllPosts(userId?: string): Promise<FeedPostResponse[]> {
  const posts = await prisma.posts.findMany({
  orderBy: { created_at: "desc" },
  include: {
    post_comments: {
      include: {
        talent_profiles: { 
          include: {
            talent_profiles: true,
            company: true,
          },
        },
      },
    },
    post_reactions: {
      include: {
        talent_profiles: { 
          include: {
            talent_profiles: true,
            company: true,
          },
        },
      },
    },
    talent_profiles: { 
      include: {
        talent_profiles: true,
        company: true,
      },
    },
  },
});

 return posts.map((post: typeof posts[number]) => {
  const isOwner = userId ? post.id_profile === userId : false;

  const isLikedByMe = userId
    ? post.post_reactions.some(
        (reaction: { id_profile: string | null }) => reaction.id_profile === userId
      )
    : false;

 
  let author: FeedPostResponse["author"] = null;
  const profile = post.talent_profiles;

  if (profile?.talent_profiles) {
    author = {
      id: profile.id,
      first_name: profile.talent_profiles.first_name ?? null,
      last_name: profile.talent_profiles.last_name ?? null,
      title: profile.talent_profiles.title ?? null,
    };
  } else if (profile?.company) {
    author = {
      id: profile.id,
      first_name: profile.company.name ?? null,
      last_name: null,
      title: null,
    };
  }

  
  const comments = post.post_comments.map((c: typeof post.post_comments[number]) => {
    const cAuthorProfile = c.talent_profiles;
    let commentAuthor: FeedPostResponse["author"] | null = null;

    if (cAuthorProfile?.talent_profiles) {
      commentAuthor = {
        id: cAuthorProfile.id,
        first_name: cAuthorProfile.talent_profiles.first_name ?? null,
        last_name: cAuthorProfile.talent_profiles.last_name ?? null,
        title: cAuthorProfile.talent_profiles.title ?? null,
      };
    } else if (cAuthorProfile?.company) {
      commentAuthor = {
        id: cAuthorProfile.id,
        first_name: cAuthorProfile.company.name ?? null,
        last_name: null,
        title: null,
      };
    }

    return {
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      author: commentAuthor,
    };
  });


  const reactions = post.post_reactions.map((r: typeof post.post_reactions[number]) => {
    const rAuthorProfile = r.talent_profiles;
    let reactionAuthor: FeedPostResponse["author"] | null = null;

    if (rAuthorProfile?.talent_profiles) {
      reactionAuthor = {
        id: rAuthorProfile.id,
        first_name: rAuthorProfile.talent_profiles.first_name ?? null,
        last_name: rAuthorProfile.talent_profiles.last_name ?? null,
        title: rAuthorProfile.talent_profiles.title ?? null,
      };
    } else if (rAuthorProfile?.company) {
      reactionAuthor = {
        id: rAuthorProfile.id,
        first_name: rAuthorProfile.company.name ?? null,
        last_name: null,
        title: null,
      };
    }

    return {
      id: r.id,
      created_at: r.created_at,
      author: reactionAuthor,
    };
  });

  return {
    id: post.id,
    content: post.content,
    created_at: post.created_at,
    author,
    commentsCount: post.post_comments.length,
    reactionsCount: post.post_reactions.length,
    comments,   
    reactions,  
    isOwner,
    isLikedByMe,
  };
});
}

async getMyPosts(userId: string): Promise<FeedPostResponse[]> {

  const user = await prisma.users.findUnique({ where: { id: userId } });
  if (!user) throw new Error("USER_NOT_FOUND");

 
  const posts = await prisma.posts.findMany({
    where: { id_profile: userId },
    orderBy: { created_at: "desc" },
    include: {
      post_comments: {
        include: {
          talent_profiles: { 
            include: {
              talent_profiles: true,
              company: true,
            },
          },
        },
      },
      post_reactions: {
        include: {
          talent_profiles: { 
            include: {
              talent_profiles: true,
              company: true,
            },
          },
        },
      },
      talent_profiles: { 
        include: {
          talent_profiles: true,
          company: true,
        },
      },
    },
  });

  return posts.map((post: typeof posts[number]) => {
    const isOwner = post.id_profile === userId;

    const isLikedByMe = post.post_reactions.some(
      (reaction: { id_profile: string | null }) => reaction.id_profile === userId
    );

    let author: FeedPostResponse["author"] | null = null;
    const profile = post.talent_profiles;

    if (profile?.talent_profiles) {
      author = {
        id: profile.id,
        first_name: profile.talent_profiles.first_name ?? null,
        last_name: profile.talent_profiles.last_name ?? null,
        title: profile.talent_profiles.title ?? null,
      };
    } else if (profile?.company) {
      author = {
        id: profile.id,
        first_name: profile.company.name ?? null,
        last_name: null,
        title: null,
      };
    }

    const comments = post.post_comments.map(
      (c: typeof post.post_comments[number]) => {
        const cProfile = c.talent_profiles;
        let commentAuthor: FeedPostResponse["author"] | null = null;

        if (cProfile?.talent_profiles) {
          commentAuthor = {
            id: cProfile.id,
            first_name: cProfile.talent_profiles.first_name ?? null,
            last_name: cProfile.talent_profiles.last_name ?? null,
            title: cProfile.talent_profiles.title ?? null,
          };
        } else if (cProfile?.company) {
          commentAuthor = {
            id: cProfile.id,
            first_name: cProfile.company.name ?? null,
            last_name: null,
            title: null,
          };
        }

        return {
          id: c.id,
          content: c.content,
          created_at: c.created_at,
          author: commentAuthor,
        };
      }
    );


    const reactions = post.post_reactions.map(
      (r: typeof post.post_reactions[number]) => {
        const rProfile = r.talent_profiles;
        let reactionAuthor: FeedPostResponse["author"] | null = null;

        if (rProfile?.talent_profiles) {
          reactionAuthor = {
            id: rProfile.id,
            first_name: rProfile.talent_profiles.first_name ?? null,
            last_name: rProfile.talent_profiles.last_name ?? null,
            title: rProfile.talent_profiles.title ?? null,
          };
        } else if (rProfile?.company) {
          reactionAuthor = {
            id: rProfile.id,
            first_name: rProfile.company.name ?? null,
            last_name: null,
            title: null,
          };
        }

        return {
          id: r.id,
          created_at: r.created_at,
          author: reactionAuthor,
        };
      }
    );

    return {
      id: post.id,
      content: post.content,
      created_at: post.created_at,
      author,
      commentsCount: post.post_comments.length,
      reactionsCount: post.post_reactions.length,
      comments,   
      reactions,  
      isOwner,
      isLikedByMe,
    };
  });
}

//IMPLEMENTATION IN THE NEXT SPRINT 
 // private async validateUser(userId: string) {
  //  const user = await prisma.users.findUnique({
  //    where: { id: userId },
  //    select: {
  //      id: true,
  //      user_type: true,
  //    },
 //   });

  //  if (!user) {
  //    throw new Error("USER_NOT_FOUND");
  //  }
  //  if (!["talent", "company"].includes(user.user_type)) {
  //    throw new Error("USER_NOT_ALLOWED");
  //  }

 //   return user;
 // }
}
