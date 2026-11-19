import { createSlice } from '@reduxjs/toolkit';
import type { Company } from '@models/Company.model';
import type { AsyncStatus } from '@appTypes/Utils.type';

interface CompaniesState {
  items: Record<string, Company>;
  ids: string[];
  total: number;
  status: AsyncStatus;
  error: string | null;
}

const initialState: CompaniesState = {
  items: {},
  ids: [],
  total: 0,
  status: 'idle',
  error: null,
};

const companiesSlice = createSlice({
  name: 'companies',
  initialState,
  reducers: {
    companiesLoaded(state, action: { payload: { data: Company[]; total: number } }) {
      state.status = 'succeeded';
      state.total = action.payload.total;
      state.ids = action.payload.data.map((c) => c.id);
      for (const company of action.payload.data) {
        state.items[company.id] = company;
      }
    },
    companyAdded(state, action: { payload: Company }) {
      state.items[action.payload.id] = action.payload;
      state.ids.unshift(action.payload.id);
      state.total++;
    },
    companyUpdated(state, action: { payload: Company }) {
      state.items[action.payload.id] = action.payload;
    },
    companyRemoved(state, action: { payload: string }) {
      delete state.items[action.payload];
      state.ids = state.ids.filter((id) => id !== action.payload);
      state.total--;
    },
  },
});

export const { companiesLoaded, companyAdded, companyUpdated, companyRemoved } = companiesSlice.actions;
export const companiesReducer = companiesSlice.reducer;
