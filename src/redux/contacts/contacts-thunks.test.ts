import { describe, it, expect } from 'vitest';
import { configureStore } from '@reduxjs/toolkit';
import { contactsReducer } from '@redux/contacts/slice';
import { createContact, deleteContact, updateContact } from '@redux/contacts/actions';
import { ContactStatus, ContactSource } from '@models/Contact.model';
import { MOCK_USER_ID, mockContacts } from '@mock/contacts.mock';
import type { AppDispatch } from '@redux/store';

function createStore() {
  const store = configureStore({
    reducer: { contacts: contactsReducer },
    middleware: (getDefault) => getDefault({ serializableCheck: false }),
  });
  return store as typeof store & { dispatch: AppDispatch };
}

describe('contact thunks (demo mode, no backend)', () => {
  describe('createContact', () => {
    it('creates a contact locally when API is unavailable', async () => {
      const store = createStore();
      const initialCount = store.getState().contacts.ids.length;

      await store.dispatch(
        createContact({
          firstName: 'Test',
          lastName: 'User',
          email: 'test@example.com',
          status: ContactStatus.Lead,
          source: ContactSource.Website,
          ownerId: MOCK_USER_ID,
        }),
      );

      const state = store.getState().contacts;
      expect(state.ids).toHaveLength(initialCount + 1);

      const newId = state.ids[0];
      const newContact = state.items[newId];
      expect(newContact.firstName).toBe('Test');
      expect(newContact.lastName).toBe('User');
      expect(newContact.email).toBe('test@example.com');
      expect(newContact.status).toBe(ContactStatus.Lead);
      expect(newContact.createdAt).toBeTruthy();
      expect(newContact.id).toMatch(/^[0-9a-f-]+$/);
    });

    it('assigns default values for optional fields', async () => {
      const store = createStore();

      await store.dispatch(
        createContact({
          firstName: 'Minimal',
          lastName: 'Contact',
          email: 'minimal@example.com',
          status: ContactStatus.Lead,
          source: ContactSource.Other,
          ownerId: MOCK_USER_ID,
        }),
      );

      const state = store.getState().contacts;
      const newId = state.ids[0];
      const contact = state.items[newId];
      expect(contact.tags).toEqual([]);
      expect(contact.notes).toBe('');
      expect(contact.phone).toBe('');
      expect(contact.lastContactedAt).toBeNull();
    });

    it('increments total count after creation', async () => {
      const store = createStore();
      const initialTotal = store.getState().contacts.total;

      await store.dispatch(
        createContact({
          firstName: 'New',
          lastName: 'One',
          email: 'new@test.com',
          status: ContactStatus.Lead,
          source: ContactSource.Website,
          ownerId: MOCK_USER_ID,
        }),
      );

      expect(store.getState().contacts.total).toBe(initialTotal + 1);
    });
  });

  describe('deleteContact', () => {
    it('removes a contact from state', async () => {
      const store = createStore();
      const targetId = mockContacts[0].id;
      const initialCount = store.getState().contacts.ids.length;

      await store.dispatch(deleteContact(targetId));

      const state = store.getState().contacts;
      expect(state.ids).toHaveLength(initialCount - 1);
      expect(state.ids).not.toContain(targetId);
      expect(state.items[targetId]).toBeUndefined();
      expect(state.total).toBe(initialCount - 1);
    });

    it('does not crash when deleting non-existent id', async () => {
      const store = createStore();
      const initialCount = store.getState().contacts.ids.length;

      await store.dispatch(deleteContact('nonexistent-id'));

      expect(store.getState().contacts.ids).toHaveLength(initialCount);
    });
  });

  describe('updateContact', () => {
    it('updates a contact in state', async () => {
      const store = createStore();
      const target = mockContacts[0];

      await store.dispatch(
        updateContact({
          id: target.id,
          payload: { firstName: 'Updated' },
          current: target,
        }),
      );

      const updated = store.getState().contacts.items[target.id];
      expect(updated.firstName).toBe('Updated');
      expect(updated.lastName).toBe(target.lastName);
      expect(updated.email).toBe(target.email);
    });

    it('updates the updatedAt timestamp', async () => {
      const store = createStore();
      const target = mockContacts[1];
      const originalUpdatedAt = target.updatedAt;

      await store.dispatch(
        updateContact({
          id: target.id,
          payload: { status: ContactStatus.Qualified },
          current: target,
        }),
      );

      const updated = store.getState().contacts.items[target.id];
      expect(updated.updatedAt).not.toBe(originalUpdatedAt);
    });

    it('preserves unmodified fields', async () => {
      const store = createStore();
      const target = mockContacts[2];

      await store.dispatch(
        updateContact({
          id: target.id,
          payload: { notes: 'New note' },
          current: target,
        }),
      );

      const updated = store.getState().contacts.items[target.id];
      expect(updated.notes).toBe('New note');
      expect(updated.firstName).toBe(target.firstName);
      expect(updated.email).toBe(target.email);
      expect(updated.phone).toBe(target.phone);
      expect(updated.tags).toEqual(target.tags);
    });
  });

  describe('full CRUD cycle', () => {
    it('creates, updates, then deletes a contact', async () => {
      const store = createStore();
      const initialCount = store.getState().contacts.ids.length;

      const createResult = await store.dispatch(
        createContact({
          firstName: 'Lifecycle',
          lastName: 'Test',
          email: 'lifecycle@test.com',
          status: ContactStatus.Lead,
          source: ContactSource.Website,
          ownerId: MOCK_USER_ID,
        }),
      );

      const createdContact = (createResult as { payload: { id: string } }).payload;
      expect(store.getState().contacts.ids).toHaveLength(initialCount + 1);

      await store.dispatch(
        updateContact({
          id: createdContact.id,
          payload: { status: ContactStatus.Qualified },
          current: store.getState().contacts.items[createdContact.id],
        }),
      );

      expect(store.getState().contacts.items[createdContact.id].status).toBe(ContactStatus.Qualified);

      await store.dispatch(deleteContact(createdContact.id));

      expect(store.getState().contacts.ids).toHaveLength(initialCount);
      expect(store.getState().contacts.items[createdContact.id]).toBeUndefined();
    });
  });
});
