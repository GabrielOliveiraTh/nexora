import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { dealsReducer, selectDealsList, selectDealsByStage, selectDealsTotalValue, selectDealById } from '@redux/deals/slice';
import { mockDeals } from '@mock/deals.mock';
import { DealStage } from '@models/Deal.model';

function asRoot(partial: Record<string, unknown>) {
  return partial as Parameters<typeof selectDealsList>[0];
}

function createStore() {
  return configureStore({
    reducer: { deals: dealsReducer },
  });
}

describe('deals slice integration (seeded data)', () => {
  it('seeds initial state with mock deals', () => {
    const store = createStore();
    const state = store.getState().deals;
    expect(state.ids).toHaveLength(mockDeals.length);
    expect(state.total).toBe(mockDeals.length);
    expect(state.status).toBe('succeeded');
  });

  it('selectDealsList returns all seeded deals', () => {
    const store = createStore();
    const deals = selectDealsList(asRoot(store.getState()));
    expect(deals).toHaveLength(mockDeals.length);
    expect(deals[0].title).toBeTruthy();
  });

  it('selectDealsByStage groups deals correctly', () => {
    const store = createStore();
    const grouped = selectDealsByStage(asRoot(store.getState()));
    const totalInGroups = Object.values(grouped).reduce((sum, arr) => sum + arr.length, 0);
    expect(totalInGroups).toBe(mockDeals.length);
  });

  it('selectDealsByStage includes all pipeline stages', () => {
    const store = createStore();
    const grouped = selectDealsByStage(asRoot(store.getState()));
    expect(grouped[DealStage.Prospecting]).toBeDefined();
    expect(grouped[DealStage.Qualification]).toBeDefined();
    expect(grouped[DealStage.Proposal]).toBeDefined();
    expect(grouped[DealStage.Negotiation]).toBeDefined();
    expect(grouped[DealStage.ClosedWon]).toBeDefined();
    expect(grouped[DealStage.ClosedLost]).toBeDefined();
  });

  it('selectDealsTotalValue computes weighted pipeline value', () => {
    const store = createStore();
    const value = selectDealsTotalValue(asRoot(store.getState()));
    expect(value).toBeGreaterThan(0);

    const expected = mockDeals.reduce((sum, d) => sum + d.value * (d.probability / 100), 0);
    expect(value).toBeCloseTo(expected);
  });

  it('selectDealById returns the correct deal', () => {
    const store = createStore();
    const target = mockDeals[0];
    const deal = selectDealById(target.id)(asRoot(store.getState()));
    expect(deal).not.toBeNull();
    expect(deal!.title).toBe(target.title);
    expect(deal!.value).toBe(target.value);
  });

  it('selectDealById returns null for unknown id', () => {
    const store = createStore();
    const deal = selectDealById('nonexistent-id')(asRoot(store.getState()));
    expect(deal).toBeNull();
  });

  it('all seeded deals have valid UUIDs', () => {
    const store = createStore();
    const deals = selectDealsList(asRoot(store.getState()));
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
    for (const deal of deals) {
      expect(deal.id).toMatch(uuidRegex);
      expect(deal.ownerId).toMatch(uuidRegex);
      expect(deal.contactId).toMatch(uuidRegex);
      expect(deal.companyId).toMatch(uuidRegex);
      expect(deal.pipelineId).toMatch(uuidRegex);
    }
  });

  it('all seeded deals have timestamps', () => {
    const store = createStore();
    const deals = selectDealsList(asRoot(store.getState()));
    for (const deal of deals) {
      expect(new Date(deal.createdAt).getTime()).not.toBeNaN();
      expect(new Date(deal.updatedAt).getTime()).not.toBeNaN();
    }
  });

  it('closed-won deal has 100% probability', () => {
    const store = createStore();
    const deals = selectDealsList(asRoot(store.getState()));
    const wonDeals = deals.filter((d) => d.stage === DealStage.ClosedWon);
    for (const deal of wonDeals) {
      expect(deal.probability).toBe(100);
    }
  });

  it('closed-lost deal has 0% probability', () => {
    const store = createStore();
    const deals = selectDealsList(asRoot(store.getState()));
    const lostDeals = deals.filter((d) => d.stage === DealStage.ClosedLost);
    for (const deal of lostDeals) {
      expect(deal.probability).toBe(0);
    }
  });
});
