export interface Pipeline {
  id: string;
  name: string;
  stages: PipelineStage[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PipelineStage {
  id: string;
  name: string;
  order: number;
  probability: number;
  color: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: UserRole;
  teamId: string | null;
  isActive: boolean;
}

export enum UserRole {
  Admin = 'admin',
  Manager = 'manager',
  Sales = 'sales',
  Viewer = 'viewer',
}

export interface Team {
  id: string;
  name: string;
  managerId: string;
  memberIds: string[];
}

export interface Notification {
  id: string;
  type: 'deal_update' | 'contact_assigned' | 'activity_due' | 'mention' | 'system';
  title: string;
  message: string;
  entityId: string | null;
  entityType: 'contact' | 'deal' | 'activity' | null;
  isRead: boolean;
  createdAt: string;
}
