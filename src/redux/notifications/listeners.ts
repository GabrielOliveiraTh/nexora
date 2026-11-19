import { createListenerMiddleware, isFulfilled } from '@reduxjs/toolkit';
import i18next from 'i18next';
import type { Notification } from '@models/Common.model';
import type { Contact } from '@models/Contact.model';
import type { Deal } from '@models/Deal.model';
import { createContact, updateContact, deleteContact } from '@redux/contacts/actions';
import { createDeal, updateDeal, updateDealStage, deleteDeal } from '@redux/deals/actions';
import { notificationReceived } from '@redux/notifications/slice';

type NewNotification = Omit<Notification, 'id' | 'createdAt' | 'isRead'>;

export function buildNotification(data: NewNotification): Notification {
  return { ...data, id: crypto.randomUUID(), isRead: false, createdAt: new Date().toISOString() };
}

/** Thunk actions lose their payload type through the listener matchers. */
const payloadOf = <T,>(action: unknown): T => (action as { payload: T }).payload;

const contactName = (c: Pick<Contact, 'firstName' | 'lastName'>) => `${c.firstName} ${c.lastName}`;

interface MinimalState {
  contacts: { items: Record<string, Contact | undefined> };
  deals: { items: Record<string, Deal | undefined> };
}

/**
 * Turns local CRUD activity into notifications, so the Notifications page
 * reflects what happened in the session (the backend would push these via
 * the `notification:new` socket event).
 */
export const notificationsListener = createListenerMiddleware();

notificationsListener.startListening({
  matcher: isFulfilled(createContact, updateContact),
  effect: (action, api) => {
    const contact = payloadOf<Contact>(action);
    const created = createContact.fulfilled.match(action);
    api.dispatch(notificationReceived(buildNotification({
      type: 'contact_assigned',
      title: i18next.t(created ? 'contacts:notification.created' : 'contacts:notification.updated'),
      message: contactName(contact),
      entityId: contact.id,
      entityType: 'contact',
    })));
  },
});

notificationsListener.startListening({
  actionCreator: deleteContact.fulfilled,
  effect: (action, api) => {
    const id = action.payload as string;
    const previous = (api.getOriginalState() as MinimalState).contacts.items[id];
    api.dispatch(notificationReceived(buildNotification({
      type: 'contact_assigned',
      title: i18next.t('contacts:notification.deleted'),
      message: previous ? contactName(previous) : id,
      entityId: null,
      entityType: 'contact',
    })));
  },
});

notificationsListener.startListening({
  matcher: isFulfilled(createDeal, updateDeal, updateDealStage),
  effect: (action, api) => {
    const deal = payloadOf<Deal>(action);
    const previous = (api.getOriginalState() as MinimalState).deals.items[deal.id];
    let title: string;
    if (createDeal.fulfilled.match(action)) {
      title = i18next.t('deals:notification.created');
    } else if (previous && previous.stage !== deal.stage) {
      title = i18next.t('deals:notification.stageChanged', { stage: i18next.t(`deals:stage.${deal.stage}`) });
    } else {
      title = i18next.t('deals:notification.updated');
    }
    api.dispatch(notificationReceived(buildNotification({
      type: 'deal_update',
      title,
      message: deal.title,
      entityId: deal.id,
      entityType: 'deal',
    })));
  },
});

notificationsListener.startListening({
  actionCreator: deleteDeal.fulfilled,
  effect: (action, api) => {
    const id = action.payload as string;
    const previous = (api.getOriginalState() as MinimalState).deals.items[id];
    api.dispatch(notificationReceived(buildNotification({
      type: 'deal_update',
      title: i18next.t('deals:notification.deleted'),
      message: previous?.title ?? id,
      entityId: null,
      entityType: 'deal',
    })));
  },
});
