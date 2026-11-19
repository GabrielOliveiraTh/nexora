import type { Deal, DealFormData, DealEditData } from '@models/Deal.model';
import { DealStage, DealPriority } from '@models/Deal.model';

function transformRemovedToEmptyString<T extends Record<string, unknown>>(
  previous: T,
  current: Partial<T>,
): Partial<T> {
  const result = { ...current } as Record<string, unknown>;
  for (const key of Object.keys(previous)) {
    if (current[key as keyof T] === undefined && previous[key] !== undefined) {
      result[key] = '';
    }
  }
  return result as Partial<T>;
}

export const DealAssembler = {
  assembleNormalizedFormDeal(apiDeal: Deal): DealFormData {
    return {
      title: apiDeal.title,
      value: apiDeal.value,
      currency: apiDeal.currency,
      stage: apiDeal.stage,
      priority: apiDeal.priority,
      probability: apiDeal.probability,
      contactId: apiDeal.contactId,
      companyId: apiDeal.companyId,
      pipelineId: apiDeal.pipelineId,
      ownerId: apiDeal.ownerId,
      expectedCloseDate: apiDeal.expectedCloseDate,
      tags: [...apiDeal.tags],
      notes: apiDeal.notes,
    };
  },

  assembleFormNormalizedDeal(
    previous: DealFormData,
    edits: DealEditData,
  ): DealEditData {
    return transformRemovedToEmptyString(previous, edits);
  },

  assembleEmptyForm(): DealFormData {
    return {
      title: '',
      value: 0,
      currency: 'USD',
      stage: DealStage.Prospecting,
      priority: DealPriority.Medium,
      probability: 50,
      contactId: '',
      companyId: '',
      pipelineId: '',
      ownerId: '',
      expectedCloseDate: '',
      tags: [],
      notes: '',
    };
  },
};
