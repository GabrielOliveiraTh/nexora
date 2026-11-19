import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { dealsReducer, dealUpdatedViaSocket, dealDeletedViaSocket } from '@redux/deals/slice';
import { DealStage, DealPriority, type Deal } from '@models/Deal.model';

function createStore() {
  return configureStore({
    reducer: { deals: dealsReducer },
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });
}

const mockDeal: Deal = {
  id: 'd-1',
  title: 'Big Deal',
  value: 50000,
  currency: 'USD',
  stage: DealStage.Proposal,
  priority: DealPriority.High,
  probability: 70,
  contactId: 'c-1',
  companyId: 'comp-1',
  pipelineId: 'pipe-1',
  ownerId: 'u-1',
  expectedCloseDate: '2024-06-30T00:00:00.000Z',
  tags: [],
  notes: '',
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('deals slice', () => {
  it('adds deal via socket', () => {
    const store = createStore();
    store.dispatch(dealUpdatedViaSocket(mockDeal));
    expect(store.getState().deals.items['d-1']).toEqual(mockDeal);
    expect(store.getState().deals.ids).toContain('d-1');
  });

  it('removes deal via socket', () => {
    const store = createStore();
    store.dispatch(dealUpdatedViaSocket(mockDeal));
    store.dispatch(dealDeletedViaSocket('d-1'));
    expect(store.getState().deals.items['d-1']).toBeUndefined();
    expect(store.getState().deals.ids).not.toContain('d-1');
  });

  it('updates existing deal via socket', () => {
    const store = createStore();
    store.dispatch(dealUpdatedViaSocket(mockDeal));
    store.dispatch(dealUpdatedViaSocket({ ...mockDeal, stage: DealStage.ClosedWon, probability: 100 }));
    expect(store.getState().deals.items['d-1'].stage).toBe(DealStage.ClosedWon);
    expect(store.getState().deals.items['d-1'].probability).toBe(100);
  });
});
