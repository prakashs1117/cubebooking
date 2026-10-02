import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
  notificationKeys,
} from '@services/api/notifications.service';
import { useNotificationStore } from '@stores/notificationStore';
import type { NotificationsAPIResponse } from '@/types/notification';

// ── Empty fallback (returned while endpoint is 404 / offline) ─────────────────

const EMPTY_RESPONSE: NotificationsAPIResponse = {
  notifications: [],
  unreadCount: 0,
  pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
};

// ── Primary hook ──────────────────────────────────────────────────────────────

/**
 * Fetches notifications via React Query with background polling.
 *
 * Behaviour:
 * - Shows stale (cached / mock) data immediately while a background fetch runs.
 * - Silently swallows 404 so the UI stays clean while the endpoint is being built.
 * - Polls every 30 s when the component is mounted; pauses when unmounted.
 * - Syncs new API data into the Zustand store for offline/badge access.
 */
export const useNotifications = (options: {
  enabled?: boolean;
  pollingInterval?: number;
  page?: number;
  limit?: number;
  autoSync?: boolean;
} = {}) => {
  const {
    enabled = true,
    pollingInterval = 30_000,
    page = 1,
    limit = 20,
    autoSync = true,
  } = options;

  const syncFromAPI  = useNotificationStore(s => s.syncFromAPI);
  const localItems   = useNotificationStore(s => s.notifications);
  const localUnread  = useNotificationStore(s => s.unreadCount);

  const query = useQuery({
    queryKey: notificationKeys.list(page, limit),
    queryFn: async () => {
      try {
        return await getNotifications(page, limit);
      } catch (err: any) {
        // 404 means the endpoint isn't live yet — return empty gracefully.
        // Every other error propagates so React Query can retry/report it.
        if (err?.response?.status === 404 || err?.message?.includes('404')) {
          return EMPTY_RESPONSE;
        }
        throw err;
      }
    },
    enabled,
    // Stale-while-revalidate: show cached data instantly, fetch in background.
    staleTime: 25_000,
    // Background poll interval — only fires while a component is subscribed.
    refetchInterval: pollingInterval,
    // Keep polling when the app is backgrounded (but RN pauses JS anyway).
    refetchIntervalInBackground: false,
    // Refetch whenever the user comes back to this screen.
    refetchOnWindowFocus: true,
    // Retry genuine network errors up to 2 times; don't retry 404.
    retry: (count, err: any) => {
      if (err?.response?.status === 404) return false;
      return count < 2;
    },
    retryDelay: attempt => Math.min(1_000 * 2 ** attempt, 15_000),
    // Progressive reveal: placeholderData keeps previous page visible while
    // a background fetch is in flight — no flash of empty state.
    placeholderData: (prev) => prev,
  });

  // Sync fresh API data into the Zustand store (badge count, offline access).
  useEffect(() => {
    if (autoSync && query.data?.notifications && query.data.notifications.length > 0) {
      syncFromAPI(query.data.notifications, query.data.unreadCount);
    }
  }, [query.data, autoSync, syncFromAPI]);

  return {
    // API data (may be undefined on very first load before cache warms)
    notifications:   query.data?.notifications ?? [],
    unreadCount:     query.data?.unreadCount    ?? 0,
    pagination:      query.data?.pagination,

    // Local store — always available (seeded with mock data if store is empty)
    localNotifications: localItems,
    localUnreadCount:   localUnread,

    // Query state
    isLoading:      query.isLoading,
    isError:        query.isError,
    error:          query.error,
    isRefetching:   query.isRefetching,
    isFetching:     query.isFetching,
    dataUpdatedAt:  query.dataUpdatedAt,

    refetch: query.refetch,
  };
};

// ── Mutation hooks (mark read, delete, clear) ─────────────────────────────────

export const useMarkNotificationRead = () => {
  const qc = useQueryClient();
  const markAsRead = useNotificationStore(s => s.markAsRead);
  return useMutation({
    mutationFn: markNotificationAsRead,
    onMutate: (id) => { markAsRead(id); },  // optimistic local update
    onSettled: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
};

export const useMarkAllNotificationsRead = () => {
  const qc = useQueryClient();
  const markAllAsRead = useNotificationStore(s => s.markAllAsRead);
  return useMutation({
    mutationFn: markAllNotificationsAsRead,
    onMutate: () => { markAllAsRead(); },
    onSettled: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
};

export const useDeleteNotification = () => {
  const qc = useQueryClient();
  const deleteLocal = useNotificationStore(s => s.deleteNotification);
  return useMutation({
    mutationFn: deleteNotification,
    onMutate: (id) => { deleteLocal(id); },
    onSettled: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
};

export const useClearAllNotifications = () => {
  const qc = useQueryClient();
  const clearLocal = useNotificationStore(s => s.clearAllNotifications);
  return useMutation({
    mutationFn: clearAllNotifications,
    onMutate: () => { clearLocal(); },
    onSettled: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  });
};

// ── Local-only hook (offline / badge only, no API call) ───────────────────────

export const useLocalNotifications = () => {
  const store = useNotificationStore();
  return {
    notifications:        store.notifications,
    unreadCount:          store.unreadCount,
    markAsRead:           store.markAsRead,
    markAllAsRead:        store.markAllAsRead,
    deleteNotification:   store.deleteNotification,
    clearAllNotifications:store.clearAllNotifications,
    markAsOld:            store.markAsOld,
    markAllAsOld:         store.markAllAsOld,
  };
};

export default useNotifications;
