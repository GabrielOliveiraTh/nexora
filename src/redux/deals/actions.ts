import { createAsyncThunk } from '@redux/thunk';
import { DealService } from '@services/Deal.service';
import type { Deal } from '@models/Deal.model';
import type { QueryParams } from '@appTypes/Utils.type';
import type { DealAddPayload, DealEditPayload, DealStageUpdatePayload } from '@validators/DealValidator';

export const fetchDeals = createAsyncThunk(
  'deals/fetchDeals',
  async (arg) => {
    const params = arg as QueryParams;
    return DealService.getDeals(params);
  },
);

export const fetchDeal = createAsyncThunk(
  'deals/fetchDeal',
  async (arg) => {
    const id = arg as string;
    return DealService.getDeal(id);
  },
);

export const createDeal = createAsyncThunk(
  'deals/createDeal',
  async (arg) => {
    const payload = arg as DealAddPayload;
    try {
      return await DealService.createDeal(payload);
    } catch {
      const now = new Date().toISOString();
      return {
        id: crypto.randomUUID(),
        ...payload,
        createdAt: now,
        updatedAt: now,
      } as Deal;
    }
  },
);

export const updateDeal = createAsyncThunk(
  'deals/updateDeal',
  async (arg) => {
    const { id, payload, current } = arg as { id: string; payload: DealEditPayload; current: Deal };
    try {
      return await DealService.updateDeal(id, payload);
    } catch {
      return {
        ...current,
        ...payload,
        updatedAt: new Date().toISOString(),
      } as Deal;
    }
  },
);

export const updateDealStage = createAsyncThunk(
  'deals/updateDealStage',
  async (arg) => {
    const payload = arg as DealStageUpdatePayload & { current?: Deal };
    try {
      return await DealService.updateDealStage(payload);
    } catch {
      if (payload.current) {
        return {
          ...payload.current,
          stage: payload.stage,
          ...(payload.probability !== undefined ? { probability: payload.probability } : {}),
          updatedAt: new Date().toISOString(),
        } as Deal;
      }
      throw new Error('No current deal provided for offline stage update');
    }
  },
);

export const deleteDeal = createAsyncThunk(
  'deals/deleteDeal',
  async (arg) => {
    const id = arg as string;
    try {
      await DealService.deleteDeal(id);
    } catch {
      // Demo mode: proceed with local deletion
    }
    return id;
  },
);
