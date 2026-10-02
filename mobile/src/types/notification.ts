/**
 * Notification Types and Interfaces
 */

export type NotificationType =
  | 'event'
  | 'message'
  | 'alert'
  | 'reminder'
  | 'general';

export type NotificationPriority = 'low' | 'normal' | 'high';

export interface NotificationAction {
  type: 'navigate' | 'external' | 'open_url' | 'dismiss';
  screen?: string | null;
  params?: Record<string, any>;
  url?: string;
}

/**
 * API Notification Response (from backend)
 */
export interface APINotification {
  id: string;
  userId: string;
  type: NotificationType;
  priority: NotificationPriority;
  title: string;
  message: string;
  icon: string;
  imageUrl?: string | null;
  link?: string | null;
  action?: NotificationAction;
  metadata?: Record<string, any>;
  read: boolean;
  isNew: boolean;
  readAt?: string | null;
  eventId?: string | null;
  createdAt: string; // ISO 8601 timestamp
}

/**
 * App Notification (internal use)
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  priority: NotificationPriority;
  timestamp: number; // Unix timestamp in milliseconds
  read: boolean;
  isNew: boolean;
  action?: NotificationAction;
  imageUrl?: string;
  icon?: string;
  metadata?: Record<string, any>;
  userId?: string;
  eventId?: string | null;
  readAt?: number | null; // Unix timestamp
  link?: string | null;
}

/**
 * API Response for notifications list
 */
export interface NotificationsAPIResponse {
  notifications: APINotification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  lastFetchTime: number | null;
  addNotification: (
    notification: Omit<Notification, 'id' | 'timestamp' | 'read' | 'isNew'>,
  ) => void;
  setNotifications: (notifications: Notification[]) => void;
  syncFromAPI: (
    apiNotifications: APINotification[],
    unreadCount: number,
  ) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearAllNotifications: () => void;
  markAsOld: (id: string) => void;
  markAllAsOld: () => void;
  seedIfEmpty: () => void;
}

/**
 * Transform API notification to app notification
 */
export const transformAPINotification = (
  apiNotification: APINotification,
): Notification => {
  return {
    id: apiNotification.id,
    title: apiNotification.title,
    message: apiNotification.message,
    type: apiNotification.type,
    priority: apiNotification.priority,
    timestamp: new Date(apiNotification.createdAt).getTime(),
    read: apiNotification.read,
    isNew: apiNotification.isNew,
    action: apiNotification.action,
    imageUrl: apiNotification.imageUrl || undefined,
    icon: apiNotification.icon,
    metadata: apiNotification.metadata,
    userId: apiNotification.userId,
    eventId: apiNotification.eventId,
    readAt: apiNotification.readAt
      ? new Date(apiNotification.readAt).getTime()
      : null,
    link: apiNotification.link,
  };
};
