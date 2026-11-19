import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { deleteContact } from '@redux/contacts/actions';
import { contactsReducer, setSelectedContacts, clearSelectedContacts, contactUpdatedViaSocket, contactDeletedViaSocket } from '@redux/contacts/slice';
import { ContactStatus, ContactSource, type Contact } from '@models/Contact.model';

function createStore() {
  return configureStore({
    reducer: { contacts: contactsReducer },
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });
}

const mockContact: Contact = {
  id: 'c-1',
  firstName: 'John',
  lastName: 'Doe',
  email: 'john@test.com',
  phone: '+1234',
  companyId: 'comp-1',
  status: ContactStatus.Lead,
  source: ContactSource.Website,
  jobTitle: 'Dev',
  tags: [],
  notes: '',
  ownerId: 'u-1',
  lastContactedAt: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('contacts slice', () => {
  it('sets selected contacts', () => {
    const store = createStore();
    store.dispatch(setSelectedContacts(['c-1', 'c-2']));
    expect(store.getState().contacts.selectedIds).toEqual(['c-1', 'c-2']);
  });

  it('clears selected contacts', () => {
    const store = createStore();
    store.dispatch(setSelectedContacts(['c-1']));
    store.dispatch(clearSelectedContacts());
    expect(store.getState().contacts.selectedIds).toEqual([]);
  });

  it('adds contact via socket update', () => {
    const store = createStore();
    store.dispatch(contactUpdatedViaSocket(mockContact));
    expect(store.getState().contacts.items['c-1']).toEqual(mockContact);
    expect(store.getState().contacts.ids).toContain('c-1');
  });

  it('does not duplicate ids on repeated socket update', () => {
    const store = createStore();
    store.dispatch(contactUpdatedViaSocket(mockContact));
    store.dispatch(contactUpdatedViaSocket({ ...mockContact, firstName: 'Jane' }));
    expect(store.getState().contacts.ids.filter((id) => id === 'c-1')).toHaveLength(1);
    expect(store.getState().contacts.items['c-1'].firstName).toBe('Jane');
  });

  it('removes contact via socket delete', () => {
    const store = createStore();
    store.dispatch(contactUpdatedViaSocket(mockContact));
    store.dispatch(setSelectedContacts(['c-1']));
    store.dispatch(contactDeletedViaSocket('c-1'));
    expect(store.getState().contacts.items['c-1']).toBeUndefined();
    expect(store.getState().contacts.ids).not.toContain('c-1');
    expect(store.getState().contacts.selectedIds).not.toContain('c-1');
  });

  it('removes a deleted contact from the selection (BUG-15)', () => {
    const store = createStore();
    store.dispatch(contactUpdatedViaSocket(mockContact));
    store.dispatch(setSelectedContacts([mockContact.id]));
    store.dispatch({ type: deleteContact.fulfilled.type, payload: mockContact.id });
    expect(store.getState().contacts.selectedIds).toEqual([]);
  });
});
