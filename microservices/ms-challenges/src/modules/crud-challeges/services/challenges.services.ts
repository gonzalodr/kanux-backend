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

    async getChallengesByCompany(id_company?: string, page: number = 1, limit: number = 10) {
        // calculate position register
        const skip = (page - 1) * limit;
        // valid exist the company
        if (id_company) {
            const validateCompany = await prisma.company.findUnique({ where: { id: id_company } });
            if (!validateCompany) throw new Error("Company not found");
        }

        //get challenges paginate
        const [challenges, totalCount] = await Promise.all([
            prisma.challenges.findMany({
                where: { created_by_company: id_company || null },
                skip: skip,
                take: limit,
                include: {
                    technical_challenge_metadata: true,
                    non_technical_challenges: {
                        include: {
                            non_technical_questions: {
                                include: { non_technical_question_options: true },
                            },
                        },
                    },
                    challenge_submissions: { select: { score: true } },
                },
                orderBy: { created_at: 'desc' },
            }),
            prisma.challenges.count({
                where: { created_by_company: id_company || null }
            })
        ]);

        if (challenges.length === 0) return { data: [], meta: { total: 0, page, last_page: 0 } };

        // mapping metrics
        const mappedChallenges = challenges.map((challenge) => {
            const submissions = challenge.challenge_submissions || [];
            const totalSub = submissions.length;
            const averageScore = totalSub > 0
                ? submissions.reduce((acc, curr) => acc + (curr.score || 0), 0) / totalSub
                : 0;

            return {
                ...challenge,
                metrics: {
                    total_submissions: totalSub,
                    average_score: totalSub > 0 ? Number(averageScore.toFixed(2)) : 0,
                },
            };
        });

        // return pagination
        return {
            data: mappedChallenges,
            meta: {
                total_records: totalCount,
                current_page: page,
                limit: limit,
                total_pages: Math.ceil(totalCount / limit),
            }
        };
    }
    //b32dd184-e81f-4cc4-b72b-bbea0635af15
    async getChallengeSubmissions(id_challenge: string, id_company: string) {
        const validateCompany = await prisma.company.findUnique({ where: { id: id_company } });
        if (!validateCompany) throw new Error("Company not found");

        const challenge = await prisma.challenges.findUnique({
            where: { id: id_challenge },
            select: { created_by_company: true }
        });

        if (!challenge) {
            throw new Error("Challenge not found");
        }

        if (id_company && challenge.created_by_company !== id_company) {
            throw new Error("Unauthorized: This challenge does not belong to your company");
        }

        const challenge_submissions = await prisma.challenge_submissions.findMany({
            where: { challenge_id: id_challenge },
            include: {
                talent_profiles: {
                    select: {
                        first_name: true,
                        last_name: true
                    }
                }
            },
            orderBy: {
                score: 'desc'
            }
        });
        return challenge_submissions.map(sub => ({
            talent_name: `${sub.talent_profiles?.first_name}`,
            score: sub.score,
            resolution_date: sub.created_at,
            status: sub.status,
            evaluation_type: sub.evaluation_type
        }));
    }
    
    async technicalEvaluation(id_submission: string) {
        // valid submission
        const submission = await prisma.challenge_submissions.findUnique({
            where: { id: id_submission }
        });

        if (!submission) { throw new Error("Submission not found"); }


        const randomScore = Math.floor(Math.random() * (100 - 70 + 1)) + 70;

        const feedbacks = [
            "Enfoque integral que combina sólidos conocimientos técnicos con buena comunicación.",
            "Balance excelente entre habilidades técnicas y blandas.",
            "Solución técnica robusta presentada de manera clara y concisa.",
            "Capacidad para traducir conceptos técnicos a lenguaje accesible.",
            "Desempeño destacado tanto en implementación como en explicación.",
            "Pensamiento técnico profundo combinado con habilidades interpersonales.",
            "Metodología de trabajo efectiva que integra aspectos técnicos y colaborativos.",
            "Capacidad para justificar decisiones técnicas con argumentos sólidos.",
            "Equilibrio entre perfección técnica y pragmatismo en la solución.",
            "Visión holística que considera aspectos técnicos y de usuario."
        ];
        const randomFeedback = feedbacks[Math.floor(Math.random() * feedbacks.length)];

        return await prisma.$transaction(async (tx) => {
            const updatedSubmission = await tx.challenge_submissions.update({
                where: { id: id_submission },
                data: {
                    score: randomScore,
                    status: 'evaluada'
                }
            });

            await tx.challenge_ai_feedback.create({
                data: {
                    submission_id: id_submission,
                    feedback: randomFeedback
                }
            });

            return {
                ...updatedSubmission,
                ai_feedback: randomFeedback
            };
        });
    }
}
