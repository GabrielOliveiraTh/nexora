import { createSlice } from '@reduxjs/toolkit';
import type { User } from '@models/Common.model';
import type { AsyncStatus } from '@appTypes/Utils.type';

interface AuthState {
  user: User | null;
  status: AsyncStatus;
  permissions: Record<string, boolean>;
}

const initialState: AuthState = {
  user: null,
  status: 'idle',
  permissions: {},
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authLoaded(state, action: { payload: { user: User; permissions: Record<string, boolean> } }) {
      state.status = 'succeeded';
      state.user = action.payload.user;
      state.permissions = action.payload.permissions;
    },
    authCleared() {
      return initialState;
    },
    permissionsUpdated(state, action: { payload: Record<string, boolean> }) {
      state.permissions = { ...state.permissions, ...action.payload };
    },
  },
});

export const { authLoaded, authCleared, permissionsUpdated } = authSlice.actions;
export const authReducer = authSlice.reducer;
