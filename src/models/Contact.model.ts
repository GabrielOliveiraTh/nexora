export enum ContactStatus {
  Lead = 'lead',
  Qualified = 'qualified',
  Customer = 'customer',
  Churned = 'churned',
}

export enum ContactSource {
  Website = 'website',
  Referral = 'referral',
  LinkedIn = 'linkedin',
  ColdCall = 'cold_call',
  Event = 'event',
  Other = 'other',
}

export interface Contact {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  companyId: string;
  status: ContactStatus;
  source: ContactSource;
  jobTitle: string;
  tags: string[];
  notes: string;
  ownerId: string;
  lastContactedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ContactFormData = Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>;
export type ContactEditData = Partial<Omit<Contact, 'id'>>;
