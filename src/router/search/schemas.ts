import { z } from 'zod';
import { ContactStatus, ContactSource } from '@models/Contact.model';
import { DealStage, DealPriority } from '@models/Deal.model';

/*
 * Search params come from user-editable URLs, so every field falls back to its
 * default instead of throwing (`.catch`). The serializer turns digit-only
 * values into numbers, so free-text fields accept numbers and coerce them.
 */
const textParam = (fallback: string) =>
  z.union([z.string(), z.number()]).transform(String).catch(fallback);

const optionalTextParam = z.union([z.string(), z.number()]).transform(String).optional().catch(undefined);

const pageParam = z.coerce.number().int().min(1).catch(1);
const pageSizeParam = z.coerce.number().int().min(10).max(100).catch(25);
const sortOrderParam = z.enum(['ascend', 'descend']).catch('descend');

export const contactsSearchSchema = z.object({
  page: pageParam,
  pageSize: pageSizeParam,
  search: textParam(''),
  status: z.nativeEnum(ContactStatus).optional().catch(undefined),
  source: z.nativeEnum(ContactSource).optional().catch(undefined),
  sortField: textParam('createdAt'),
  sortOrder: sortOrderParam,
});

export const dealsSearchSchema = z.object({
  page: pageParam,
  pageSize: pageSizeParam,
  search: textParam(''),
  stage: z.nativeEnum(DealStage).optional().catch(undefined),
  priority: z.nativeEnum(DealPriority).optional().catch(undefined),
  pipelineId: optionalTextParam,
  view: z.enum(['list', 'pipeline']).catch('pipeline'),
  sortField: textParam('createdAt'),
  sortOrder: sortOrderParam,
});

export const dashboardSearchSchema = z.object({
  period: z.enum(['7d', '30d', '90d', '1y']).catch('30d'),
});

export type ContactsSearchParams = z.infer<typeof contactsSearchSchema>;
export type DealsSearchParams = z.infer<typeof dealsSearchSchema>;
export type DashboardSearchParams = z.infer<typeof dashboardSearchSchema>;
