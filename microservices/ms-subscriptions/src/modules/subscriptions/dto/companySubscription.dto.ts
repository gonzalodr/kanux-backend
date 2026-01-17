import { z } from 'zod';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending',
  EXPIRED = 'expired',
}

export const CreateCompanySubscriptionSchema = z
  .object({
    status: z.enum(SubscriptionStatus, {
      message: 'Status must be active, inactive, pending or expired',
    }).default(SubscriptionStatus.ACTIVE),
    start_date: z.coerce.date({
      message: "Invalid start date format"
    }),

    end_date: z.coerce.date({
      message: "Invalid end date format"
    }).refine((date) => date > new Date(), {
      message: "End date must be a future date",
    })
  }).refine((obj) => Object.keys(obj).length > 0, {
    message: "Request body cannot be empty",
  });

export type CreateCompanySubscriptionDto = z.infer<typeof CreateCompanySubscriptionSchema>;
