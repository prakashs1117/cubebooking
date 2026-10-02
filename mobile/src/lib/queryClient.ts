import { QueryClient } from '@tanstack/react-query';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

/**
 * TanStack React Query configuration for TodoApp
 * Integrated with network detection for optimal caching and retry behavior
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Stale time - how long data is considered fresh
      staleTime: 1000 * 60 * 5, // 5 minutes

      // Cache time - how long inactive data stays in cache
      gcTime: 1000 * 60 * 30, // 30 minutes (formerly cacheTime)

      // Network mode - pause queries when offline
      networkMode: 'online',

      // Retry configuration with network awareness
      retry: (failureCount, _error) => {
        // Retry up to 3 times for network errors
        if (failureCount < 3) return true;

        return false;
      },

      // Retry delay with exponential backoff
      retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),

      // Refetch on window focus (useful for web, but works in RN too)
      refetchOnWindowFocus: false,

      // Refetch when coming back online
      refetchOnReconnect: true,
    },
    mutations: {
      // Network mode for mutations
      networkMode: 'online',

      // Retry mutations once
      retry: 1,
    },
  },
});

/**
 * Network-aware query client setup
 * Automatically pauses/resumes queries based on network status
 */
export const setupNetworkAwareQueries = () => {
  // Listen to network changes
  const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
    const isOnline = state.isConnected && state.isInternetReachable;

    if (isOnline) {
      // Resume queries when coming back online
      queryClient.resumePausedMutations();
      queryClient.invalidateQueries();
    } else {
      // Pause queries when going offline
      queryClient
        .getQueryCache()
        .getAll()
        .forEach(query => {
          query.cancel();
        });
    }
  });

  return unsubscribe;
};

/**
 * Utility function to check if we're online
 */
export const isOnline = async (): Promise<boolean> => {
  const netInfo = await NetInfo.fetch();
  return Boolean(netInfo.isConnected && netInfo.isInternetReachable);
};
