import { z } from 'zod';
import { ContactStatus, ContactSource } from '@models/Contact.model';

const timestampOmitMask = {
  createdAt: true,
  updatedAt: true,
} as const;

export const contactSchema = z.object({
  id: z.string().uuid(),
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone format'),
  companyId: z.string().uuid(),
  status: z.nativeEnum(ContactStatus),
  source: z.nativeEnum(ContactSource),
  jobTitle: z.string().max(200),
  tags: z.array(z.string().max(50)).max(20),
  notes: z.string().max(5000),
  ownerId: z.string().uuid(),
  lastContactedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const contactAddSchema = contactSchema
  .omit({ id: true, ...timestampOmitMask })
  .extend({
    lastContactedAt: z.string().datetime().nullable().default(null),
    companyId: z.string().uuid().or(z.literal('')).default(''),
    phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone format').or(z.literal('')).default(''),
    jobTitle: z.string().max(200).default(''),
    notes: z.string().max(5000).default(''),
    tags: z.array(z.string().max(50)).max(20).default([]),
  });

export const contactEditSchema = contactSchema
  .omit({ id: true, ...timestampOmitMask })
  .extend({
    companyId: z.string().uuid().or(z.literal('')).optional(),
    phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone format').or(z.literal('')).optional(),
    jobTitle: z.string().max(200).or(z.literal('')).optional(),
    notes: z.string().max(5000).or(z.literal('')).optional(),
  })
  .partial();

export const contactImportSchema = contactSchema
  .omit({ id: true, ...timestampOmitMask })
  .extend({
    companyId: z.string().uuid().or(z.literal('')).default(''),
    phone: z.string().regex(/^\+?[\d\s-()]+$/, 'Invalid phone format').or(z.literal('')).default(''),
    externalId: z.string().optional(),
    skipDuplicateCheck: z.boolean().default(false),
  });

export const contactBulkEditSchema = z.object({
  ids: z.array(z.string().uuid()).min(1),
  updates: contactEditSchema,
});

export type ContactAddPayload = z.infer<typeof contactAddSchema>;
export type ContactEditPayload = z.infer<typeof contactEditSchema>;
export type ContactImportPayload = z.infer<typeof contactImportSchema>;
export type ContactBulkEditPayload = z.infer<typeof contactBulkEditSchema>;
