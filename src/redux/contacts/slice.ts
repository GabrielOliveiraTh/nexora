import { createSlice, createSelector } from '@reduxjs/toolkit';
import { produce } from 'immer';
import type { Contact } from '@models/Contact.model';
import type { AsyncStatus } from '@appTypes/Utils.type';
import type { RootState } from '@redux/store';
import { fetchContacts, fetchContact, createContact, updateContact, deleteContact } from '@redux/contacts/actions';
import { mockContacts } from '@mock/contacts.mock';

interface ContactsState {
  items: Record<string, Contact>;
  ids: string[];
  total: number;
  status: AsyncStatus;
  detailStatus: AsyncStatus;
  error: string | null;
  selectedIds: string[];
}

const seededItems: Record<string, Contact> = {};
for (const c of mockContacts) {
  seededItems[c.id] = c;
}

const initialState: ContactsState = {
  items: seededItems,
  ids: mockContacts.map((c) => c.id),
  total: mockContacts.length,
  status: 'succeeded',
  detailStatus: 'idle',
  error: null,
  selectedIds: [],
};

const contactsSlice = createSlice({
  name: 'contacts',
  initialState,
  reducers: {
    setSelectedContacts(state, action: { payload: string[] }) {
      state.selectedIds = action.payload;
    },
    clearSelectedContacts(state) {
      state.selectedIds = [];
    },
    contactUpdatedViaSocket(state, action: { payload: Contact }) {
      const contact = action.payload;
      state.items[contact.id] = contact;
      if (!state.ids.includes(contact.id)) {
        state.ids.push(contact.id);
      }
    },
    contactDeletedViaSocket(state, action: { payload: string }) {
      const id = action.payload;
      delete state.items[id];
      state.ids = state.ids.filter((i) => i !== id);
      state.selectedIds = state.selectedIds.filter((i) => i !== id);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchContacts.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchContacts.fulfilled, (state, action) => {
        state.status = 'succeeded';
        const { data, total } = action.payload as { data: Contact[]; total: number };
        state.total = total;
        state.ids = data.map((c) => c.id);
        state.items = produce(state.items, (draft) => {
          for (const contact of data) {
            draft[contact.id] = contact;
          }
        });
      })
      .addCase(fetchContacts.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to fetch contacts';
      })
      .addCase(fetchContact.pending, (state) => {
        state.detailStatus = 'loading';
      })
      .addCase(fetchContact.fulfilled, (state, action) => {
        state.detailStatus = 'succeeded';
        const contact = action.payload as Contact;
        state.items[contact.id] = contact;
      })
      .addCase(createContact.fulfilled, (state, action) => {
        const contact = action.payload as Contact;
        state.items[contact.id] = contact;
        state.ids.unshift(contact.id);
        state.total++;
      })
      .addCase(updateContact.fulfilled, (state, action) => {
        const contact = action.payload as Contact;
        state.items[contact.id] = contact;
      })
      .addCase(deleteContact.fulfilled, (state, action) => {
        const id = action.payload as string;
        delete state.items[id];
        state.ids = state.ids.filter((i) => i !== id);
        state.selectedIds = state.selectedIds.filter((i) => i !== id);
        state.total--;
      });
  },
});

export const {
  setSelectedContacts,
  clearSelectedContacts,
  contactUpdatedViaSocket,
  contactDeletedViaSocket,
} = contactsSlice.actions;

export const contactsReducer = contactsSlice.reducer;

const selectContactsState = (state: RootState) => state.contacts;
const selectCompaniesState = (state: RootState) => state.companies;

export const selectContactsList = createSelector(
  [selectContactsState],
  (contacts) => contacts.ids.map((id) => contacts.items[id]).filter(Boolean),
);

export const selectContactsWithCompany = createSelector(
  [selectContactsList, selectCompaniesState],
  (contacts, companies) =>
    contacts.map((contact) => ({
      ...contact,
      company: companies.items[contact.companyId] ?? null,
    })),
);

export const selectContactById = (id: string) =>
  createSelector([selectContactsState], (contacts) => contacts.items[id] ?? null);

export const selectContactsStatus = createSelector(
  [selectContactsState],
  (contacts) => contacts.status,
);

export const selectSelectedContactIds = createSelector(
  [selectContactsState],
  (contacts) => contacts.selectedIds,
);
