import { describe, it, expect } from 'vitest';
import { DealAssembler } from '@assemblers/DealAssembler';
import { dealAddSchema, dealEditSchema } from '@validators/DealValidator';
import { DealStage, DealPriority, type Deal } from '@models/Deal.model';
import { MOCK_USER_ID } from '@mock/contacts.mock';

const mockDeal: Deal = {
  id: 'dd1a2b3c-d5e6-4890-abcd-ef1234567890',
  title: 'Test Deal',
  value: 50000,
  currency: 'USD',
  stage: DealStage.Negotiation,
  priority: DealPriority.High,
  probability: 75,
  contactId: 'c1a2b3c4-d5e6-4890-abcd-ef1234567890',
  companyId: 'b0000000-0000-4000-a000-000000000001',
  pipelineId: 'd0000000-0000-4000-a000-000000000001',
  ownerId: MOCK_USER_ID,
  expectedCloseDate: '2026-12-15T00:00:00.000Z',
  tags: ['enterprise'],
  notes: 'Important deal',
  createdAt: '2026-09-01T00:00:00.000Z',
  updatedAt: '2026-11-01T00:00:00.000Z',
};

describe('deal form-to-schema pipeline', () => {
  describe('create flow', () => {
    it('empty form + required fields passes add schema', () => {
      const formValues = DealAssembler.assembleEmptyForm();
      const enriched = {
        ...formValues,
        title: 'New Deal',
        value: 10000,
        ownerId: MOCK_USER_ID,
      };
      const result = dealAddSchema.safeParse(enriched);
      expect(result.success).toBe(true);
    });

    it('empty form without title fails', () => {
      const formValues = DealAssembler.assembleEmptyForm();
      const enriched = { ...formValues, ownerId: MOCK_USER_ID };
      const result = dealAddSchema.safeParse(enriched);
      expect(result.success).toBe(false);
    });

    it('form with all fields filled passes', () => {
      const formValues = {
        title: 'Complete Deal',
        value: 100000,
        currency: 'EUR',
        stage: DealStage.Proposal,
        priority: DealPriority.Critical,
        probability: 80,
        contactId: 'c1a2b3c4-d5e6-4890-abcd-ef1234567890',
        companyId: 'b0000000-0000-4000-a000-000000000001',
        pipelineId: 'd0000000-0000-4000-a000-000000000001',
        ownerId: MOCK_USER_ID,
        expectedCloseDate: '2027-01-15T00:00:00.000Z',
        tags: ['enterprise', 'q1'],
        notes: 'Full entry',
      };
      const result = dealAddSchema.safeParse(formValues);
      expect(result.success).toBe(true);
    });

    it('form with empty optional fields still passes', () => {
      const enriched = {
        title: 'Minimal Deal',
        value: 5000,
        currency: 'USD',
        stage: DealStage.Prospecting,
        priority: DealPriority.Low,
        probability: 50,
        contactId: '',
        companyId: '',
        pipelineId: '',
        ownerId: MOCK_USER_ID,
        expectedCloseDate: '',
        tags: [],
        notes: '',
      };
      const result = dealAddSchema.safeParse(enriched);
      expect(result.success).toBe(true);
    });
  });

  describe('edit flow', () => {
    it('direct partial values pass edit schema', () => {
      const edits = { title: 'Updated' };
      const result = dealEditSchema.safeParse(edits);
      expect(result.success).toBe(true);
    });

    it('changing just stage passes edit schema', () => {
      const edits = { stage: DealStage.ClosedWon };
      const result = dealEditSchema.safeParse(edits);
      expect(result.success).toBe(true);
    });

    it('assembler output with full fields passes edit schema', () => {
      const previous = DealAssembler.assembleNormalizedFormDeal(mockDeal);
      const result = dealEditSchema.safeParse(previous);
      expect(result.success).toBe(true);
    });

    it('edit schema accepts empty string for notes', () => {
      const result = dealEditSchema.safeParse({ notes: '' });
      expect(result.success).toBe(true);
    });

    it('edit schema accepts empty string for companyId', () => {
      const result = dealEditSchema.safeParse({ companyId: '' });
      expect(result.success).toBe(true);
    });
  });
});
