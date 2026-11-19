import type { Notification } from '@models/Common.model';

const hoursAgo = (h: number) => new Date(Date.now() - h * 3_600_000).toISOString();

/** Demo seed (timestamps relative to load time so they always look recent). */
export function createMockNotifications(): Notification[] {
  return [
    {
      id: 'n0000000-0000-4000-a000-000000000001',
      type: 'deal_update',
      title: 'Deal moved to Negotiation',
      message: 'TechCorp Enterprise License is now in Negotiation (75%).',
      entityId: 'dd1a2b3c-d5e6-4890-abcd-ef1234567890',
      entityType: 'deal',
      isRead: false,
      createdAt: hoursAgo(0.5),
    },
    {
      id: 'n0000000-0000-4000-a000-000000000002',
      type: 'contact_assigned',
      title: 'New contact assigned to you',
      message: 'Rafael Lima (DevShop) was assigned to you.',
      entityId: null,
      entityType: 'contact',
      isRead: false,
      createdAt: hoursAgo(3),
    },
    {
      id: 'n0000000-0000-4000-a000-000000000003',
      type: 'activity_due',
      title: 'Follow-up due tomorrow',
      message: 'Call Juliana Costa about the renewal proposal.',
      entityId: null,
      entityType: 'activity',
      isRead: true,
      createdAt: hoursAgo(26),
    },
    {
      id: 'n0000000-0000-4000-a000-000000000004',
      type: 'system',
      title: 'Welcome to Nexora',
      message: 'Your workspace is ready. Changes you make create notifications here.',
      entityId: null,
      entityType: null,
      isRead: true,
      createdAt: hoursAgo(72),
    },
  ];
}
