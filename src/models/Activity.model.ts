export enum ActivityType {
  Call = 'call',
  Email = 'email',
  Meeting = 'meeting',
  Note = 'note',
  Task = 'task',
}

export enum ActivityStatus {
  Pending = 'pending',
  Completed = 'completed',
  Cancelled = 'cancelled',
}

export interface Activity {
  id: string;
  type: ActivityType;
  subject: string;
  description: string;
  status: ActivityStatus;
  contactId: string;
  dealId: string | null;
  companyId: string | null;
  ownerId: string;
  dueDate: string | null;
  completedAt: string | null;
  duration: number | null;
  createdAt: string;
  updatedAt: string;
}

export type ActivityFormData = Omit<Activity, 'id' | 'createdAt' | 'updatedAt' | 'completedAt'>;
export type ActivityEditData = Partial<Omit<Activity, 'id'>>;
