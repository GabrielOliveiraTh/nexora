import { describe, it, expect } from 'vitest';
import { dealAddSchema, dealEditSchema, dealStageUpdateSchema, dealBulkEditSchema } from '@validators/DealValidator';
import { DealStage, DealPriority } from '@models/Deal.model';

describe('DealValidator', () => {
  const validPayload = {
    title: 'New Deal',
    value: 10000,
    currency: 'USD',
    stage: DealStage.Prospecting,
    priority: DealPriority.Medium,
    probability: 50,
    contactId: '550e8400-e29b-41d4-a716-446655440001',
    companyId: '550e8400-e29b-41d4-a716-446655440002',
    pipelineId: '550e8400-e29b-41d4-a716-446655440003',
    ownerId: '550e8400-e29b-41d4-a716-446655440004',
    expectedCloseDate: '2024-06-30T00:00:00.000Z',
    tags: [],
    notes: '',
  };

  describe('dealAddSchema', () => {
    it('validates a correct payload', () => {
      const result = dealAddSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });

    it('applies default probability', () => {
      const { probability: _, ...withoutProbability } = validPayload;
      const result = dealAddSchema.safeParse(withoutProbability);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.probability).toBe(50);
      }
    });

    it('rejects negative value', () => {
      const result = dealAddSchema.safeParse({ ...validPayload, value: -100 });
      expect(result.success).toBe(false);
    });

    it('rejects probability over 100', () => {
      const result = dealAddSchema.safeParse({ ...validPayload, probability: 150 });
      expect(result.success).toBe(false);
    });

    it('rejects invalid currency length', () => {
      const result = dealAddSchema.safeParse({ ...validPayload, currency: 'USDX' });
      expect(result.success).toBe(false);
    });

    it('accepts empty string for companyId', () => {
      const result = dealAddSchema.safeParse({ ...validPayload, companyId: '' });
      expect(result.success).toBe(true);
    });

    it('accepts empty string for pipelineId', () => {
      const result = dealAddSchema.safeParse({ ...validPayload, pipelineId: '' });
      expect(result.success).toBe(true);
    });

    it('accepts empty string for contactId', () => {
      const result = dealAddSchema.safeParse({ ...validPayload, contactId: '' });
      expect(result.success).toBe(true);
    });

    it('accepts empty string for expectedCloseDate', () => {
      const result = dealAddSchema.safeParse({ ...validPayload, expectedCloseDate: '' });
      expect(result.success).toBe(true);
    });

    it('accepts minimal form values (only required fields)', () => {
      const minimal = {
        title: 'Minimal Deal',
        value: 1000,
        stage: DealStage.Prospecting,
        priority: DealPriority.Low,
        ownerId: '550e8400-e29b-41d4-a716-446655440004',
      };
      const result = dealAddSchema.safeParse(minimal);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.currency).toBe('USD');
        expect(result.data.probability).toBe(50);
        expect(result.data.tags).toEqual([]);
        expect(result.data.notes).toBe('');
        expect(result.data.companyId).toBe('');
        expect(result.data.pipelineId).toBe('');
        expect(result.data.contactId).toBe('');
        expect(result.data.expectedCloseDate).toBe('');
      }
    });
  });

  describe('dealEditSchema', () => {
    it('allows partial updates', () => {
      const result = dealEditSchema.safeParse({ title: 'Updated' });
      expect(result.success).toBe(true);
    });

    it('validates field types on partial', () => {
      const result = dealEditSchema.safeParse({ value: 'not a number' });
      expect(result.success).toBe(false);
    });

    it('accepts empty string for companyId', () => {
      const result = dealEditSchema.safeParse({ companyId: '' });
      expect(result.success).toBe(true);
    });

    it('accepts empty string for pipelineId', () => {
      const result = dealEditSchema.safeParse({ pipelineId: '' });
      expect(result.success).toBe(true);
    });

    it('accepts empty string for contactId', () => {
      const result = dealEditSchema.safeParse({ contactId: '' });
      expect(result.success).toBe(true);
    });

    it('accepts empty string for notes', () => {
      const result = dealEditSchema.safeParse({ notes: '' });
      expect(result.success).toBe(true);
    });

    it('accepts empty string for expectedCloseDate', () => {
      const result = dealEditSchema.safeParse({ expectedCloseDate: '' });
      expect(result.success).toBe(true);
    });

    it('accepts full form payload from assembler', () => {
      const result = dealEditSchema.safeParse(validPayload);
      expect(result.success).toBe(true);
    });
  });

  describe('dealStageUpdateSchema', () => {
    it('validates stage change with optional probability', () => {
      const result = dealStageUpdateSchema.safeParse({
        id: '550e8400-e29b-41d4-a716-446655440000',
        stage: DealStage.ClosedWon,
        probability: 100,
      });
      expect(result.success).toBe(true);
    });

    it('requires valid UUID for id', () => {
      const result = dealStageUpdateSchema.safeParse({
        id: 'not-a-uuid',
        stage: DealStage.ClosedWon,
      });
      expect(result.success).toBe(false);
    });
  });

  describe('dealBulkEditSchema', () => {
    it('requires at least one id', () => {
      const result = dealBulkEditSchema.safeParse({
        ids: [],
        updates: { stage: DealStage.Negotiation },
      });
      expect(result.success).toBe(false);
    });
  });
});
