import { prisma } from "../../../lib/prisma";

export async function validateChallengeOwnership(tx: any,challengeId: string,id_company?: string) {
  const challenge = await tx.challenges.findUnique({where: { id: challengeId },});

  if (!challenge) {throw new Error("Challenge not found");}

  if (id_company && challenge.created_by_company && challenge.created_by_company !== id_company) {
    throw new Error("Unauthorized: You do not have permission to edit this challenge");
  }

  return challenge;
}

export async function validateFromQuestion(tx: any,questionId: string,id_company?: string) {
  const question = await tx.non_technical_questions.findUnique({where: { id: questionId },
    include: {
      non_technical_challenges: {
        include: { challenges: true },
      },
    },
  });

  if (!question) {throw new Error("Question not found");}
  const challenge = question.non_technical_challenges.challenges;
  if (id_company && challenge.created_by_company && challenge.created_by_company !== id_company) {
    throw new Error("Unauthorized: You do not have permission to edit this challenge");
  }
  return { question, challenge };
}

export async function validateFromOption(tx: any,optionId: string,id_company?: string) {
  const option = await tx.non_technical_question_options.findUnique({where: { id: optionId },
    include: {
      non_technical_questions: {
        include: {
          non_technical_challenges: {
            include: { challenges: true },
          },
        },
      },
    },
  });
  if (!option) {throw new Error("Option not found");}

  const challenge = option.non_technical_questions.non_technical_challenges.challenges;

  if (id_company && challenge.created_by_company && challenge.created_by_company !== id_company) {
    throw new Error("Unauthorized: You do not have permission to edit this challenge");
  }

  return { option, challenge };
}
