import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { notificationsReducer, notificationsLoaded, notificationReceived, notificationRead, allNotificationsRead } from '@redux/notifications/slice';
import type { Notification } from '@models/Common.model';

function createStore() {
  return configureStore({
    reducer: { notifications: notificationsReducer },
  });
}

const mockNotification: Notification = {
  id: 'n-1',
  type: 'deal_update',
  title: 'Deal updated',
  message: 'Big Deal moved to Closed Won',
  entityId: 'd-1',
  entityType: 'deal',
  isRead: false,
  createdAt: '2024-03-20T10:00:00.000Z',
};

describe('notifications slice', () => {
  it('loads notifications and counts unread', () => {
    const store = createStore();
    store.dispatch(notificationsLoaded([
      mockNotification,
      { ...mockNotification, id: 'n-2', isRead: true },
    ]));
    expect(store.getState().notifications.items).toHaveLength(2);
    expect(store.getState().notifications.unreadCount).toBe(1);
  });

  it('adds new notification and increments unread', () => {
    const store = createStore();
    store.dispatch(notificationReceived(mockNotification));
    expect(store.getState().notifications.items).toHaveLength(1);
    expect(store.getState().notifications.unreadCount).toBe(1);
  });

  it('does not increment unread for already-read notification', () => {
    const store = createStore();
    store.dispatch(notificationReceived({ ...mockNotification, isRead: true }));
    expect(store.getState().notifications.unreadCount).toBe(0);
  });

  it('marks single notification as read', () => {
    const store = createStore();
    store.dispatch(notificationReceived(mockNotification));
    store.dispatch(notificationRead('n-1'));
    expect(store.getState().notifications.items[0].isRead).toBe(true);
    expect(store.getState().notifications.unreadCount).toBe(0);
  });

  it('does not double-decrement on re-read', () => {
    const store = createStore();
    store.dispatch(notificationReceived(mockNotification));
    store.dispatch(notificationRead('n-1'));
    store.dispatch(notificationRead('n-1'));
    expect(store.getState().notifications.unreadCount).toBe(0);
  });

  it('marks all as read', () => {
    const store = createStore();
    store.dispatch(notificationReceived(mockNotification));
    store.dispatch(notificationReceived({ ...mockNotification, id: 'n-2' }));
    store.dispatch(allNotificationsRead());
    expect(store.getState().notifications.unreadCount).toBe(0);
    expect(store.getState().notifications.items.every((n) => n.isRead)).toBe(true);
  });
});
