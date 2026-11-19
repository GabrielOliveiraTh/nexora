import { describe, it, expect } from 'vitest';
import { ContactAssembler } from '@assemblers/ContactAssembler';
import { ContactStatus, ContactSource, type Contact } from '@models/Contact.model';

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
  tags: ['vip', 'tech'],
  notes: 'Important client',
  ownerId: '550e8400-e29b-41d4-a716-446655440002',
  lastContactedAt: '2024-01-15T10:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-15T10:00:00.000Z',
};

describe('ContactAssembler', () => {
  describe('assembleNormalizedFormContact', () => {
    it('strips id and timestamps from API response', () => {
      const form = ContactAssembler.assembleNormalizedFormContact(mockContact);

      expect(form).not.toHaveProperty('id');
      expect(form).not.toHaveProperty('createdAt');
      expect(form).not.toHaveProperty('updatedAt');
      expect(form.firstName).toBe('John');
      expect(form.email).toBe('john@example.com');
    });

    it('creates a shallow copy of tags array', () => {
      const form = ContactAssembler.assembleNormalizedFormContact(mockContact);
      expect(form.tags).toEqual(['vip', 'tech']);
      expect(form.tags).not.toBe(mockContact.tags);
    });
  });

  describe('assembleFormNormalizedContact', () => {
    it('detects cleared fields and transforms to empty string', () => {
      const previous = ContactAssembler.assembleNormalizedFormContact(mockContact);
      const edits = { firstName: 'Jane' };
      const merged = ContactAssembler.assembleFormNormalizedContact(previous, edits);

      expect(merged.firstName).toBe('Jane');
      expect(merged.lastName).toBe('');
    });
  });

  describe('assembleEmptyForm', () => {
    it('returns default form state with correct types', () => {
      const empty = ContactAssembler.assembleEmptyForm();

      expect(empty.firstName).toBe('');
      expect(empty.status).toBe(ContactStatus.Lead);
      expect(empty.source).toBe(ContactSource.Website);
      expect(empty.tags).toEqual([]);
      expect(empty.lastContactedAt).toBeNull();
    });
  });
});
