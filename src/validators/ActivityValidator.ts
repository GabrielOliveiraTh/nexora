import { z } from 'zod';
import { ActivityType, ActivityStatus } from '@models/Activity.model';

const timestampOmitMask = {
  createdAt: true,
  updatedAt: true,
} as const;

export const activitySchema = z.object({
  id: z.string().uuid(),
  type: z.nativeEnum(ActivityType),
  subject: z.string().min(1).max(200),
  description: z.string().max(10000),
  status: z.nativeEnum(ActivityStatus),
  contactId: z.string().uuid(),
  dealId: z.string().uuid().nullable(),
  companyId: z.string().uuid().nullable(),
  ownerId: z.string().uuid(),
  dueDate: z.string().datetime().nullable(),
  completedAt: z.string().datetime().nullable(),
  duration: z.number().min(0).max(1440).nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const activityAddSchema = activitySchema
  .omit({ id: true, ...timestampOmitMask, completedAt: true })
  .extend({
    status: z.nativeEnum(ActivityStatus).default(ActivityStatus.Pending),
  });

export const activityEditSchema = activitySchema
  .omit({ id: true, ...timestampOmitMask })
  .partial();

export const activityCompleteSchema = z.object({
  id: z.string().uuid(),
  completedAt: z.string().datetime(),
  duration: z.number().min(0).max(1440).nullable(),
  notes: z.string().max(10000).optional(),
});

export type ActivityAddPayload = z.infer<typeof activityAddSchema>;
export type ActivityEditPayload = z.infer<typeof activityEditSchema>;
export type ActivityCompletePayload = z.infer<typeof activityCompleteSchema>;
