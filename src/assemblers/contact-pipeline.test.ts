import { describe, it, expect } from 'vitest';
import { ContactAssembler } from '@assemblers/ContactAssembler';
import { contactAddSchema, contactEditSchema } from '@validators/ContactValidator';
import { ContactStatus, ContactSource, type Contact } from '@models/Contact.model';
import { MOCK_USER_ID } from '@mock/contacts.mock';

const mockContact: Contact = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@example.com',
  phone: '+1234567890',
  companyId: '550e8400-e29b-41d4-a716-446655440001',
  status: ContactStatus.Lead,
  source: ContactSource.Website,
  jobTitle: 'Engineer',
  tags: ['vip'],
  notes: 'Important',
  ownerId: MOCK_USER_ID,
  lastContactedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('contact form-to-schema pipeline', () => {
  describe('create flow', () => {
    it('empty form + required fields passes add schema', () => {
      const formValues = ContactAssembler.assembleEmptyForm();
      const enriched = {
        ...formValues,
        firstName: 'New',
        lastName: 'Contact',
        email: 'new@test.com',
        ownerId: MOCK_USER_ID,
      };
      const result = contactAddSchema.safeParse(enriched);
      expect(result.success).toBe(true);
    });

    it('empty form without required fields fails', () => {
      const formValues = ContactAssembler.assembleEmptyForm();
      const result = contactAddSchema.safeParse(formValues);
      expect(result.success).toBe(false);
    });

    it('form with all fields filled passes', () => {
      const formValues = {
        firstName: 'Full',
        lastName: 'Entry',
        email: 'full@test.com',
        phone: '+55 11 99999-9999',
        companyId: '550e8400-e29b-41d4-a716-446655440001',
        status: ContactStatus.Customer,
        source: ContactSource.Referral,
        jobTitle: 'CEO',
        tags: ['vip'],
        notes: 'Complete entry',
        ownerId: MOCK_USER_ID,
        lastContactedAt: null,
      };
      const result = contactAddSchema.safeParse(formValues);
      expect(result.success).toBe(true);
    });

    it('form with empty optional fields still passes', () => {
      const enriched = {
        firstName: 'Minimal',
        lastName: 'User',
        email: 'min@test.com',
        phone: '',
        companyId: '',
        status: ContactStatus.Lead,
        source: ContactSource.Website,
        jobTitle: '',
        tags: [],
        notes: '',
        ownerId: MOCK_USER_ID,
        lastContactedAt: null,
      };
      const result = contactAddSchema.safeParse(enriched);
      expect(result.success).toBe(true);
    });
  });

  describe('edit flow', () => {
    it('direct partial values pass edit schema', () => {
      const edits = { firstName: 'Updated' };
      const result = contactEditSchema.safeParse(edits);
      expect(result.success).toBe(true);
    });

    it('changing just status passes edit schema', () => {
      const edits = { status: ContactStatus.Customer };
      const result = contactEditSchema.safeParse(edits);
      expect(result.success).toBe(true);
    });

    it('assembler output with full fields passes edit schema', () => {
      const previous = ContactAssembler.assembleNormalizedFormContact(mockContact);
      const result = contactEditSchema.safeParse(previous);
      expect(result.success).toBe(true);
    });

    it('invalid email in edit fails schema', () => {
      const result = contactEditSchema.safeParse({ email: 'not-an-email' });
      expect(result.success).toBe(false);
    });

    it('edit schema accepts empty string for phone', () => {
      const result = contactEditSchema.safeParse({ phone: '' });
      expect(result.success).toBe(true);
    });

    it('edit schema accepts empty string for companyId', () => {
      const result = contactEditSchema.safeParse({ companyId: '' });
      expect(result.success).toBe(true);
    });
  });
});
