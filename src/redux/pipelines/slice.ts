import { createSlice } from '@reduxjs/toolkit';
import type { Pipeline } from '@models/Common.model';
import type { AsyncStatus } from '@appTypes/Utils.type';
import type { RootState } from '@redux/store';
import { MOCK_PIPELINE_ID } from '@mock/deals.mock';

interface PipelinesState {
  items: Record<string, Pipeline>;
  ids: string[];
  status: AsyncStatus;
}

const initialState: PipelinesState = { items: {}, ids: [], status: 'idle' };

const pipelinesSlice = createSlice({
  name: 'pipelines',
  initialState,
  reducers: {
    pipelinesLoaded(state, action: { payload: Pipeline[] }) {
      state.status = 'succeeded';
      state.ids = action.payload.map((p) => p.id);
      for (const pipeline of action.payload) {
        state.items[pipeline.id] = pipeline;
      }
    },
    pipelineUpdated(state, action: { payload: Pipeline }) {
      state.items[action.payload.id] = action.payload;
    },
  },
});

export const { pipelinesLoaded, pipelineUpdated } = pipelinesSlice.actions;
export const pipelinesReducer = pipelinesSlice.reducer;

/** Pipeline assigned to new deals: the first loaded pipeline, or the seeded one. */
export const selectDefaultPipelineId = (state: RootState): string =>
  state.pipelines.ids[0] ?? MOCK_PIPELINE_ID;
