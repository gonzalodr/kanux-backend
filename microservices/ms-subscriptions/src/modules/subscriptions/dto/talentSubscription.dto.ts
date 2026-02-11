import { z } from 'zod';
import { SubscriptionStatus } from '../enums/subscriptionStatus.enum';

export const CreateTalentSubscriptionSchema = z.object({
    status: z.enum(SubscriptionStatus, { message: "Status must be active, inactive, pending or expired" })
    .default(SubscriptionStatus.ACTIVE),
}).refine((obj) => Object.keys(obj).length > 0, {
  message: "Request body cannot be empty",
});

export type CreateTalentSubscriptionDto = z.infer<typeof CreateTalentSubscriptionSchema>;