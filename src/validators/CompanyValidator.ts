import { z } from 'zod';
import { CompanySize, CompanyIndustry } from '@models/Company.model';

const timestampOmitMask = {
  createdAt: true,
  updatedAt: true,
} as const;

export const companySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(200),
  domain: z.string().max(200),
  industry: z.nativeEnum(CompanyIndustry),
  size: z.nativeEnum(CompanySize),
  website: z.string().url().or(z.literal('')),
  phone: z.string().regex(/^\+?[\d\s-()]*$/).or(z.literal('')),
  address: z.string().max(500),
  city: z.string().max(100),
  country: z.string().max(100),
  annualRevenue: z.number().min(0).nullable(),
  employeeCount: z.number().int().min(0).nullable(),
  ownerId: z.string().uuid(),
  tags: z.array(z.string().max(50)).max(20),
  notes: z.string().max(5000),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const companyAddSchema = companySchema.omit({ id: true, ...timestampOmitMask });

export const companyEditSchema = companySchema
  .omit({ id: true, ...timestampOmitMask })
  .partial();

export type CompanyAddPayload = z.infer<typeof companyAddSchema>;
export type CompanyEditPayload = z.infer<typeof companyEditSchema>;
