import { configureStore } from '@reduxjs/toolkit';
import { contactsReducer } from '@redux/contacts/slice';
import { companiesReducer } from '@redux/companies/slice';
import { dealsReducer } from '@redux/deals/slice';
import { activitiesReducer } from '@redux/activities/slice';
import { pipelinesReducer } from '@redux/pipelines/slice';
import { usersReducer } from '@redux/users/slice';
import { notificationsReducer } from '@redux/notifications/slice';
import { preferencesReducer, savePreferences } from '@redux/preferences/slice';
import { uiReducer } from '@redux/ui/slice';
import { authReducer } from '@redux/auth/slice';
import { notificationsListener } from '@redux/notifications/listeners';
import { createMockNotifications } from '@mock/notifications.mock';

const seededNotifications = createMockNotifications();

export const store = configureStore({
  reducer: {
    contacts: contactsReducer,
    companies: companiesReducer,
    deals: dealsReducer,
    activities: activitiesReducer,
    pipelines: pipelinesReducer,
    users: usersReducer,
    notifications: notificationsReducer,
    preferences: preferencesReducer,
    ui: uiReducer,
    auth: authReducer,
  },
  preloadedState: {
    notifications: {
      items: seededNotifications,
      unreadCount: seededNotifications.filter((n) => !n.isRead).length,
    },
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }).prepend(notificationsListener.middleware),
});

// Persist user preferences (theme, currency, page size...) across reloads.
let lastPreferences = store.getState().preferences;
store.subscribe(() => {
  const { preferences } = store.getState();
  if (preferences !== lastPreferences) {
    lastPreferences = preferences;
    savePreferences(preferences);
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
