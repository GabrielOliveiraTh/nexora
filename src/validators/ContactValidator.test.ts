import { describe, it, expect } from 'vitest';
import { contactAddSchema, contactEditSchema, contactImportSchema, contactBulkEditSchema } from '@validators/ContactValidator';
import { ContactStatus, ContactSource } from '@models/Contact.model';

describe('ContactValidator', () => {
  const validPayload = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    companyId: '550e8400-e29b-41d4-a716-446655440001',
    status: ContactStatus.Lead,
    source: ContactSource.Website,
    jobTitle: 'Engineer',
    tags: ['vip'],
    notes: '',
    ownerId: '550e8400-e29b-41d4-a716-446655440002',
    lastContactedAt: null,
  };

  describe('contactAddSchema', () => {
    it('validates a complete payload', () => {
      const result = contactAddSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('rejects missing required fields', () => {
      const result = contactAddSchema.safeParse({ firstName: 'John' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid email', () => {
      const result = contactAddSchema.safeParse({ ...validPayload, email: 'invalid' });
      expect(result.success).toBe(false);
    });

    it('rejects invalid phone format', () => {
      const result = contactAddSchema.safeParse({ ...validPayload, phone: 'abc' });
      expect(result.success).toBe(false);
    });

    it('enforces max tag count', () => {
      const result = contactAddSchema.safeParse({
        ...validPayload,
        tags: Array.from({ length: 21 }, (_, i) => `tag-${i}`),
      });
      expect(result.success).toBe(false);
    });

    it('accepts empty string for phone (optional field)', () => {
      const result = contactAddSchema.safeParse({ ...validPayload, phone: '' });
      expect(result.success).toBe(true);
    });

    it('accepts empty string for companyId (optional field)', () => {
      const result = contactAddSchema.safeParse({ ...validPayload, companyId: '' });
      expect(result.success).toBe(true);
    });

    it('defaults optional fields when omitted', () => {
      const minimal = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane@example.com',
        status: ContactStatus.Lead,
        source: ContactSource.Website,
        ownerId: '550e8400-e29b-41d4-a716-446655440002',
      };
      const result = contactAddSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.tags).toEqual([]);
        expect(result.data.notes).toBe('');
        expect(result.data.phone).toBe('');
        expect(result.data.jobTitle).toBe('');
        expect(result.data.companyId).toBe('');
        expect(result.data.lastContactedAt).toBeNull();
      }
    });

    it('still validates UUID format when companyId is provided', () => {
      const result = contactAddSchema.safeParse({ ...validPayload, companyId: 'not-a-uuid' });
      expect(result.success).toBe(false);
    });

    it('still validates phone regex when phone is provided', () => {
      const result = contactAddSchema.safeParse({ ...validPayload, phone: 'letters' });
      expect(result.success).toBe(false);
    });
  });

  describe('contactEditSchema', () => {
    it('allows partial updates', () => {
      const result = contactEditSchema.safeParse({ firstName: 'Jane' });
      expect(result.success).toBe(true);
    });

    it('validates field types even on partial', () => {
      const result = contactEditSchema.safeParse({ email: 'not-email' });
      expect(result.success).toBe(false);
    });

    it('allows updating just status', () => {
      const result = contactEditSchema.safeParse({ status: ContactStatus.Customer });
      expect(result.success).toBe(true);
    });

    it('allows updating multiple fields', () => {
      const result = contactEditSchema.safeParse({
        firstName: 'Jane',
        lastName: 'Smith',
        status: ContactStatus.Qualified,
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid enum value', () => {
      const result = contactEditSchema.safeParse({ status: 'invalid_status' });
      expect(result.success).toBe(false);
    });
  });

  describe('contactImportSchema', () => {
    it('accepts optional externalId', () => {
      const result = contactImportSchema.safeParse({
        ...validPayload,
        externalId: 'ext-123',
      });
      expect(result.success).toBe(true);
    });

    it('defaults skipDuplicateCheck to false', () => {
      const result = contactImportSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.skipDuplicateCheck).toBe(false);
      }
    });
  });

  describe('contactBulkEditSchema', () => {
    it('requires at least one id', () => {
      const result = contactBulkEditSchema.safeParse({
        ids: [],
        updates: { firstName: 'Jane' },
      });
      expect(result.success).toBe(false);
    });

    it('validates bulk edit with ids and partial updates', () => {
      const result = contactBulkEditSchema.safeParse({
        ids: ['550e8400-e29b-41d4-a716-446655440000'],
        updates: { status: ContactStatus.Qualified },
      });
      expect(result.success).toBe(true);
    });
  });
});
