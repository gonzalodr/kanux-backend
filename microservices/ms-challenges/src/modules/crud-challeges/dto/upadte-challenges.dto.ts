import { z } from "zod";
import { ChallengesDifficulty } from "../enums/challengesDifficulty.enum";
import { QuestionType } from "../enums/questionType.enum";

//base schema
export const ChallengeBaseUpdateSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().min(1).optional(),
  difficulty: z.enum(ChallengesDifficulty).optional(),
  duration_minutes: z.number().int().positive().optional(),
}).refine(
  d => Object.values(d).some(v => v !== undefined),
  { error: "At least one challenge field must be provided" }
);

export type ChallengeBaseUpdateDto = z.infer<typeof ChallengeBaseUpdateSchema>;


//data schema
export const TechnicalMetadataUpdateSchema = z.object({
  source: z.string().min(1).optional(),
  evaluation_type: z.string().min(1).optional(),
}).refine(
  d => d.source !== undefined || d.evaluation_type !== undefined,
  { error: "At least one metadata field must be provided" }
);

export type TechnicalMetadataUpdateDto = z.infer<typeof TechnicalMetadataUpdateSchema>;

// no technical dto
export const NonTechnicalDetailsUpdateSchema = z.object({
  instructions: z.string().min(1).optional(),
}).refine(
  d => d.instructions !== undefined,
  { error: "Instructions must be provided" }
);

export type NonTechnicalDetailsUpdateDto = z.infer<typeof NonTechnicalDetailsUpdateSchema>;
 

export const NonTechnicalQuestionUpdateSchema = z.object({
  question: z.string().min(1).optional(),
  question_type: z.enum(QuestionType,{error:`Invalid difficulty level.  Allowed values are: ${Object.values(QuestionType).join(', ')}`}).optional(),
}).refine(
  q => q.question !== undefined || q.question_type !== undefined,
  { error: "At least one question field must be provided" }
);

export type NonTechnicalQuestionUpdateDto =z.infer<typeof NonTechnicalQuestionUpdateSchema>;


export const NonTechnicalOptionUpdateSchema = z.object({
  option_text: z.string().min(1).optional(),
  is_correct: z.boolean().optional(),
}).refine(
  o => o.option_text !== undefined || o.is_correct !== undefined,
  { error: "At least one option field must be provided" }
);

export type NonTechnicalOptionUpdateDto = z.infer<typeof NonTechnicalOptionUpdateSchema>;
