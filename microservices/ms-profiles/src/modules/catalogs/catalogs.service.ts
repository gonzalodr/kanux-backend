import { prisma } from "../../lib/prisma";

export class CatalogsService {
  async getAll() {
    const [languages, learningBackgrounds, opportunityStatuses, categories] =
      await Promise.all([
        prisma.languages.findMany({ orderBy: { name: "asc" } }),
        prisma.learning_backgrounds.findMany({ orderBy: { name: "asc" } }),
        prisma.opportunity_statuses.findMany({ orderBy: { name: "asc" } }),
        prisma.category.findMany({
          where: { parent_child: null },
          include: {
            other_category: true,
          },
        }),
      ]);

    return {
      languages,
      learning_backgrounds: learningBackgrounds,
      opportunity_statuses: opportunityStatuses,
      categories,
    };
  }
}
