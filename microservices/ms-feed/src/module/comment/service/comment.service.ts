import { prisma } from "../../../lib/prisma";
import {
  CreatePostCommentDTO,
  UpdatePostCommentDTO,
  CreateCommentDto,
} from "../dto/comment.dto";

export class CommentService {
  async createComment(userId: string, payload: CreateCommentDto) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }
    const post = await prisma.posts.findUnique({
      where: { id: payload.post_id },
    });

    if (!post) {
      throw new Error("POST_NOT_FOUND");
    }

    const comment = await prisma.post_comments.create({
      data: {
        content: payload.content,
        post_id: payload.post_id,
        id_profile: userId,
      },
    });

    return comment;
  }

  async deleteComment(userId: string, commentId: string) {
    const user = await prisma.users.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error("USER_NOT_FOUND");
    }

    const comment = await prisma.post_comments.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      throw new Error("COMMENT_NOT_FOUND");
    }
    if (comment.id_profile !== userId) {
      throw new Error("UNAUTHORIZED_ACTION");
    }
    await prisma.post_comments.delete({
      where: { id: commentId },
    });

    return { message: "Comentario eliminado correctamente." };
  }
async  getCommentsByPost(postId: string) {
  const comments = await prisma.post_comments.findMany({
    where: { post_id: postId },
    orderBy: { created_at: "desc" }, 
    include: {
      talent_profiles: {
        include: {
          talent_profiles: true,
          company: true,
        },
      },
    },
  });

  return comments.map((c) => {
    const profile = c.talent_profiles;
    let author = null;

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

    return {
      id: c.id,
      content: c.content,
      created_at: c.created_at,
      author,
    };
  });
}
}
