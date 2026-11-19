import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import {
  contactsReducer,
  selectContactsList,
  selectContactById,
  selectSelectedContactIds,
  setSelectedContacts,
  clearSelectedContacts,
  contactDeletedViaSocket,
} from '@redux/contacts/slice';
import { mockContacts } from '@mock/contacts.mock';
import { ContactStatus } from '@models/Contact.model';
import type { RootState } from '@redux/store';

type PartialRootState = Pick<RootState, 'contacts' | 'companies'>;

function createStore() {
  return configureStore({
    reducer: { contacts: contactsReducer, companies: () => ({ items: {}, ids: [], total: 0, status: 'idle' as const, error: null }) },
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });
}

function asRoot(state: PartialRootState): RootState {
  return state as unknown as RootState;
}

describe('contacts initial seed data', () => {
  it('starts with mock contacts pre-loaded', () => {
    const store = createStore();
    const state = store.getState();
    expect(state.contacts.ids).toHaveLength(mockContacts.length);
    expect(state.contacts.total).toBe(mockContacts.length);
    expect(state.contacts.status).toBe('succeeded');
  });

  it('selectContactsList returns all seeded contacts', () => {
    const store = createStore();
    const list = selectContactsList(asRoot(store.getState()));
    expect(list).toHaveLength(mockContacts.length);
    expect(list[0].firstName).toBe(mockContacts[0].firstName);
  });

  it('selectContactById finds a seeded contact', () => {
    const store = createStore();
    const contact = selectContactById(mockContacts[0].id)(asRoot(store.getState()));
    expect(contact).not.toBeNull();
    expect(contact?.email).toBe(mockContacts[0].email);
  });

  it('selectContactById returns null for unknown id', () => {
    const store = createStore();
    const contact = selectContactById('nonexistent')(asRoot(store.getState()));
    expect(contact).toBeNull();
  });
});

describe('contacts selection flow', () => {
  it('selects multiple contacts', () => {
    const store = createStore();
    const ids = [mockContacts[0].id, mockContacts[1].id];
    store.dispatch(setSelectedContacts(ids));
    expect(selectSelectedContactIds(asRoot(store.getState()))).toEqual(ids);
  });

  it('select all then deselect all', () => {
    const store = createStore();
    const allIds = mockContacts.map((c) => c.id);
    store.dispatch(setSelectedContacts(allIds));
    expect(selectSelectedContactIds(asRoot(store.getState()))).toHaveLength(mockContacts.length);

    store.dispatch(clearSelectedContacts());
    expect(selectSelectedContactIds(asRoot(store.getState()))).toEqual([]);
  });

  it('removing a selected contact via socket also removes it from selection', () => {
    const store = createStore();
    const targetId = mockContacts[0].id;
    store.dispatch(setSelectedContacts([targetId, mockContacts[1].id]));

    store.dispatch(contactDeletedViaSocket(targetId));

    expect(selectSelectedContactIds(asRoot(store.getState()))).toEqual([mockContacts[1].id]);
    expect(store.getState().contacts.ids).not.toContain(targetId);
    expect(store.getState().contacts.items[targetId]).toBeUndefined();
  });
});

describe('contacts data integrity', () => {
  it('all mock contacts have required fields', () => {
    for (const contact of mockContacts) {
      expect(contact.id).toBeTruthy();
      expect(contact.firstName).toBeTruthy();
      expect(contact.lastName).toBeTruthy();
      expect(contact.email).toContain('@');
      expect(Object.values(ContactStatus)).toContain(contact.status);
      expect(contact.createdAt).toBeTruthy();
      expect(contact.updatedAt).toBeTruthy();
    }
  });

  it('mock contacts have unique ids', () => {
    const ids = mockContacts.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('mock contacts have unique emails', () => {
    const emails = mockContacts.map((c) => c.email);
    expect(new Set(emails).size).toBe(emails.length);
  });
});
