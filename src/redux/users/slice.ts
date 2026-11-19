import { createSlice } from '@reduxjs/toolkit';
import type { User } from '@models/Common.model';
import type { AsyncStatus } from '@appTypes/Utils.type';

interface UsersState {
  items: Record<string, User>;
  ids: string[];
  status: AsyncStatus;
}

const initialState: UsersState = { items: {}, ids: [], status: 'idle' };

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    usersLoaded(state, action: { payload: User[] }) {
      state.status = 'succeeded';
      state.ids = action.payload.map((u) => u.id);
      for (const user of action.payload) {
        state.items[user.id] = user;
      }
    },
  },
});

export const { usersLoaded } = usersSlice.actions;
export const usersReducer = usersSlice.reducer;
