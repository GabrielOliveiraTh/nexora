import { describe, it, expect } from 'vitest';
import { companyAddSchema, companyEditSchema } from '@validators/CompanyValidator';
import { CompanySize, CompanyIndustry } from '@models/Company.model';

describe('CompanyValidator', () => {
  const validPayload = {
    name: 'Acme Corp',
    domain: 'acme.com',
    industry: CompanyIndustry.Technology,
    size: CompanySize.Enterprise,
    website: 'https://acme.com',
    phone: '+1234567890',
    address: '123 Main St',
    city: 'San Francisco',
    country: 'US',
    annualRevenue: 10000000,
    employeeCount: 500,
    ownerId: '550e8400-e29b-41d4-a716-446655440001',
    tags: ['tech', 'enterprise'],
    notes: '',
  };

  describe('companyAddSchema', () => {
    it('validates a correct payload', () => {
      const result = companyAddSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects empty name', () => {
      const result = companyAddSchema.safeParse({ ...validPayload, name: '' });
      expect(result.success).toBe(false);
    });

    it('accepts empty website', () => {
      const result = companyAddSchema.safeParse({ ...validPayload, website: '' });
      expect(result.success).toBe(true);
    });

    it('rejects invalid website URL', () => {
      const result = companyAddSchema.safeParse({ ...validPayload, website: 'not-a-url' });
      expect(result.success).toBe(false);
    });

    it('accepts null revenue and employee count', () => {
      const result = companyAddSchema.safeParse({
        ...validPayload,
        annualRevenue: null,
        employeeCount: null,
      });
      expect(result.success).toBe(true);
    });

    it('rejects negative employee count', () => {
      const result = companyAddSchema.safeParse({ ...validPayload, employeeCount: -5 });
      expect(result.success).toBe(false);
    });
  });

  describe('companyEditSchema', () => {
    it('allows partial updates', () => {
      const result = companyEditSchema.safeParse({ name: 'New Name' });
      expect(result.success).toBe(true);
    });
  });
});
