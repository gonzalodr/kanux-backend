import { z } from 'zod';

// feature scheme
const TalentPlanFeaturesSchema = z.object({
    can_access_basic_challenges: z.boolean().default(false),
    can_access_advanced_challenges: z.boolean().default(false),
    can_access_detailed_reports: z.boolean().default(false),
});

// talent plan scheme
export const CreateTalentPlanSchema = z.object({
    name: z.string().min(1, "The plan's name is required").max(255),
    description: z.string().nullish(),
    price_monthly: z.number().positive("The price must be greater than 0"),
    features: TalentPlanFeaturesSchema
});

// typed for typescript
export type CreateTalentPlanDto = z.infer<typeof CreateTalentPlanSchema>;