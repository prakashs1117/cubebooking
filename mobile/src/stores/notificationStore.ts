import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Notification,
  NotificationState,
  transformAPINotification,
} from '@/types/notification';

// ── Mock seed data (shown until /me/notifications is live) ────────────────────

const MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'mock_1',
    title: 'Meal order confirmed',
    message: 'Your Lunch order for tomorrow has been confirmed. Pick up at MGCC between 12:00–2:00 PM.',
    type: 'alert',
    priority: 'normal',
    timestamp: Date.now() - 5 * 60 * 1000,
    read: false,
    isNew: true,
    icon: 'bell',
  },
  {
    id: 'mock_2',
    title: 'New event: Q3 Town Hall',
    message: 'The Q3 All-Hands Town Hall is scheduled for next Friday at 10 AM in the Main Auditorium. Register now.',
    type: 'event',
    priority: 'high',
    timestamp: Date.now() - 2 * 60 * 60 * 1000,
    read: false,
    isNew: true,
    icon: 'event',
  },
  {
    id: 'mock_3',
    title: 'Order cutoff reminder',
    message: "Tomorrow's meal booking closes at 6:00 PM today. Don't forget to place your order.",
    type: 'reminder',
    priority: 'normal',
    timestamp: Date.now() - 4 * 60 * 60 * 1000,
    read: true,
    isNew: false,
    icon: 'clock',
  },
  {
    id: 'mock_4',
    title: 'Colleague joined MerckConnect',
    message: 'Sarah Chen from R&D has joined MerckConnect. Connect with her to grow your network.',
    type: 'message',
    priority: 'low',
    timestamp: Date.now() - 24 * 60 * 60 * 1000,
    read: true,
    isNew: false,
    icon: 'person_add',
  },
  {
    id: 'mock_5',
    title: 'Meal rated — thanks!',
    message: 'Thanks for rating your Tuesday lunch. Your feedback helps improve the cafeteria menu.',
    type: 'general',
    priority: 'low',
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    read: true,
    isNew: false,
    icon: 'rate_review',
  },
];

/**
 * Notification Store
 * Manages app notifications with persistence and API sync
 */
export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, _get) => ({
      notifications: [],
      unreadCount: 0,
      lastFetchTime: null,

      addNotification: notificationData => {
        const newNotification: Notification = {
          ...notificationData,
          id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          timestamp: Date.now(),
          read: false,
          isNew: true,
        };

        set(state => ({
          notifications: [newNotification, ...state.notifications],
          unreadCount: state.unreadCount + 1,
        }));
      },

      setNotifications: notifications => {
        const unreadCount = notifications.filter(n => !n.read).length;
        set({ notifications, unreadCount });
      },

      syncFromAPI: (apiNotifications, unreadCount) => {
        // Transform API notifications to app notifications
        const transformedNotifications = apiNotifications.map(
          transformAPINotification,
        );

        // Update store with API data
        set({
          notifications: transformedNotifications,
          unreadCount,
          lastFetchTime: Date.now(),
        });
      },

      markAsRead: id => {
        set(state => {
          const notifications = state.notifications.map(notif =>
            notif.id === id ? { ...notif, read: true } : notif,
          );
          const unreadCount = notifications.filter(n => !n.read).length;
          return { notifications, unreadCount };
        });
      },

      markAllAsRead: () => {
        set(state => ({
          notifications: state.notifications.map(notif => ({
            ...notif,
            read: true,
          })),
          unreadCount: 0,
        }));
      },

      deleteNotification: id => {
        set(state => {
          const notifications = state.notifications.filter(
            notif => notif.id !== id,
          );
          const unreadCount = notifications.filter(n => !n.read).length;
          return { notifications, unreadCount };
        });
      },

      clearAllNotifications: () => {
        set({ notifications: [], unreadCount: 0 });
      },

      markAsOld: id => {
        set(state => ({
          notifications: state.notifications.map(notif =>
            notif.id === id ? { ...notif, isNew: false } : notif,
          ),
        }));
      },

      markAllAsOld: () => {
        set(state => ({
          notifications: state.notifications.map(notif => ({
            ...notif,
            isNew: false,
          })),
        }));
      },

      seedIfEmpty: () => {
        set(state => {
          if (state.notifications.length > 0) return {};
          const unreadCount = MOCK_NOTIFICATIONS.filter(n => !n.read).length;
          return { notifications: MOCK_NOTIFICATIONS, unreadCount };
        });
      },
    }),
    {
      name: 'notification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
