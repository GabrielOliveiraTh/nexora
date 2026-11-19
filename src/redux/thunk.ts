import { createAsyncThunk as rtkCreateAsyncThunk } from '@reduxjs/toolkit';
import type { RootState, AppDispatch } from '@redux/store';

interface ThunkApiConfig {
  state: RootState;
  dispatch: AppDispatch;
  rejectValue: string;
}

export function createAsyncThunk<ReturnType>(
  typePrefix: string,
  payloadCreator: (
    arg: unknown,
    thunkAPI: { state: RootState; dispatch: AppDispatch; signal: AbortSignal; rejectWithValue: (value: string) => unknown },
  ) => Promise<ReturnType>,
) {
  return rtkCreateAsyncThunk<ReturnType, unknown, ThunkApiConfig>(
    typePrefix,
    async (arg, thunkAPI) => {
      try {
        return await payloadCreator(arg, {
          state: thunkAPI.getState(),
          dispatch: thunkAPI.dispatch,
          signal: thunkAPI.signal,
          rejectWithValue: thunkAPI.rejectWithValue as (value: string) => unknown,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        return thunkAPI.rejectWithValue(message) as ReturnType;
      }
    },
  );
}
