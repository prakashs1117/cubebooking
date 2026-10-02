import { Platform } from 'react-native';
import apiClient from '@services/api/client';
import { ENDPOINTS } from '@services/api/endpoints';
import type { NotificationsAPIResponse } from '@/types/notification';

// ── Query keys ─────────────────────────────────────────────────────────────────

export const notificationKeys = {
  all:         ['notifications'] as const,
  list:        (page: number, limit: number) => [...notificationKeys.all, 'list', page, limit] as const,
  unreadCount: () => [...notificationKeys.all, 'unreadCount'] as const,
};

// ── API calls — all use the shared apiClient (auth + logging built in) ─────────

export const getNotifications = async (
  page = 1,
  limit = 20,
): Promise<NotificationsAPIResponse> => {
  const res = await apiClient.get<NotificationsAPIResponse>(
    ENDPOINTS.NOTIFICATIONS.LIST(page, limit),
  );
  return res.data;
};

export const markNotificationAsRead = async (
  notificationId: string,
): Promise<{ success: boolean }> => {
  const res = await apiClient.put<{ success: boolean }>(
    `/notifications/${notificationId}/read`,
  );
  return res.data;
};

export const markAllNotificationsAsRead = async (): Promise<{
  success: boolean;
  count: number;
}> => {
  const res = await apiClient.put<{ success: boolean; count: number }>(
    '/notifications/mark-all-read',
  );
  return res.data;
};

export const deleteNotification = async (
  notificationId: string,
): Promise<{ success: boolean }> => {
  const res = await apiClient.delete<{ success: boolean }>(
    `/notifications/${notificationId}`,
  );
  return res.data;
};

export const clearAllNotifications = async (): Promise<{
  success: boolean;
  count: number;
}> => {
  const res = await apiClient.delete<{ success: boolean; count: number }>(
    '/notifications/clear-all',
  );
  return res.data;
};

export const getUnreadCount = async (): Promise<{ unreadCount: number }> => {
  const res = await apiClient.get<{ unreadCount: number }>(
    '/notifications/unread-count',
  );
  return res.data;
};

export const registerFCMToken = async (
  token: string,
): Promise<{ success: boolean }> => {
  const res = await apiClient.post<{ success: boolean }>(
    '/notifications/fcm-token',
    { token, platform: Platform.OS },
  );
  return res.data;
};

export default {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  getUnreadCount,
  registerFCMToken,
};
