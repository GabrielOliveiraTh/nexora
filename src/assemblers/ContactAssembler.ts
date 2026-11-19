import type { Contact, ContactFormData, ContactEditData } from '@models/Contact.model';
import { ContactStatus, ContactSource } from '@models/Contact.model';

function transformRemovedToEmptyString<T extends Record<string, unknown>>(
  previous: T,
  current: Partial<T>,
): Partial<T> {
  const result = { ...current } as Record<string, unknown>;
  for (const key of Object.keys(previous)) {
    if (current[key as keyof T] === undefined && previous[key] !== undefined) {
      result[key] = '';
    }
  }
  return result as Partial<T>;
}

export const ContactAssembler = {
  assembleNormalizedFormContact(apiContact: Contact): ContactFormData {
    return {
      firstName: apiContact.firstName,
      lastName: apiContact.lastName,
      email: apiContact.email,
      phone: apiContact.phone,
      companyId: apiContact.companyId,
      status: apiContact.status,
      source: apiContact.source,
      jobTitle: apiContact.jobTitle,
      tags: [...apiContact.tags],
      notes: apiContact.notes,
      ownerId: apiContact.ownerId,
      lastContactedAt: apiContact.lastContactedAt,
    };
  },

  assembleFormNormalizedContact(
    previous: ContactFormData,
    edits: ContactEditData,
  ): ContactEditData {
    return transformRemovedToEmptyString(previous, edits);
  },

  assembleEmptyForm(): ContactFormData {
    return {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      companyId: '',
      status: ContactStatus.Lead,
      source: ContactSource.Website,
      jobTitle: '',
      tags: [],
      notes: '',
      ownerId: '',
      lastContactedAt: null,
    };
  },
};
