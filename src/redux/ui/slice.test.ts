import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import {
  uiReducer,
  openContactDrawer,
  closeContactDrawer,
  openDealDrawer,
  closeDealDrawer,
  openActivityModal,
  closeActivityModal,
  openConfirmModal,
  closeConfirmModal,
  toggleGlobalSearch,
} from '@redux/ui/slice';

function createStore() {
  return configureStore({
    reducer: { ui: uiReducer },
  });
}

describe('ui slice', () => {
  describe('contact drawer', () => {
    it('opens in create mode without entityId', () => {
      const store = createStore();
      store.dispatch(openContactDrawer({ mode: 'create' }));
      const state = store.getState().ui;
      expect(state.contactDrawerOpen).toBe(true);
      expect(state.contactDrawerMode).toBe('create');
      expect(state.contactDrawerEntityId).toBeNull();
    });

    it('opens in edit mode with entityId', () => {
      const store = createStore();
      store.dispatch(openContactDrawer({ mode: 'edit', entityId: 'c-1' }));
      const state = store.getState().ui;
      expect(state.contactDrawerOpen).toBe(true);
      expect(state.contactDrawerMode).toBe('edit');
      expect(state.contactDrawerEntityId).toBe('c-1');
    });

    it('opens in view mode with entityId', () => {
      const store = createStore();
      store.dispatch(openContactDrawer({ mode: 'view', entityId: 'c-2' }));
      const state = store.getState().ui;
      expect(state.contactDrawerOpen).toBe(true);
      expect(state.contactDrawerMode).toBe('view');
      expect(state.contactDrawerEntityId).toBe('c-2');
    });

    it('closes and clears entityId', () => {
      const store = createStore();
      store.dispatch(openContactDrawer({ mode: 'edit', entityId: 'c-1' }));
      store.dispatch(closeContactDrawer());
      const state = store.getState().ui;
      expect(state.contactDrawerOpen).toBe(false);
      expect(state.contactDrawerEntityId).toBeNull();
    });
  });

  describe('deal drawer', () => {
    it('opens and closes correctly', () => {
      const store = createStore();
      store.dispatch(openDealDrawer({ mode: 'create' }));
      expect(store.getState().ui.dealDrawerOpen).toBe(true);

      store.dispatch(closeDealDrawer());
      expect(store.getState().ui.dealDrawerOpen).toBe(false);
      expect(store.getState().ui.dealDrawerEntityId).toBeNull();
    });
  });

  describe('activity modal', () => {
    it('opens and closes correctly', () => {
      const store = createStore();
      store.dispatch(openActivityModal({ mode: 'create' }));
      expect(store.getState().ui.activityModalOpen).toBe(true);
      expect(store.getState().ui.activityModalMode).toBe('create');

      store.dispatch(closeActivityModal());
      expect(store.getState().ui.activityModalOpen).toBe(false);
      expect(store.getState().ui.activityModalEntityId).toBeNull();
    });
  });

  describe('confirm modal', () => {
    it('opens with action and closes', () => {
      const store = createStore();
      store.dispatch(openConfirmModal('delete-contact'));
      expect(store.getState().ui.confirmModalOpen).toBe(true);
      expect(store.getState().ui.confirmModalAction).toBe('delete-contact');

      store.dispatch(closeConfirmModal());
      expect(store.getState().ui.confirmModalOpen).toBe(false);
      expect(store.getState().ui.confirmModalAction).toBeNull();
    });
  });

  describe('global search', () => {
    it('toggles on and off', () => {
      const store = createStore();
      expect(store.getState().ui.globalSearchOpen).toBe(false);

      store.dispatch(toggleGlobalSearch());
      expect(store.getState().ui.globalSearchOpen).toBe(true);

      store.dispatch(toggleGlobalSearch());
      expect(store.getState().ui.globalSearchOpen).toBe(false);
    });
  });
});
