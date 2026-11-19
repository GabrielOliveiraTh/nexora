import { z } from 'zod';
import { DealStage, DealPriority } from '@models/Deal.model';

const timestampOmitMask = {
  createdAt: true,
  updatedAt: true,
} as const;

export const dealSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  value: z.number().min(0).max(999_999_999),
  currency: z.string().length(3),
  stage: z.nativeEnum(DealStage),
  priority: z.nativeEnum(DealPriority),
  probability: z.number().min(0).max(100),
  contactId: z.string().uuid(),
  companyId: z.string().uuid(),
  pipelineId: z.string().uuid(),
  ownerId: z.string().uuid(),
  expectedCloseDate: z.string().datetime(),
  tags: z.array(z.string().max(50)).max(20),
  notes: z.string().max(5000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const dealAddSchema = dealSchema
  .omit({ id: true, ...timestampOmitMask })
  .extend({
    probability: z.number().min(0).max(100).default(50),
    currency: z.string().length(3).default('USD'),
    companyId: z.string().uuid().or(z.literal('')).default(''),
    pipelineId: z.string().uuid().or(z.literal('')).default(''),
    contactId: z.string().uuid().or(z.literal('')).default(''),
    expectedCloseDate: z.string().datetime().or(z.literal('')).default(''),
    notes: z.string().max(5000).default(''),
    tags: z.array(z.string().max(50)).max(20).default([]),
  });

export const dealEditSchema = dealSchema
  .omit({ id: true, ...timestampOmitMask })
  .extend({
    companyId: z.string().uuid().or(z.literal('')).optional(),
    pipelineId: z.string().uuid().or(z.literal('')).optional(),
    contactId: z.string().uuid().or(z.literal('')).optional(),
    expectedCloseDate: z.string().datetime().or(z.literal('')).optional(),
    notes: z.string().max(5000).or(z.literal('')).optional(),
    tags: z.array(z.string().max(50)).max(20).optional(),
  })
  .partial();

export const dealStageUpdateSchema = z.object({
  id: z.string().uuid(),
  stage: z.nativeEnum(DealStage),
  probability: z.number().min(0).max(100).optional(),
});

export const dealBulkEditSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  updates: dealEditSchema,
});

export type DealAddPayload = z.infer<typeof dealAddSchema>;
export type DealEditPayload = z.infer<typeof dealEditSchema>;
export type DealStageUpdatePayload = z.infer<typeof dealStageUpdateSchema>;
export type DealBulkEditPayload = z.infer<typeof dealBulkEditSchema>;
