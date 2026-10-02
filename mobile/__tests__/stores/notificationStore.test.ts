/**
 * Notification Store Tests
 */

import { useNotificationStore } from '@stores/notificationStore';
import { APINotification } from '@/types/notification';

beforeEach(() => {
  useNotificationStore.setState({
    notifications: [],
    unreadCount: 0,
    lastFetchTime: null,
  });
});

const makeAPINotification = (
  overrides: Partial<APINotification> = {},
): APINotification => ({
  id: 'notif-1',
  userId: 'user-1',
  type: 'event',
  priority: 'normal',
  title: 'Test notification',
  message: 'Test message',
  icon: 'bell',
  read: false,
  isNew: true,
  createdAt: new Date('2024-01-01T12:00:00Z').toISOString(),
  ...overrides,
});

describe('addNotification', () => {
  it('adds a notification and increments unreadCount', () => {
    useNotificationStore.getState().addNotification({
      type: 'alert',
      priority: 'high',
      title: 'Alert',
      message: 'Something happened',
    });
    const { notifications, unreadCount } = useNotificationStore.getState();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].title).toBe('Alert');
    expect(notifications[0].read).toBe(false);
    expect(notifications[0].isNew).toBe(true);
    expect(unreadCount).toBe(1);
  });

  it('prepends new notification to list', () => {
    useNotificationStore.getState().addNotification({
      type: 'general',
      priority: 'low',
      title: 'First',
      message: '',
    });
    useNotificationStore.getState().addNotification({
      type: 'general',
      priority: 'low',
      title: 'Second',
      message: '',
    });
    const { notifications } = useNotificationStore.getState();
    expect(notifications[0].title).toBe('Second');
  });
});

describe('setNotifications', () => {
  it('replaces all notifications and computes unreadCount', () => {
    const notifs = [
      {
        id: '1',
        title: 'A',
        message: '',
        type: 'general' as const,
        priority: 'low' as const,
        timestamp: 1,
        read: false,
        isNew: false,
      },
      {
        id: '2',
        title: 'B',
        message: '',
        type: 'general' as const,
        priority: 'low' as const,
        timestamp: 2,
        read: true,
        isNew: false,
      },
    ];
    useNotificationStore.getState().setNotifications(notifs);
    expect(useNotificationStore.getState().notifications).toHaveLength(2);
    expect(useNotificationStore.getState().unreadCount).toBe(1);
  });
});

describe('syncFromAPI', () => {
  it('transforms and stores API notifications', () => {
    const api = [makeAPINotification({ id: 'api-1', title: 'API Notif' })];
    useNotificationStore.getState().syncFromAPI(api, 1);
    const { notifications, unreadCount, lastFetchTime } =
      useNotificationStore.getState();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].id).toBe('api-1');
    expect(notifications[0].title).toBe('API Notif');
    expect(unreadCount).toBe(1);
    expect(lastFetchTime).not.toBeNull();
  });
});

describe('markAsRead', () => {
  it('marks a notification as read and decrements unreadCount', () => {
    useNotificationStore.setState({
      notifications: [
        {
          id: '1',
          title: 'N',
          message: '',
          type: 'general',
          priority: 'low',
          timestamp: 1,
          read: false,
          isNew: false,
        },
      ],
      unreadCount: 1,
      lastFetchTime: null,
    });
    useNotificationStore.getState().markAsRead('1');
    const { notifications, unreadCount } = useNotificationStore.getState();
    expect(notifications[0].read).toBe(true);
    expect(unreadCount).toBe(0);
  });

  it('ignores unknown id', () => {
    useNotificationStore.getState().markAsRead('unknown');
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });
});

describe('markAllAsRead', () => {
  it('marks all notifications as read and sets unreadCount to 0', () => {
    useNotificationStore.setState({
      notifications: [
        {
          id: '1',
          title: 'A',
          message: '',
          type: 'general',
          priority: 'low',
          timestamp: 1,
          read: false,
          isNew: false,
        },
        {
          id: '2',
          title: 'B',
          message: '',
          type: 'general',
          priority: 'low',
          timestamp: 2,
          read: false,
          isNew: false,
        },
      ],
      unreadCount: 2,
      lastFetchTime: null,
    });
    useNotificationStore.getState().markAllAsRead();
    const { notifications, unreadCount } = useNotificationStore.getState();
    expect(notifications.every(n => n.read)).toBe(true);
    expect(unreadCount).toBe(0);
  });
});

describe('deleteNotification', () => {
  it('removes the notification by id', () => {
    useNotificationStore.setState({
      notifications: [
        {
          id: '1',
          title: 'A',
          message: '',
          type: 'general',
          priority: 'low',
          timestamp: 1,
          read: false,
          isNew: false,
        },
        {
          id: '2',
          title: 'B',
          message: '',
          type: 'general',
          priority: 'low',
          timestamp: 2,
          read: true,
          isNew: false,
        },
      ],
      unreadCount: 1,
      lastFetchTime: null,
    });
    useNotificationStore.getState().deleteNotification('1');
    const { notifications, unreadCount } = useNotificationStore.getState();
    expect(notifications).toHaveLength(1);
    expect(notifications[0].id).toBe('2');
    expect(unreadCount).toBe(0);
  });
});

describe('clearAllNotifications', () => {
  it('empties all notifications and resets unreadCount', () => {
    useNotificationStore.setState({
      notifications: [
        {
          id: '1',
          title: 'A',
          message: '',
          type: 'general',
          priority: 'low',
          timestamp: 1,
          read: false,
          isNew: false,
        },
      ],
      unreadCount: 1,
      lastFetchTime: null,
    });
    useNotificationStore.getState().clearAllNotifications();
    expect(useNotificationStore.getState().notifications).toHaveLength(0);
    expect(useNotificationStore.getState().unreadCount).toBe(0);
  });
});

describe('markAsOld / markAllAsOld', () => {
  it('markAsOld sets isNew to false for specific id', () => {
    useNotificationStore.setState({
      notifications: [
        {
          id: '1',
          title: 'A',
          message: '',
          type: 'general',
          priority: 'low',
          timestamp: 1,
          read: false,
          isNew: true,
        },
      ],
      unreadCount: 1,
      lastFetchTime: null,
    });
    useNotificationStore.getState().markAsOld('1');
    expect(useNotificationStore.getState().notifications[0].isNew).toBe(false);
  });

  it('markAllAsOld sets isNew to false for all', () => {
    useNotificationStore.setState({
      notifications: [
        {
          id: '1',
          title: 'A',
          message: '',
          type: 'general',
          priority: 'low',
          timestamp: 1,
          read: false,
          isNew: true,
        },
        {
          id: '2',
          title: 'B',
          message: '',
          type: 'general',
          priority: 'low',
          timestamp: 2,
          read: false,
          isNew: true,
        },
      ],
      unreadCount: 2,
      lastFetchTime: null,
    });
    useNotificationStore.getState().markAllAsOld();
    expect(
      useNotificationStore.getState().notifications.every(n => !n.isNew),
    ).toBe(true);
  });
});
