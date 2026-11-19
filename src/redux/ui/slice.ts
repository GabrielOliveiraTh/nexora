import { createSlice } from '@reduxjs/toolkit';

interface UiState {
  contactDrawerOpen: boolean;
  contactDrawerMode: 'create' | 'edit' | 'view';
  contactDrawerEntityId: string | null;
  dealDrawerOpen: boolean;
  dealDrawerMode: 'create' | 'edit' | 'view';
  dealDrawerEntityId: string | null;
  activityModalOpen: boolean;
  activityModalMode: 'create' | 'edit';
  activityModalEntityId: string | null;
  confirmModalOpen: boolean;
  confirmModalAction: string | null;
  globalSearchOpen: boolean;
}

const initialState: UiState = {
  contactDrawerOpen: false,
  contactDrawerMode: 'create',
  contactDrawerEntityId: null,
  dealDrawerOpen: false,
  dealDrawerMode: 'create',
  dealDrawerEntityId: null,
  activityModalOpen: false,
  activityModalMode: 'create',
  activityModalEntityId: null,
  confirmModalOpen: false,
  confirmModalAction: null,
  globalSearchOpen: false,
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    openContactDrawer(state, action: { payload: { mode: UiState['contactDrawerMode']; entityId?: string } }) {
      state.contactDrawerOpen = true;
      state.contactDrawerMode = action.payload.mode;
      state.contactDrawerEntityId = action.payload.entityId ?? null;
    },
    closeContactDrawer(state) {
      state.contactDrawerOpen = false;
      state.contactDrawerEntityId = null;
    },
    openDealDrawer(state, action: { payload: { mode: UiState['dealDrawerMode']; entityId?: string } }) {
      state.dealDrawerOpen = true;
      state.dealDrawerMode = action.payload.mode;
      state.dealDrawerEntityId = action.payload.entityId ?? null;
    },
    closeDealDrawer(state) {
      state.dealDrawerOpen = false;
      state.dealDrawerEntityId = null;
    },
    openActivityModal(state, action: { payload: { mode: UiState['activityModalMode']; entityId?: string } }) {
      state.activityModalOpen = true;
      state.activityModalMode = action.payload.mode;
      state.activityModalEntityId = action.payload.entityId ?? null;
    },
    closeActivityModal(state) {
      state.activityModalOpen = false;
      state.activityModalEntityId = null;
    },
    openConfirmModal(state, action: { payload: string }) {
      state.confirmModalOpen = true;
      state.confirmModalAction = action.payload;
    },
    closeConfirmModal(state) {
      state.confirmModalOpen = false;
      state.confirmModalAction = null;
    },
    toggleGlobalSearch(state) {
      state.globalSearchOpen = !state.globalSearchOpen;
    },
  },
});

export const {
  openContactDrawer, closeContactDrawer,
  openDealDrawer, closeDealDrawer,
  openActivityModal, closeActivityModal,
  openConfirmModal, closeConfirmModal,
  toggleGlobalSearch,
} = uiSlice.actions;
export const uiReducer = uiSlice.reducer;
