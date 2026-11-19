import { describe, it, expect } from 'vitest';
import { ActivityAssembler } from '@assemblers/ActivityAssembler';
import { ActivityType, ActivityStatus, type Activity } from '@models/Activity.model';

const mockActivity: Activity = {
  id: 'act-001',
  type: ActivityType.Call,
  subject: 'Follow up call',
  description: 'Discussed pricing',
  status: ActivityStatus.Completed,
  contactId: 'contact-001',
  dealId: 'deal-001',
  companyId: null,
  ownerId: 'user-001',
  dueDate: '2024-03-20T10:00:00.000Z',
  completedAt: '2024-03-20T10:30:00.000Z',
  duration: 30,
  createdAt: '2024-03-19T00:00:00.000Z',
  updatedAt: '2024-03-20T10:30:00.000Z',
};

describe('ActivityAssembler', () => {
  describe('assembleNormalizedFormActivity', () => {
    it('strips id, timestamps, and completedAt', () => {
      const form = ActivityAssembler.assembleNormalizedFormActivity(mockActivity);
      expect(form).not.toHaveProperty('id');
      expect(form).not.toHaveProperty('createdAt');
      expect(form).not.toHaveProperty('updatedAt');
      expect(form).not.toHaveProperty('completedAt');
    });

    it('preserves nullable fields', () => {
      const form = ActivityAssembler.assembleNormalizedFormActivity(mockActivity);
      expect(form.dealId).toBe('deal-001');
      expect(form.companyId).toBeNull();
      expect(form.duration).toBe(30);
    });
  });

  describe('assembleEmptyForm', () => {
    it('returns correct defaults', () => {
      const empty = ActivityAssembler.assembleEmptyForm();
      expect(empty.type).toBe(ActivityType.Note);
      expect(empty.status).toBe(ActivityStatus.Pending);
      expect(empty.dealId).toBeNull();
      expect(empty.companyId).toBeNull();
      expect(empty.dueDate).toBeNull();
      expect(empty.duration).toBeNull();
    });
  });
});
