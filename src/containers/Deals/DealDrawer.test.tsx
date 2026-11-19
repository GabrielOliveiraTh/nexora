import { describe, it, expect, beforeEach } from 'vitest';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { App as AntApp } from 'antd';
import type { Socket } from 'socket.io-client';
import { dealsReducer } from '@redux/deals/slice';
import { contactsReducer } from '@redux/contacts/slice';
import { pipelinesReducer } from '@redux/pipelines/slice';
import { uiReducer, openDealDrawer } from '@redux/ui/slice';
import { authReducer } from '@redux/auth/slice';
import { preferencesReducer } from '@redux/preferences/slice';
import { AuthProvider } from '@context/AuthContext/AuthContext';
import { writeSession } from '@context/AuthContext/auth-storage';
import { WebSocketProvider } from '@context/WebSocketContext/WebSocketContext';
import { SimultaneousEditingProvider } from '@context/SimultaneousEditingContext/SimultaneousEditingContext';
import { DealDrawer, parseProbability } from '@containers/Deals/DealDrawer';
import { useAppSelector } from '@hooks/useAppStore';
import { UserRole } from '@models/Common.model';
import { MOCK_USER_ID } from '@mock/contacts.mock';
import { MOCK_PIPELINE_ID } from '@mock/deals.mock';
import '@config/i18n/config';

const DEAL_ID = 'dd1a2b3c-d5e6-4890-abcd-ef1234567890';

const offlineSocket = {
  connected: false,
  on: () => offlineSocket,
  off: () => offlineSocket,
  emit: () => offlineSocket,
  connect: () => offlineSocket,
  disconnect: () => offlineSocket,
} as unknown as Socket;

function ConnectedDrawer() {
  const { dealDrawerOpen, dealDrawerMode, dealDrawerEntityId } = useAppSelector((s) => s.ui);
  return <DealDrawer open={dealDrawerOpen} mode={dealDrawerMode} entityId={dealDrawerEntityId} />;
}

function setup() {
  const store = configureStore({
    reducer: {
      deals: dealsReducer,
      contacts: contactsReducer,
      pipelines: pipelinesReducer,
      ui: uiReducer,
      auth: authReducer,
      preferences: preferencesReducer,
    },
  });
  render(
    <Provider store={store}>
      <AntApp>
        <AuthProvider>
          <WebSocketProvider socketFactory={() => offlineSocket}>
            <SimultaneousEditingProvider>
              <ConnectedDrawer />
            </SimultaneousEditingProvider>
          </WebSocketProvider>
        </AuthProvider>
      </AntApp>
    </Provider>,
  );
  return store;
}

const drawer = () => screen.getByRole('dialog');

describe('DealDrawer', () => {
  beforeEach(() => {
    sessionStorage.clear();
    writeSession({
      user: { id: MOCK_USER_ID, name: 'Demo User', email: 'user@test.com', avatar: null, role: UserRole.Admin, teamId: 't', isActive: true },
      permissions: {},
    });
  });

  it('editing only notes keeps companyId, pipelineId, tags and currency (BUG-02)', async () => {
    const store = setup();
    const before = store.getState().deals.items[DEAL_ID];

    act(() => {
      store.dispatch(openDealDrawer({ mode: 'edit', entityId: DEAL_ID }));
    });
    const notes = await within(drawer()).findByDisplayValue('Final pricing review scheduled');
    fireEvent.change(notes, { target: { value: 'Updated notes only' } });
    fireEvent.click(within(drawer()).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(store.getState().deals.items[DEAL_ID].notes).toBe('Updated notes only'));
    const after = store.getState().deals.items[DEAL_ID];
    const { notes: _n1, updatedAt: _u1, ...restBefore } = before;
    const { notes: _n2, updatedAt: _u2, ...restAfter } = after;
    expect(restAfter).toEqual(restBefore);
  });

  it('view mode exposes Edit, which switches to edit mode (BUG-03)', async () => {
    const store = setup();
    act(() => {
      store.dispatch(openDealDrawer({ mode: 'view', entityId: DEAL_ID }));
    });
    expect(await within(drawer()).findByRole('button', { name: /Delete/ })).toBeInTheDocument();
    fireEvent.click(within(drawer()).getByRole('button', { name: /Edit/ }));
    expect(store.getState().ui.dealDrawerMode).toBe('edit');
  });

  it('view mode Delete asks for confirmation and removes the deal (BUG-03)', async () => {
    const store = setup();
    act(() => {
      store.dispatch(openDealDrawer({ mode: 'view', entityId: DEAL_ID }));
    });
    fireEvent.click(await within(drawer()).findByRole('button', { name: /Delete/ }));
    const [confirm] = await screen.findAllByText('Are you sure you want to delete this deal?');
    const confirmDialog = confirm.closest('.ant-modal-confirm') as HTMLElement;
    fireEvent.click(within(confirmDialog).getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(store.getState().deals.items[DEAL_ID]).toBeUndefined());
    expect(store.getState().ui.dealDrawerOpen).toBe(false);
  });

  it('create defaults survive close/reopen and new deals get a pipeline (BUG-05)', async () => {
    const store = setup();
    for (let i = 0; i < 3; i++) {
      act(() => {
        store.dispatch(openDealDrawer({ mode: 'create' }));
      });
      await within(drawer()).findByDisplayValue('50');
      fireEvent.click(within(drawer()).getByRole('button', { name: 'Cancel' }));
    }

    act(() => {
      store.dispatch(openDealDrawer({ mode: 'create' }));
    });
    await within(drawer()).findByDisplayValue('50');
    fireEvent.change(within(drawer()).getByPlaceholderText('Type Title'), { target: { value: 'New deal' } });
    fireEvent.click(within(drawer()).getByRole('button', { name: 'Save' }));

    await waitFor(() => expect(store.getState().deals.ids).toHaveLength(7));
    const created = store.getState().deals.items[store.getState().deals.ids[0]];
    expect(created).toMatchObject({ title: 'New deal', probability: 50, pipelineId: MOCK_PIPELINE_ID, currency: 'USD' });
  });
});

describe('parseProbability (BUG-10)', () => {
  it('defaults empty values to 50', () => {
    expect(parseProbability(undefined)).toBe(50);
    expect(parseProbability(null)).toBe(50);
    expect(parseProbability('')).toBe(50);
    expect(parseProbability('abc')).toBe(50);
    expect(parseProbability(30)).toBe(30);
    expect(parseProbability(0)).toBe(0);
  });
});
