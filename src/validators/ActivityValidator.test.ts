import { describe, it, expect } from 'vitest';
import { activityAddSchema, activityEditSchema, activityCompleteSchema } from '@validators/ActivityValidator';
import { ActivityType, ActivityStatus } from '@models/Activity.model';

describe('ActivityValidator', () => {
  const validPayload = {
    type: ActivityType.Call,
    subject: 'Follow up',
    description: 'Discuss proposal',
    status: ActivityStatus.Pending,
    contactId: '550e8400-e29b-41d4-a716-446655440001',
    dealId: null,
    companyId: null,
    ownerId: '550e8400-e29b-41d4-a716-446655440002',
    dueDate: '2024-04-01T10:00:00.000Z',
    duration: null,
  };

  describe('activityAddSchema', () => {
    it('validates a correct payload', () => {
      const result = activityAddSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('defaults status to Pending', () => {
      const { status: _, ...withoutStatus } = validPayload;
      const result = activityAddSchema.safeParse(withoutStatus);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.status).toBe(ActivityStatus.Pending);
      }
    });

    it('rejects empty subject', () => {
      const result = activityAddSchema.safeParse({ ...validPayload, subject: '' });
      expect(result.success).toBe(false);
    });

    it('rejects duration over 1440 minutes', () => {
      const result = activityAddSchema.safeParse({ ...validPayload, duration: 1500 });
      expect(result.success).toBe(false);
    });

    it('accepts null nullable fields', () => {
      const result = activityAddSchema.safeParse({
        ...validPayload,
        dealId: null,
        companyId: null,
        dueDate: null,
        duration: null,
      });
      expect(result.success).toBe(true);
    });
  });

  describe('activityEditSchema', () => {
    it('allows partial updates', () => {
      const result = activityEditSchema.safeParse({ subject: 'Updated' });
      expect(result.success).toBe(true);
    });
  });

  describe('activityCompleteSchema', () => {
    it('validates completion payload', () => {
      const result = activityCompleteSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        completedAt: '2024-04-01T11:00:00.000Z',
        duration: 60,
      });
      expect(result.success).toBe(true);
    });

    it('rejects missing id', () => {
      const result = activityCompleteSchema.safeParse({
        completedAt: '2024-04-01T11:00:00.000Z',
        duration: 60,
      });
      expect(result.success).toBe(false);
    });
  });
});
