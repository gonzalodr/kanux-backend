import { CreateChallengeDto } from "../dto/create-challenges.dto";
import {
    ChallengeBaseUpdateDto,
    TechnicalMetadataUpdateDto,
    NonTechnicalDetailsUpdateDto,
    NonTechnicalQuestionUpdateDto,
    NonTechnicalOptionUpdateDto
} from "../dto/upadte-challenges.dto";
import { prisma } from "../../../lib/prisma";
import { ChallengesType } from '../enums/chellengesType.enum';
import { validateChallengeOwnership, validateFromQuestion, validateFromOption } from '../helpers/challenges.helpers'


export class ChallengesServices {

    async createChallenges(id_company: string, data: CreateChallengeDto) {
        // validate company if  id_company is not null
        if (id_company) {
            const validateCompany = await prisma.company.findUnique({ where: { id: id_company } });
            if (!validateCompany) {
                throw new Error(`The Company not found`);
            }
        }

        return await prisma.$transaction(async (tx) => {
            // create new Challenge
            const newChallenge = await tx.challenges.create({
                data: {
                    title: data.title,
                    description: data.description,
                    challenge_type: data.challenge_type,
                    difficulty: data.difficulty,
                    duration_minutes: data.duration_minutes,
                    created_by_company: id_company ? id_company : null,
                },
            });

            // create challenge metada or challenge question
            if (data.challenge_type === ChallengesType.TECHNICAL_CHALLENGES) {
                //create challenge metada
                await tx.technical_challenge_metadata.create({
                    data: {
                        challenge_id: newChallenge.id,
                        source: data.metadata.source,
                        evaluation_type: data.metadata.evaluation_type,
                    },
                });
            } else {
                // create challenges non-technical (questions/options)
                const nonTechChallenge = await tx.non_technical_challenges.create({
                    data: {
                        challenge_id: newChallenge.id,
                        instructions: data.details.instructions,
                    },
                });

                // create question in cascade
                for (const q of data.details.questions) {
                    await tx.non_technical_questions.create({
                        data: {
                            non_technical_challenge_id: nonTechChallenge.id,
                            question: q.question,
                            question_type: q.question_type,

                            non_technical_question_options: {
                                create: q.options.map(opt => ({
                                    option_text: opt.option_text,
                                    is_correct: opt.is_correct,
                                })),
                            },
                        },
                    });
                }
            }

            return tx.challenges.findUnique({
                where: { id: newChallenge.id },
                include: {
                    technical_challenge_metadata: true,
                    non_technical_challenges: {
                        include: {
                            non_technical_questions: {
                                include: {
                                    non_technical_question_options: true,
                                },
                            },
                        },
                    },
                },
            });
        });
    }

    async updateChallengeBase(challengeId: string, id_company: string | undefined, data: ChallengeBaseUpdateDto) {
        return prisma.$transaction(async (tx) => {
            await validateChallengeOwnership(tx, challengeId, id_company);
            await tx.challenges.update({
                where: { id: challengeId },
                data,
            });

            return { message: "Challenge updated successfully" };
        });
    }

    async updateTechnicalMetadata(challengeId: string, id_company: string | undefined, data: TechnicalMetadataUpdateDto) {
        return prisma.$transaction(async (tx) => {
            const challenge = await validateChallengeOwnership(tx, challengeId, id_company);

            if (challenge.challenge_type !== ChallengesType.TECHNICAL_CHALLENGES) {
                throw new Error("This challenge is not technical");
            }
            const existing = await tx.technical_challenge_metadata.findFirst({
                where: { challenge_id: challengeId },
            });

            if (existing) {
                await tx.technical_challenge_metadata.update({
                    where: { id: existing.id },
                    data,
                });
            } else {
                await tx.technical_challenge_metadata.create({
                    data: {
                        challenge_id: challengeId,
                        ...data,
                    },
                });
            }
            return { message: "Metadata updated successfully" };
        });
    }

    async updateNonTechnicalDetails(challengeId: string, id_company: string | undefined, data: NonTechnicalDetailsUpdateDto) {
        return prisma.$transaction(async (tx) => {
            const challenge = await validateChallengeOwnership(tx, challengeId, id_company);

            if (challenge.challenge_type !== ChallengesType.NON_TECHNICAL_CHALLENGES) { throw new Error("This challenge is not non-technical"); }

            const nonTech = await tx.non_technical_challenges.findFirst({ where: { challenge_id: challengeId }, });

            if (!nonTech) { throw new Error("Non technical data not found"); }

            await tx.non_technical_challenges.update({ where: { id: nonTech.id }, data, });

            return { message: "Details updated successfully" };
        });
    }

    async updateNonTechnicalQuestion(questionId: string, id_company: string | undefined, data: NonTechnicalQuestionUpdateDto) {
        return prisma.$transaction(async (tx) => {
            await validateFromQuestion(tx, questionId, id_company);
            await tx.non_technical_questions.update({
                where: { id: questionId },
                data,
            });
            return { message: "Question updated successfully" };
        });
    }

    async createNonTechnicalQuestion(nonTechnicalChallengeId: string, challengeId: string, id_company: string | undefined, data: { question: string; question_type: string; }) {
        return prisma.$transaction(async (tx) => {
            await validateChallengeOwnership(tx, challengeId, id_company);
            const created = await tx.non_technical_questions.create({
                data: {
                    non_technical_challenge_id: nonTechnicalChallengeId,
                    ...data,
                },
            });

            return created;
        });
    }

    async updateNonTechnicalOption(optionId: string, id_company: string | undefined, data: NonTechnicalOptionUpdateDto) {
        return prisma.$transaction(async (tx) => {
            await validateFromOption(tx, optionId, id_company);
            await tx.non_technical_question_options.update({
                where: { id: optionId },
                data,
            });
            return { message: "Option updated successfully" };
        });
    }

    async createNonTechnicalOption(questionId: string, id_company: string | undefined, data: { option_text: string; is_correct: boolean; }) {
        return prisma.$transaction(async (tx) => {
            await validateFromQuestion(tx, questionId, id_company);

            const created = await tx.non_technical_question_options.create({
                data: {
                    question_id: questionId,
                    ...data,
                },
            });

            return created;
        });
    }
}
