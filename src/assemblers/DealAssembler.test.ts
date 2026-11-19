import { describe, it, expect } from 'vitest';
import { DealAssembler } from '@assemblers/DealAssembler';
import { DealStage, DealPriority, type Deal } from '@models/Deal.model';

const mockDeal: Deal = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  title: 'Enterprise License',
  value: 50000,
  currency: 'USD',
  stage: DealStage.Proposal,
  priority: DealPriority.High,
  probability: 70,
  contactId: '550e8400-e29b-41d4-a716-446655440001',
  companyId: '550e8400-e29b-41d4-a716-446655440002',
  pipelineId: '550e8400-e29b-41d4-a716-446655440003',
  ownerId: '550e8400-e29b-41d4-a716-446655440004',
  expectedCloseDate: '2024-06-30T00:00:00.000Z',
  tags: ['enterprise', 'q2'],
  notes: 'Key account',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-03-15T00:00:00.000Z',
};

describe('DealAssembler', () => {
  describe('assembleNormalizedFormDeal', () => {
    it('strips id and timestamps', () => {
      const form = DealAssembler.assembleNormalizedFormDeal(mockDeal);
      expect(form).not.toHaveProperty('id');
      expect(form).not.toHaveProperty('createdAt');
      expect(form).not.toHaveProperty('updatedAt');
    });

    it('preserves all form fields', () => {
      const form = DealAssembler.assembleNormalizedFormDeal(mockDeal);
      expect(form.title).toBe('Enterprise License');
      expect(form.value).toBe(50000);
      expect(form.stage).toBe(DealStage.Proposal);
      expect(form.probability).toBe(70);
    });

    it('creates a shallow copy of tags', () => {
      const form = DealAssembler.assembleNormalizedFormDeal(mockDeal);
      expect(form.tags).toEqual(['enterprise', 'q2']);
      expect(form.tags).not.toBe(mockDeal.tags);
    });
  });

  describe('assembleFormNormalizedDeal', () => {
    it('detects cleared fields', () => {
      const previous = DealAssembler.assembleNormalizedFormDeal(mockDeal);
      const edits = { title: 'New Title' };
      const merged = DealAssembler.assembleFormNormalizedDeal(previous, edits);
      expect(merged.title).toBe('New Title');
      expect(merged.notes).toBe('');
    });
  });

  describe('assembleEmptyForm', () => {
    it('returns correct defaults', () => {
      const empty = DealAssembler.assembleEmptyForm();
      expect(empty.title).toBe('');
      expect(empty.value).toBe(0);
      expect(empty.currency).toBe('USD');
      expect(empty.stage).toBe(DealStage.Prospecting);
      expect(empty.priority).toBe(DealPriority.Medium);
      expect(empty.probability).toBe(50);
      expect(empty.tags).toEqual([]);
    });
  });
});
