import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { PREFERENCES_STORAGE_KEY, loadPreferences, preferencesReducer, preferencesLoaded, preferenceUpdated, toggleSidebar, toggleTheme } from '@redux/preferences/slice';

function createStore() {
  return configureStore({
    reducer: { preferences: preferencesReducer },
  });
}

describe('preferences slice', () => {
  it('has correct initial state', () => {
    const store = createStore();
    const state = store.getState().preferences;
    expect(state.language).toBe('en');
    expect(state.currency).toBe('USD');
    expect(state.theme).toBe('light');
    expect(state.tablePageSize).toBe(25);
    expect(state.sidebarCollapsed).toBe(false);
    expect(state.timezone).toBe('UTC');
    expect(state.dateFormat).toBe('MMM dd, yyyy');
  });

  it('updates single preference', () => {
    const store = createStore();
    store.dispatch(preferenceUpdated({ currency: 'EUR' }));
    expect(store.getState().preferences.currency).toBe('EUR');
    expect(store.getState().preferences.language).toBe('en');
  });

  it('updates multiple preferences at once', () => {
    const store = createStore();
    store.dispatch(preferenceUpdated({ currency: 'BRL', tablePageSize: 50 }));
    expect(store.getState().preferences.currency).toBe('BRL');
    expect(store.getState().preferences.tablePageSize).toBe(50);
  });

  it('toggles sidebar', () => {
    const store = createStore();
    expect(store.getState().preferences.sidebarCollapsed).toBe(false);
    store.dispatch(toggleSidebar());
    expect(store.getState().preferences.sidebarCollapsed).toBe(true);
    store.dispatch(toggleSidebar());
    expect(store.getState().preferences.sidebarCollapsed).toBe(false);
  });

  describe('dark mode', () => {
    it('toggles theme between light and dark', () => {
      const store = createStore();
      expect(store.getState().preferences.theme).toBe('light');
      store.dispatch(toggleTheme());
      expect(store.getState().preferences.theme).toBe('dark');
      store.dispatch(toggleTheme());
      expect(store.getState().preferences.theme).toBe('light');
    });

    it('can also be set directly via preferenceUpdated', () => {
      const store = createStore();
      store.dispatch(preferenceUpdated({ theme: 'dark' }));
      expect(store.getState().preferences.theme).toBe('dark');
    });

    it('toggleTheme preserves other preferences', () => {
      const store = createStore();
      store.dispatch(preferenceUpdated({ currency: 'BRL', tablePageSize: 100 }));
      store.dispatch(toggleTheme());

      const state = store.getState().preferences;
      expect(state.theme).toBe('dark');
      expect(state.currency).toBe('BRL');
      expect(state.tablePageSize).toBe(100);
    });
  });

  describe('preferencesLoaded', () => {
    it('replaces entire state', () => {
      const store = createStore();
      const newPrefs = {
        language: 'pt',
        currency: 'BRL',
        timezone: 'America/Sao_Paulo',
        dateFormat: 'dd/MM/yyyy',
        tablePageSize: 50,
        sidebarCollapsed: true,
        theme: 'dark' as const,
      };
      store.dispatch(preferencesLoaded(newPrefs));
      expect(store.getState().preferences).toEqual(newPrefs);
    });
  });

  describe('valid preference values', () => {
    it('accepts all supported currencies', () => {
      const store = createStore();
      for (const currency of ['USD', 'EUR', 'GBP', 'BRL']) {
        store.dispatch(preferenceUpdated({ currency }));
        expect(store.getState().preferences.currency).toBe(currency);
      }
    });

    it('accepts all supported page sizes', () => {
      const store = createStore();
      for (const size of [10, 25, 50, 100]) {
        store.dispatch(preferenceUpdated({ tablePageSize: size }));
        expect(store.getState().preferences.tablePageSize).toBe(size);
      }
    });
  });

  it('loads persisted preferences over the defaults (BUG-17)', () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, JSON.stringify({ currency: 'EUR', theme: 'dark', bogus: 1, tablePageSize: 'x' }));
    const prefs = loadPreferences();
    expect(prefs.currency).toBe('EUR');
    expect(prefs.theme).toBe('dark');
    expect(prefs.tablePageSize).toBe(25);
    expect('bogus' in prefs).toBe(false);
    localStorage.removeItem(PREFERENCES_STORAGE_KEY);
  });

  it('ignores corrupted persisted preferences', () => {
    localStorage.setItem(PREFERENCES_STORAGE_KEY, '{oops');
    expect(loadPreferences().currency).toBe('USD');
    localStorage.removeItem(PREFERENCES_STORAGE_KEY);
  });
});
