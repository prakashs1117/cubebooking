/**
 * useNotificationMutations Hook
 * Handles notification actions with optimistic updates and backend sync
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification as deleteNotificationAPI,
  clearAllNotifications as clearAllNotificationsAPI,
  notificationKeys,
} from '@services/api/notifications.service';
import { useNotificationStore } from '@stores/notificationStore';

/**
 * Hook for notification mutations with optimistic updates
 */
export const useNotificationMutations = () => {
  const queryClient = useQueryClient();

  // Get store actions
  const markAsReadStore = useNotificationStore(state => state.markAsRead);
  const markAllAsReadStore = useNotificationStore(state => state.markAllAsRead);
  const deleteNotificationStore = useNotificationStore(
    state => state.deleteNotification,
  );
  const clearAllNotificationsStore = useNotificationStore(
    state => state.clearAllNotifications,
  );

  /**
   * Mark notification as read
   * Updates UI immediately, then syncs with backend
   */
  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      // Optimistically update local store first
      markAsReadStore(notificationId);
      // Then sync with backend
      return await markNotificationAsRead(notificationId);
    },
    onSuccess: () => {
      // Invalidate and refetch notifications to get fresh data
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error, _notificationId) => {
      console.error('Failed to mark notification as read:', error);
      // Note: We've already updated the store, so the UI looks correct
      // The next poll will restore the correct state if the API call failed
    },
  });

  /**
   * Mark all notifications as read
   * Updates UI immediately, then syncs with backend
   */
  const markAllAsRead = useMutation({
    mutationFn: async () => {
      // Optimistically update local store first
      markAllAsReadStore();
      // Then sync with backend
      return await markAllNotificationsAsRead();
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: error => {
      console.error('Failed to mark all notifications as read:', error);
    },
  });

  /**
   * Delete notification
   * Updates UI immediately, then syncs with backend
   */
  const deleteNotification = useMutation({
    mutationFn: async (notificationId: string) => {
      // Optimistically update local store first
      deleteNotificationStore(notificationId);
      // Then sync with backend
      return await deleteNotificationAPI(notificationId);
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: (error, _notificationId) => {
      console.error('Failed to delete notification:', error);
      // The next poll will restore the notification if the API call failed
    },
  });

  /**
   * Clear all notifications
   * Updates UI immediately, then syncs with backend
   */
  const clearAllNotifications = useMutation({
    mutationFn: async () => {
      // Optimistically update local store first
      clearAllNotificationsStore();
      // Then sync with backend
      return await clearAllNotificationsAPI();
    },
    onSuccess: () => {
      // Invalidate and refetch notifications
      queryClient.invalidateQueries({ queryKey: notificationKeys.all });
    },
    onError: error => {
      console.error('Failed to clear all notifications:', error);
    },
  });

  return {
    markAsRead: (notificationId: string) => markAsRead.mutate(notificationId),
    markAllAsRead: () => markAllAsRead.mutate(),
    deleteNotification: (notificationId: string) =>
      deleteNotification.mutate(notificationId),
    clearAllNotifications: () => clearAllNotifications.mutate(),

    // Mutation states (for loading indicators if needed)
    isMarkingAsRead: markAsRead.isPending,
    isMarkingAllAsRead: markAllAsRead.isPending,
    isDeleting: deleteNotification.isPending,
    isClearing: clearAllNotifications.isPending,
  };
};

export default useNotificationMutations;
