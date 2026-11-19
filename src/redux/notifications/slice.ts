import { createSlice } from '@reduxjs/toolkit';
import type { Notification } from '@models/Common.model';

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
}

const initialState: NotificationsState = { items: [], unreadCount: 0 };

const notificationsSlice = createSlice({
  name: 'notifications',
  initialState,
  reducers: {
    notificationsLoaded(state, action: { payload: Notification[] }) {
      state.items = action.payload;
      state.unreadCount = action.payload.filter((n) => !n.isRead).length;
    },
    notificationReceived(state, action: { payload: Notification }) {
      state.items.unshift(action.payload);
      if (!action.payload.isRead) state.unreadCount++;
    },
    notificationRead(state, action: { payload: string }) {
      const notification = state.items.find((n) => n.id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount--;
      }
    },
    allNotificationsRead(state) {
      for (const n of state.items) n.isRead = true;
      state.unreadCount = 0;
    },
  },
});

export const { notificationsLoaded, notificationReceived, notificationRead, allNotificationsRead } = notificationsSlice.actions;
export const notificationsReducer = notificationsSlice.reducer;
