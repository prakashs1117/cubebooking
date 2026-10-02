/**
 * Query Client Tests
 * Tests for network-aware query client configuration and utilities
 */

import {
  queryClient,
  setupNetworkAwareQueries,
  isOnline,
} from '@lib/queryClient';
import NetInfo from '@react-native-community/netinfo';

// Mock NetInfo
jest.mock('@react-native-community/netinfo');
const mockNetInfo = NetInfo as jest.Mocked<typeof NetInfo>;

describe('Query Client Configuration', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('queryClient', () => {
    it('is properly instantiated', () => {
      expect(queryClient).toBeDefined();
      expect(queryClient.getQueryCache).toBeDefined();
      expect(queryClient.setQueryData).toBeDefined();
      expect(queryClient.getQueryData).toBeDefined();
      expect(queryClient.invalidateQueries).toBeDefined();
    });

    it('has basic query functionality', () => {
      // Test that query client methods exist and are callable
      expect(() =>
        queryClient.setQueryData(['test'], 'test data'),
      ).not.toThrow();
      expect(() => queryClient.getQueryData(['test'])).not.toThrow();
      expect(() => queryClient.invalidateQueries()).not.toThrow();
    });
  });

  describe('setupNetworkAwareQueries', () => {
    it('sets up network listener correctly', () => {
      const mockUnsubscribe = jest.fn();

      mockNetInfo.addEventListener.mockReturnValue(mockUnsubscribe);

      const unsubscribe = setupNetworkAwareQueries();

      expect(mockNetInfo.addEventListener).toHaveBeenCalledWith(
        expect.any(Function),
      );
      expect(typeof unsubscribe).toBe('function');

      // Call the unsubscribe function
      unsubscribe();
      expect(mockUnsubscribe).toHaveBeenCalled();
    });

    it('resumes queries when coming online', () => {
      const mockUnsubscribe = jest.fn();
      let networkListener: Function;

      mockNetInfo.addEventListener.mockImplementation(listener => {
        networkListener = listener;
        return mockUnsubscribe;
      });

      // Spy on queryClient methods
      const resumeSpy = jest.spyOn(queryClient, 'resumePausedMutations');
      const invalidateSpy = jest.spyOn(queryClient, 'invalidateQueries');

      setupNetworkAwareQueries();

      // Simulate coming online
      networkListener({
        isConnected: true,
        isInternetReachable: true,
      });

      expect(resumeSpy).toHaveBeenCalled();
      expect(invalidateSpy).toHaveBeenCalled();

      resumeSpy.mockRestore();
      invalidateSpy.mockRestore();
    });

    it('cancels queries when going offline', () => {
      const mockUnsubscribe = jest.fn();
      let networkListener: Function;

      mockNetInfo.addEventListener.mockImplementation(listener => {
        networkListener = listener;
        return mockUnsubscribe;
      });

      const mockQuery = {
        cancel: jest.fn(),
      };

      const getQueryCacheSpy = jest
        .spyOn(queryClient, 'getQueryCache')
        .mockReturnValue({
          getAll: jest.fn(() => [mockQuery]),
        } as any);

      setupNetworkAwareQueries();

      // Simulate going offline
      networkListener({
        isConnected: false,
        isInternetReachable: false,
      });

      expect(mockQuery.cancel).toHaveBeenCalled();

      getQueryCacheSpy.mockRestore();
    });

    it('handles partial connectivity states', () => {
      const mockUnsubscribe = jest.fn();
      let networkListener: Function;

      mockNetInfo.addEventListener.mockImplementation(listener => {
        networkListener = listener;
        return mockUnsubscribe;
      });

      const mockQuery = {
        cancel: jest.fn(),
      };

      const getQueryCacheSpy = jest
        .spyOn(queryClient, 'getQueryCache')
        .mockReturnValue({
          getAll: jest.fn(() => [mockQuery]),
        } as any);

      setupNetworkAwareQueries();

      // Simulate connected but no internet
      networkListener({
        isConnected: true,
        isInternetReachable: false,
      });

      expect(mockQuery.cancel).toHaveBeenCalled();

      // Simulate not connected but internet reachable (shouldn't happen but test edge case)
      mockQuery.cancel.mockClear();
      networkListener({
        isConnected: false,
        isInternetReachable: true,
      });

      expect(mockQuery.cancel).toHaveBeenCalled();

      getQueryCacheSpy.mockRestore();
    });
  });

  describe('isOnline', () => {
    it('returns true when connected and internet reachable', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: {},
      } as any);

      const result = await isOnline();

      expect(result).toBe(true);
      expect(mockNetInfo.fetch).toHaveBeenCalled();
    });

    it('returns false when not connected', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: {},
      } as any);

      const result = await isOnline();

      expect(result).toBe(false);
    });

    it('returns false when connected but no internet', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: false,
        type: 'wifi',
        details: {},
      } as any);

      const result = await isOnline();

      expect(result).toBe(false);
    });

    it('returns false when internet reachable but not connected', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: true,
        type: 'none',
        details: {},
      } as any);

      const result = await isOnline();

      expect(result).toBe(false);
    });

    it('handles null values gracefully', async () => {
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: null,
        isInternetReachable: null,
        type: 'unknown',
        details: {},
      } as any);

      const result = await isOnline();

      expect(result).toBe(false);
    });

    it('throws when NetInfo fetch fails', async () => {
      mockNetInfo.fetch.mockRejectedValue(new Error('Network info failed'));

      // Should throw the NetInfo error
      await expect(isOnline()).rejects.toThrow('Network info failed');
    });
  });

  describe('Integration Tests', () => {
    it('works with real network state changes', async () => {
      const mockUnsubscribe = jest.fn();

      mockNetInfo.addEventListener.mockImplementation(() => {
        return mockUnsubscribe;
      });

      mockNetInfo.fetch.mockResolvedValue({
        isConnected: true,
        isInternetReachable: true,
        type: 'wifi',
        details: {},
      } as any);

      // Setup network awareness
      const unsubscribe = setupNetworkAwareQueries();

      // Check initial online status
      const initialStatus = await isOnline();
      expect(initialStatus).toBe(true);

      // Simulate network change to offline
      mockNetInfo.fetch.mockResolvedValue({
        isConnected: false,
        isInternetReachable: false,
        type: 'none',
        details: {},
      } as any);

      const offlineStatus = await isOnline();
      expect(offlineStatus).toBe(false);

      // Cleanup
      unsubscribe();
    });
  });
});
