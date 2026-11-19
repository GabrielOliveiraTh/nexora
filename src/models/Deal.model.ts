export enum DealStage {
  Prospecting = 'prospecting',
  Qualification = 'qualification',
  Proposal = 'proposal',
  Negotiation = 'negotiation',
  ClosedWon = 'closed_won',
  ClosedLost = 'closed_lost',
}

export enum DealPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

export interface Deal {
  id: string;
  title: string;
  value: number;
  currency: string;
  stage: DealStage;
  priority: DealPriority;
  probability: number;
  contactId: string;
  companyId: string;
  pipelineId: string;
  ownerId: string;
  expectedCloseDate: string;
  tags: string[];
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export type DealFormData = Omit<Deal, 'id' | 'createdAt' | 'updatedAt'>;
export type DealEditData = Partial<Omit<Deal, 'id'>>;
