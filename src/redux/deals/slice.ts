import { createSlice, createSelector } from '@reduxjs/toolkit';
import type { Deal } from '@models/Deal.model';
import type { DealStage } from '@models/Deal.model';
import type { AsyncStatus } from '@appTypes/Utils.type';
import type { RootState } from '@redux/store';
import { fetchDeals, fetchDeal, createDeal, updateDeal, deleteDeal, updateDealStage } from '@redux/deals/actions';
import { mockDeals } from '@mock/deals.mock';

interface DealsState {
  items: Record<string, Deal>;
  ids: string[];
  total: number;
  status: AsyncStatus;
  detailStatus: AsyncStatus;
  error: string | null;
  selectedIds: string[];
}

const seededItems: Record<string, Deal> = {};
for (const deal of mockDeals) {
  seededItems[deal.id] = deal;
}

const initialState: DealsState = {
  items: seededItems,
  ids: mockDeals.map((d) => d.id),
  total: mockDeals.length,
  status: 'succeeded',
  detailStatus: 'idle',
  error: null,
  selectedIds: [],
};

const dealsSlice = createSlice({
  name: 'deals',
  initialState,
  reducers: {
    setSelectedDeals(state, action: { payload: string[] }) {
      state.selectedIds = action.payload;
    },
    clearSelectedDeals(state) {
      state.selectedIds = [];
    },
    dealUpdatedViaSocket(state, action: { payload: Deal }) {
      const deal = action.payload;
      state.items[deal.id] = deal;
      if (!state.ids.includes(deal.id)) {
        state.ids.push(deal.id);
      }
    },
    dealDeletedViaSocket(state, action: { payload: string }) {
      const id = action.payload;
      delete state.items[id];
      state.ids = state.ids.filter((i) => i !== id);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDeals.pending, (state) => { state.status = 'loading'; })
      .addCase(fetchDeals.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { data, total } = action.payload as { data: Deal[]; total: number };
        state.total = total;
        state.ids = data.map((d) => d.id);
        for (const deal of data) {
          state.items[deal.id] = deal;
        }
      })
      .addCase(fetchDeals.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to fetch deals';
      })
      .addCase(fetchDeal.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        const deal = action.payload as Deal;
        state.items[deal.id] = deal;
      })
      .addCase(createDeal.fulfilled, (state, action) => {
        const deal = action.payload as Deal;
        state.items[deal.id] = deal;
        state.ids.unshift(deal.id);
        state.total++;
      })
      .addCase(updateDeal.fulfilled, (state, action) => {
        const deal = action.payload as Deal;
        state.items[deal.id] = deal;
      })
      .addCase(updateDealStage.fulfilled, (state, action) => {
        const deal = action.payload as Deal;
        state.items[deal.id] = deal;
      })
      .addCase(deleteDeal.fulfilled, (state, action) => {
        const id = action.payload as string;
        delete state.items[id];
        state.ids = state.ids.filter((i) => i !== id);
        state.total--;
      });
  },
});

export const { setSelectedDeals, clearSelectedDeals, dealUpdatedViaSocket, dealDeletedViaSocket } = dealsSlice.actions;
export const dealsReducer = dealsSlice.reducer;

const selectDealsState = (state: RootState) => state.deals;

export const selectDealsList = createSelector(
  [selectDealsState],
  (deals) => deals.ids.map((id) => deals.items[id]).filter(Boolean),
);

export const selectDealsByStage = createSelector(
  [selectDealsList],
  (deals) => {
    const grouped: Record<string, Deal[]> = {};
    for (const deal of deals) {
      const stage = deal.stage;
      if (!grouped[stage]) grouped[stage] = [];
      grouped[stage].push(deal);
    }
    return grouped;
  },
);

export const selectDealsTotalValue = createSelector(
  [selectDealsList],
  (deals) => deals.reduce((sum, deal) => sum + deal.value * (deal.probability / 100), 0),
);

export const selectDealById = (id: string) =>
  createSelector([selectDealsState], (deals) => deals.items[id] ?? null);

export const selectDealsByStageFilter = (stage: DealStage) =>
  createSelector([selectDealsList], (deals) => deals.filter((d) => d.stage === stage));
