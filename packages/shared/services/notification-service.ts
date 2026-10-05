import type { ApiClient } from './_client';
import type { Notification } from '../types';

/**
 * Map API notification to app Notification type
 */
function mapApiNotification(n: any): Notification {
  return {
    id: n.id ?? n._id,
    type: n.type ?? 'system',
    title: n.title ?? '',
    message: n.message ?? n.body ?? '',
    time: n.time ?? n.createdAt ?? '',
    read: n.read ?? n.isRead ?? false,
    linkTo: n.linkTo ?? n.link ?? undefined,
  };
}

/**
 * Factory function for notification service
 * Accepts platform-agnostic ApiClient implementation
 */
export function createNotificationService(client: ApiClient) {
  return {
    async getAll(): Promise<Notification[]> {
      const res = await client.get<any>('/notifications');
      return (res?.data?.notifications ?? res?.notifications ?? []).map(mapApiNotification);
    },

    async markRead(id: string): Promise<void> {
      await client.patch(`/notifications/${id}/read`);
    },

    async markAllRead(): Promise<void> {
      await client.patch('/notifications/read-all');
    },
  };
}

export type NotificationService = ReturnType<typeof createNotificationService>;
