import { createSlice } from '@reduxjs/toolkit';
import type { Activity } from '@models/Activity.model';
import type { AsyncStatus } from '@appTypes/Utils.type';

interface ActivitiesState {
  items: Record<string, Activity>;
  ids: string[];
  total: number;
  status: AsyncStatus;
  error: string | null;
}

const initialState: ActivitiesState = {
  items: {},
  ids: [],
  total: 0,
  status: 'idle',
  error: null,
};

const activitiesSlice = createSlice({
  name: 'activities',
  initialState,
  reducers: {
    activitiesLoaded(state, action: { payload: { data: Activity[]; total: number } }) {
      state.status = 'succeeded';
      state.total = action.payload.total;
      state.ids = action.payload.data.map((a) => a.id);
      for (const activity of action.payload.data) {
        state.items[activity.id] = activity;
      }
    },
    activityAdded(state, action: { payload: Activity }) {
      const activity = action.payload;
      state.items[activity.id] = activity;
      state.ids.unshift(activity.id);
      state.total++;
    },
    activityUpdated(state, action: { payload: Activity }) {
      state.items[action.payload.id] = action.payload;
    },
    activityRemoved(state, action: { payload: string }) {
      delete state.items[action.payload];
      state.ids = state.ids.filter((id) => id !== action.payload);
      state.total--;
    },
    activityUpdatedViaSocket(state, action: { payload: Activity }) {
      state.items[action.payload.id] = action.payload;
      if (!state.ids.includes(action.payload.id)) {
        state.ids.unshift(action.payload.id);
      }
    },
  },
});

export const { activitiesLoaded, activityAdded, activityUpdated, activityRemoved, activityUpdatedViaSocket } = activitiesSlice.actions;
export const activitiesReducer = activitiesSlice.reducer;
