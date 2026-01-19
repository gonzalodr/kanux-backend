import { z } from 'zod';
import { ChallengesDifficulty } from '../enums/challengesDifficulty.enum';
import { ChallengesType } from '../enums/chellengesType.enum';
import { QuestionType } from '../enums/questionType.enum';

// Base challenges scheme
const baseChallengeScheme = z.object({
  company_id: z.uuid({ error: "Invalid UUID format" }).optional(),
  title: z.string().min(1, { error: "Title is required" }),
  description: z.string({ error: "Description is required" }),
  difficulty: z.enum(ChallengesDifficulty, { error: `Invalid difficulty level.  Allowed values are: ${Object.values(ChallengesDifficulty).join(', ')}` }),
  duration_minutes: z.number().int({ error: "Duration must be an integer" }).positive({ error: "Duration must be a positive number" })
});

// technical scheme
const metadataScheme = z.object({
  id: z.uuid({ error: "Invalid UUID format" }).optional(),
  source: z.string().min(1, { error: "Source is required" }),
  evaluation_type: z.string().min(1, { error: "Evaluation type is required" }),
})

const technicalChallengeSchema = baseChallengeScheme.extend({
  challenge_type: z.literal(ChallengesType.TECHNICAL_CHALLENGES, { error: `Invalid challenge type.  Allowed values are: ${Object.values(ChallengesType).join(', ')}` }),
  metadata: metadataScheme,
});

// Non-Technical Scheme
// * option scheme
const optionSchema = z.object({
  id: z.uuid().optional(),
  option_text: z.string().min(1, { error: "Option text is required" }),
  is_correct: z.boolean({ error: "Selection is required" }),
});

// * Question scheme
const questionSchema = z.object({
  id: z.uuid().optional(),
  question: z.string().min(1, { error: "Question text is required" }),
  question_type: z.enum(QuestionType,{error:`Invalid difficulty level.  Allowed values are: ${Object.values(QuestionType).join(', ')}`}),
  options: z.array(optionSchema).min(2, { error: "At least 2 options are required" }),
});

const nonTechnicalChallengeSchema = baseChallengeScheme.extend({
  challenge_type: z.literal(ChallengesType.NON_TECHNICAL_CHALLENGES, { error: `Invalid challenge type.  Allowed values are: ${Object.values(ChallengesType).join(', ')}` }),
  //technical data
  details: z.object({
    instructions: z.string().min(1, { error: "Instructions are required" }),
    questions: z.array(questionSchema).min(1, { error: "At least one question is required" }),
  }),
});

//final scheme
export const CreateChallengeScheme = z.discriminatedUnion('challenge_type', [
  technicalChallengeSchema,
  nonTechnicalChallengeSchema,
],{error: `Invalid challenge type. Allowed values are: ${Object.values(ChallengesType).join(', ')}`}
).superRefine((_, ctx) => {const hasInvalidUnion = ctx.issues.some(i => i.code === "invalid_union");
  if (hasInvalidUnion) {ctx.addIssue({
      code: "custom",
      error: `Invalid challenge type. Allowed values are: ${Object.values(ChallengesType).join(', ')}`,
    });
  }
});

export type CreateChallengeDto = z.infer<typeof CreateChallengeScheme>;


