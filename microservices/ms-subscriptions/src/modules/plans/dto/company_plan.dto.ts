import { z } from 'zod';

// company plan feature scheme
const CompanyPlanFeaturesSchema = z.object({
    max_profile_views_per_month: z.number().int().min(0).default(0),
    can_contact_talent: z.boolean().default(false),
    can_use_advanced_filters: z.boolean().default(false),
    can_create_custom_challenges: z.boolean().default(false),
    can_access_metrics: z.boolean().default(false),
    can_access_reports: z.boolean().default(false),
});

// company plan scheme
export const CreateCompanyPlanSchema = z.object({
    name: z.string().min(1, "The company plan's name is required").max(255),
    description: z.string().nullish(),
    price_monthly: z.number().positive("The price must be greater than 0"),
    features: CompanyPlanFeaturesSchema
});

// type for script
export type CreateCompanyPlanDto = z.infer<typeof CreateCompanyPlanSchema>;