import { z } from 'zod';
import { SubscriptionStatus } from '../enums/subscriptionStatus.enum';

export const CreateTalentSubscriptionSchema = z.object({
    status: z.enum(SubscriptionStatus, { message: "Status must be active, inactive, pending or expired" })
    .default(SubscriptionStatus.ACTIVE),
    start_date: z.coerce.date({
        message: "Invalid start date format",
    }),
    end_date: z.coerce.date({
        message: "Invalid end date format",
    }).refine((date) => date > new Date(), {
        message: "End date must be a future date",
    }),
}).refine((obj) => Object.keys(obj).length > 0, {
  message: "Request body cannot be empty",
});

export type CreateTalentSubscriptionDto = z.infer<typeof CreateTalentSubscriptionSchema>;