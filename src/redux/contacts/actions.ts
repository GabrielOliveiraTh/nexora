import { createAsyncThunk } from '@redux/thunk';
import { ContactService } from '@services/Contact.service';
import type { Contact } from '@models/Contact.model';
import type { QueryParams } from '@appTypes/Utils.type';
import type { ContactAddPayload, ContactEditPayload } from '@validators/ContactValidator';

export const fetchContacts = createAsyncThunk(
  'contacts/fetchContacts',
  async (arg) => {
    const params = arg as QueryParams;
    return ContactService.getContacts(params);
  },
);

export const fetchContact = createAsyncThunk(
  'contacts/fetchContact',
  async (arg) => {
    const id = arg as string;
    return ContactService.getContact(id);
  },
);

export const createContact = createAsyncThunk(
  'contacts/createContact',
  async (arg) => {
    const payload = arg as ContactAddPayload;
    try {
      return await ContactService.createContact(payload);
    } catch {
      const now = new Date().toISOString();
      return {
        id: crypto.randomUUID(),
        ...payload,
        tags: payload.tags ?? [],
        notes: payload.notes ?? '',
        phone: payload.phone ?? '',
        jobTitle: payload.jobTitle ?? '',
        companyId: payload.companyId ?? '',
        lastContactedAt: payload.lastContactedAt ?? null,
        createdAt: now,
        updatedAt: now,
      } as Contact;
    }
  },
);

export const updateContact = createAsyncThunk(
  'contacts/updateContact',
  async (arg) => {
    const { id, payload, current } = arg as { id: string; payload: ContactEditPayload; current: Contact };
    try {
      return await ContactService.updateContact(id, payload);
    } catch {
      return {
        ...current,
        ...payload,
        updatedAt: new Date().toISOString(),
      } as Contact;
    }
  },
);

export const deleteContact = createAsyncThunk(
  'contacts/deleteContact',
  async (arg) => {
    const id = arg as string;
    try {
      await ContactService.deleteContact(id);
    } catch {
      // Demo mode: proceed with local deletion
    }
    return id;
  },
);
