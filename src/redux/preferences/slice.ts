import { createSlice } from '@reduxjs/toolkit';

export interface PreferencesState {
  language: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  tablePageSize: number;
  sidebarCollapsed: boolean;
  theme: 'light' | 'dark';
}

export const PREFERENCES_STORAGE_KEY = 'crm_preferences';

const defaultPreferences: PreferencesState = {
  language: 'en',
  currency: 'USD',
  timezone: 'UTC',
  dateFormat: 'MMM dd, yyyy',
  tablePageSize: 25,
  sidebarCollapsed: false,
  theme: 'light',
};

/** Persisted preferences merged over the defaults (unknown keys are ignored). */
export function loadPreferences(): PreferencesState {
  if (typeof localStorage === 'undefined') return defaultPreferences;
  try {
    const raw = localStorage.getItem(PREFERENCES_STORAGE_KEY);
    if (!raw) return defaultPreferences;
    const parsed = JSON.parse(raw) as Partial<PreferencesState>;
    const merged = { ...defaultPreferences };
    for (const key of Object.keys(defaultPreferences) as (keyof PreferencesState)[]) {
      if (key in parsed && typeof parsed[key] === typeof defaultPreferences[key]) {
        (merged as Record<string, unknown>)[key] = parsed[key];
      }
    }
    return merged;
  } catch {
    return defaultPreferences;
  }
}

export function savePreferences(preferences: PreferencesState): void {
  try {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify(preferences));
  } catch {
    /* storage full / disabled: preferences stay in memory */
  }
}

const preferencesSlice = createSlice({
  name: 'preferences',
  initialState: loadPreferences,
  reducers: {
    preferencesLoaded(_, action: { payload: PreferencesState }) {
      return action.payload;
    },
    preferenceUpdated(state, action: { payload: Partial<PreferencesState> }) {
      return { ...state, ...action.payload };
    },
    toggleSidebar(state) {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    toggleTheme(state) {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
    },
  },
});

export const { preferencesLoaded, preferenceUpdated, toggleSidebar, toggleTheme } = preferencesSlice.actions;
export const preferencesReducer = preferencesSlice.reducer;
