import { prisma } from "../../../lib/prisma"; 

export class ReactionService {

  async toggleReaction(userId: string, postId: string) {

     const user = await prisma.users.findUnique({
          where: { id: userId },
        });
    
        if (!user) {
          throw new Error("USER_NOT_FOUND");
        }

    const post = await prisma.posts.findUnique({
      where: { id: postId },
    });
    if (!post) {
      throw new Error("POST_NOT_FOUND");
    }

  
    const existingReaction = await prisma.post_reactions.findFirst({
      where: {
        id_profile: userId,
        post_id: postId,
      },
    });

    if (existingReaction) {
      await prisma.post_reactions.delete({
        where: { id: existingReaction.id },
      });
      return { message: "Reacción eliminada", action: "removed" };
    } else {
      const reaction = await prisma.post_reactions.create({
        data: {
          post_id: postId,
          id_profile: userId,
        },
      });
      return { message: "Reacción creada", action: "added", reaction };
    }
  }
}
