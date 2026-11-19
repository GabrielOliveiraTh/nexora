import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { dealsReducer } from '@redux/deals/slice';
import { createDeal, deleteDeal, updateDeal } from '@redux/deals/actions';
import { DealStage, DealPriority } from '@models/Deal.model';
import { MOCK_USER_ID } from '@mock/contacts.mock';
import { mockDeals } from '@mock/deals.mock';
import type { AppDispatch } from '@redux/store';

function createStore() {
  const store = configureStore({
    reducer: { deals: dealsReducer },
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });
  return store as typeof store & { dispatch: AppDispatch };
}

describe('deal thunks (demo mode, no backend)', () => {
  describe('createDeal', () => {
    it('creates a deal locally when API is unavailable', async () => {
      const store = createStore();
      const initialCount = store.getState().deals.ids.length;

      await store.dispatch(
        createDeal({
          title: 'New Deal',
          value: 50000,
          currency: 'USD',
          stage: DealStage.Prospecting,
          priority: DealPriority.Medium,
          probability: 50,
          contactId: '',
          companyId: '',
          pipelineId: '',
          ownerId: MOCK_USER_ID,
          expectedCloseDate: '',
          tags: [],
          notes: '',
        }),
      );

      const state = store.getState().deals;
      expect(state.ids).toHaveLength(initialCount + 1);

      const newId = state.ids[0];
      const newDeal = state.items[newId];
      expect(newDeal.title).toBe('New Deal');
      expect(newDeal.value).toBe(50000);
      expect(newDeal.stage).toBe(DealStage.Prospecting);
      expect(newDeal.createdAt).toBeTruthy();
      expect(newDeal.id).toMatch(/^[0-9a-f-]+$/);
    });

    it('increments total count after creation', async () => {
      const store = createStore();
      const initialTotal = store.getState().deals.total;

      await store.dispatch(
        createDeal({
          title: 'Count Test',
          value: 10000,
          currency: 'USD',
          stage: DealStage.Qualification,
          priority: DealPriority.Low,
          probability: 30,
          contactId: '',
          companyId: '',
          pipelineId: '',
          ownerId: MOCK_USER_ID,
          expectedCloseDate: '',
          tags: [],
          notes: '',
        }),
      );

      expect(store.getState().deals.total).toBe(initialTotal + 1);
    });
  });

  describe('deleteDeal', () => {
    it('removes a deal from state', async () => {
      const store = createStore();
      const targetId = mockDeals[0].id;
      const initialCount = store.getState().deals.ids.length;

      await store.dispatch(deleteDeal(targetId));

      const state = store.getState().deals;
      expect(state.ids).toHaveLength(initialCount - 1);
      expect(state.ids).not.toContain(targetId);
      expect(state.items[targetId]).toBeUndefined();
      expect(state.total).toBe(initialCount - 1);
    });

    it('does not crash when deleting non-existent id', async () => {
      const store = createStore();
      const initialCount = store.getState().deals.ids.length;

      await store.dispatch(deleteDeal('nonexistent-id'));

      expect(store.getState().deals.ids).toHaveLength(initialCount);
    });
  });

  describe('updateDeal', () => {
    it('updates a deal in state', async () => {
      const store = createStore();
      const target = mockDeals[0];

      await store.dispatch(
        updateDeal({
          id: target.id,
          payload: { title: 'Updated Title' },
          current: target,
        }),
      );

      const updated = store.getState().deals.items[target.id];
      expect(updated.title).toBe('Updated Title');
      expect(updated.value).toBe(target.value);
      expect(updated.stage).toBe(target.stage);
    });

    it('updates the updatedAt timestamp', async () => {
      const store = createStore();
      const target = mockDeals[1];
      const originalUpdatedAt = target.updatedAt;

      await store.dispatch(
        updateDeal({
          id: target.id,
          payload: { stage: DealStage.Proposal },
          current: target,
        }),
      );

      const updated = store.getState().deals.items[target.id];
      expect(updated.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('preserves unmodified fields', async () => {
      const store = createStore();
      const target = mockDeals[2];

      await store.dispatch(
        updateDeal({
          id: target.id,
          payload: { notes: 'New note' },
          current: target,
        }),
      );

      const updated = store.getState().deals.items[target.id];
      expect(updated.notes).toBe('New note');
      expect(updated.title).toBe(target.title);
      expect(updated.value).toBe(target.value);
      expect(updated.priority).toBe(target.priority);
      expect(updated.tags).toEqual(target.tags);
    });
  });

  describe('full CRUD cycle', () => {
    it('creates, updates, then deletes a deal', async () => {
      const store = createStore();
      const initialCount = store.getState().deals.ids.length;

      const createResult = await store.dispatch(
        createDeal({
          title: 'Lifecycle Deal',
          value: 99000,
          currency: 'USD',
          stage: DealStage.Prospecting,
          priority: DealPriority.High,
          probability: 50,
          contactId: '',
          companyId: '',
          pipelineId: '',
          ownerId: MOCK_USER_ID,
          expectedCloseDate: '',
          tags: [],
          notes: '',
        }),
      );

      const createdDeal = (createResult as { payload: { id: string } }).payload;
      expect(store.getState().deals.ids).toHaveLength(initialCount + 1);

      await store.dispatch(
        updateDeal({
          id: createdDeal.id,
          payload: { stage: DealStage.Negotiation },
          current: store.getState().deals.items[createdDeal.id],
        }),
      );

      expect(store.getState().deals.items[createdDeal.id].stage).toBe(DealStage.Negotiation);

      await store.dispatch(deleteDeal(createdDeal.id));

      expect(store.getState().deals.ids).toHaveLength(initialCount);
      expect(store.getState().deals.items[createdDeal.id]).toBeUndefined();
    });
  });
});
