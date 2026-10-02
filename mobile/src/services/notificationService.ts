import { useNotificationStore } from '@stores/notificationStore';
import {
  NotificationType,
  NotificationPriority,
  NotificationAction,
} from '@/types/notification';

/**
 * Notification Service
 * Helper functions to easily create and manage notifications
 */

interface CreateNotificationParams {
  title: string;
  message: string;
  type?: NotificationType;
  priority?: NotificationPriority;
  action?: NotificationAction;
  icon?: string;
}

/**
 * Create a new notification
 */
export const createNotification = (params: CreateNotificationParams) => {
  const { addNotification } = useNotificationStore.getState();

  addNotification({
    title: params.title,
    message: params.message,
    type: params.type || 'general',
    priority: params.priority || 'normal',
    action: params.action,
    icon: params.icon,
  });
};

/**
 * Create an event notification with navigation
 */
export const notifyEvent = (
  title: string,
  message: string,
  eventId: string,
  priority: NotificationPriority = 'normal',
) => {
  createNotification({
    title,
    message,
    type: 'event',
    priority,
    icon: 'calendar',
    action: {
      type: 'navigate',
      screen: 'EventDetail',
      params: { eventId },
    },
  });
};

/**
 * Create a reminder notification
 */
export const notifyReminder = (
  title: string,
  message: string,
  screen?: string,
  params?: Record<string, any>,
) => {
  createNotification({
    title,
    message,
    type: 'reminder',
    priority: 'normal',
    icon: 'clock',
    action: screen
      ? {
          type: 'navigate',
          screen,
          params,
        }
      : undefined,
  });
};

/**
 * Create an alert notification (high priority)
 */
export const notifyAlert = (
  title: string,
  message: string,
  action?: NotificationAction,
) => {
  createNotification({
    title,
    message,
    type: 'alert',
    priority: 'high',
    icon: 'bell',
    action,
  });
};

/**
 * Create a message notification
 */
export const notifyMessage = (
  title: string,
  message: string,
  action?: NotificationAction,
) => {
  createNotification({
    title,
    message,
    type: 'message',
    priority: 'normal',
    icon: 'mail',
    action,
  });
};

/**
 * Clear all notifications
 */
export const clearAllNotifications = () => {
  const { clearAllNotifications } = useNotificationStore.getState();
  clearAllNotifications();
};

/**
 * Get unread notification count
 */
export const getUnreadCount = (): number => {
  return useNotificationStore.getState().unreadCount;
};
