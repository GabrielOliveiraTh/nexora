import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { notificationsReducer } from '@redux/notifications/slice';
import { contactsReducer } from '@redux/contacts/slice';
import { dealsReducer } from '@redux/deals/slice';
import { notificationsListener } from '@redux/notifications/listeners';
import { createDeal, updateDeal, deleteDeal } from '@redux/deals/actions';
import { deleteContact } from '@redux/contacts/actions';
import { mockDeals } from '@mock/deals.mock';
import { mockContacts } from '@mock/contacts.mock';
import { DealStage } from '@models/Deal.model';
import type { AppDispatch } from '@redux/store';
import '@config/i18n/config';

function createStore() {
  const store = configureStore({
    reducer: { notifications: notificationsReducer, contacts: contactsReducer, deals: dealsReducer },
    middleware: (getDefault) => getDefault({ serializableCheck: false }).prepend(notificationsListener.middleware),
  });
  return store as typeof store & { dispatch: AppDispatch };
}

const latest = (store: ReturnType<typeof createStore>) => store.getState().notifications.items[0];

describe('notifications listener', () => {
  it('creating a deal adds an unread notification', async () => {
    const store = createStore();
    const { id: _id, createdAt: _c, updatedAt: _u, ...payload } = mockDeals[0];
    await store.dispatch(createDeal({ ...payload, title: 'Brand new deal' }));
    expect(latest(store)).toMatchObject({ type: 'deal_update', title: 'Deal created successfully', message: 'Brand new deal', isRead: false });
    expect(store.getState().notifications.unreadCount).toBe(1);
  });

  it('a stage change says where the deal moved', async () => {
    const store = createStore();
    const current = mockDeals[0];
    await store.dispatch(updateDeal({ id: current.id, payload: { stage: DealStage.ClosedWon }, current }));
    expect(latest(store).title).toBe('Deal moved to Closed Won');
  });

  it('deleting uses the name from before the deletion', async () => {
    const store = createStore();
    await store.dispatch(deleteDeal(mockDeals[1].id));
    expect(latest(store)).toMatchObject({ title: 'Deal deleted successfully', message: mockDeals[1].title, entityId: null });

    await store.dispatch(deleteContact(mockContacts[0].id));
    expect(latest(store)).toMatchObject({ title: 'Contact deleted successfully', message: 'Ana Silva' });
    expect(store.getState().notifications.unreadCount).toBe(2);
  });
});
