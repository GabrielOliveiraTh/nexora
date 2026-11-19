import { RequestService } from '@services/RequestService';
import type { Contact } from '@models/Contact.model';
import type { ContactAddPayload, ContactEditPayload, ContactBulkEditPayload } from '@validators/ContactValidator';
import type { PaginatedResponse, QueryParams } from '@appTypes/Utils.type';

export const ContactService = {
  getContacts(params: QueryParams): Promise<PaginatedResponse<Contact>> {
    const query = new URLSearchParams();
    if (params.page) query.set('page', String(params.page));
    if (params.pageSize) query.set('pageSize', String(params.pageSize));
    if (params.search) query.set('search', params.search);
    if (params.sort) {
      query.set('sortField', params.sort.field);
      query.set('sortOrder', params.sort.order);
    }
    return RequestService.get<PaginatedResponse<Contact>>(`/contacts?${query.toString()}`);
  },

  getContact(id: string): Promise<Contact> {
    return RequestService.get<Contact>(`/contacts/${id}`);
  },

  createContact(payload: ContactAddPayload): Promise<Contact> {
    return RequestService.post<Contact>('/contacts', payload);
  },

  updateContact(id: string, payload: ContactEditPayload): Promise<Contact> {
    return RequestService.patch<Contact>(`/contacts/${id}`, payload);
  },

  bulkUpdateContacts(payload: ContactBulkEditPayload): Promise<Contact[]> {
    return RequestService.patch<Contact[]>('/contacts/bulk', payload);
  },

  deleteContact(id: string): Promise<void> {
    return RequestService.delete<void>(`/contacts/${id}`);
  },

  exportContacts(params: QueryParams): Promise<Blob> {
    const query = new URLSearchParams();
    if (params.search) query.set('search', params.search);
    return RequestService.downloadBlob(`/contacts/export?${query.toString()}`);
  },
};
