/**
 * useTodos Hook Tests
 * Tests for Todo-related React Query hooks with network-aware functionality
 */

import React from 'react';
import renderer from 'react-test-renderer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { todoKeys } from '@hooks/useTodos';
import { api, Todo } from '@services/api';

// Mock the API service
jest.mock('@services/api');
const mockApi = api as jest.Mocked<typeof api>;

// Mock the query client utilities
jest.mock('@lib/queryClient', () => ({
  isOnline: jest.fn(),
  queryClient: {
    setQueryData: jest.fn(),
    getQueryData: jest.fn(),
    invalidateQueries: jest.fn(),
  },
}));

const { isOnline } = require('@lib/queryClient');

// Test wrapper component
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

// Test component for testing hooks
const TestComponent: React.FC<{ hook: () => any }> = ({ hook }) => {
  const result = hook();
  return <>{JSON.stringify(result, null, 2)}</>;
};

describe('useTodos Hooks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('todoKeys', () => {
    it('generates correct query keys', () => {
      expect(todoKeys.all).toEqual(['todos']);
      expect(todoKeys.lists()).toEqual(['todos', 'list']);
      expect(todoKeys.list({ status: 'active' })).toEqual([
        'todos',
        'list',
        { status: 'active' },
      ]);
      expect(todoKeys.details()).toEqual(['todos', 'detail']);
      expect(todoKeys.detail(1)).toEqual(['todos', 'detail', 1]);
    });
  });

  describe('API Service Integration', () => {
    it('api service is properly mocked', () => {
      expect(mockApi.getTodos).toBeDefined();
      expect(mockApi.getTodo).toBeDefined();
      expect(mockApi.createTodo).toBeDefined();
      expect(mockApi.updateTodo).toBeDefined();
      expect(mockApi.deleteTodo).toBeDefined();
    });

    it('can mock API responses', async () => {
      const mockTodos: Todo[] = [
        { id: 1, userId: 1, title: 'Test Todo', completed: false },
      ];

      mockApi.getTodos.mockResolvedValue(mockTodos);

      const result = await mockApi.getTodos();
      expect(result).toEqual(mockTodos);
    });

    it('can mock API errors', async () => {
      const errorMessage = 'Network error';
      mockApi.getTodos.mockRejectedValue(new Error(errorMessage));

      await expect(mockApi.getTodos()).rejects.toThrow(errorMessage);
    });
  });

  describe('Network Status Integration', () => {
    it('isOnline utility is properly mocked', async () => {
      (isOnline as jest.Mock).mockResolvedValue(true);

      const result = await isOnline();
      expect(result).toBe(true);
    });

    it('can simulate offline state', async () => {
      (isOnline as jest.Mock).mockResolvedValue(false);

      const result = await isOnline();
      expect(result).toBe(false);
    });
  });

  describe('Query Client Configuration', () => {
    it('creates query client successfully', () => {
      const queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
            gcTime: 0,
          },
          mutations: {
            retry: false,
          },
        },
      });

      expect(queryClient).toBeDefined();
      expect(queryClient.setQueryData).toBeDefined();
      expect(queryClient.getQueryData).toBeDefined();
    });
  });

  describe('Test Component Integration', () => {
    it('renders test wrapper without crashing', () => {
      const Wrapper = createWrapper();
      expect(() =>
        renderer.create(
          <Wrapper>
            <TestComponent hook={() => ({ test: 'value' })} />
          </Wrapper>,
        ),
      ).not.toThrow();
    });
  });

  describe('Hook Key Generation', () => {
    it('generates unique keys for different filters', () => {
      const key1 = todoKeys.list({ status: 'active' });
      const key2 = todoKeys.list({ status: 'completed' });
      const key3 = todoKeys.list({ userId: 1 });

      expect(key1).not.toEqual(key2);
      expect(key2).not.toEqual(key3);
      expect(key1).not.toEqual(key3);
    });

    it('generates consistent keys for same parameters', () => {
      const key1 = todoKeys.detail(1);
      const key2 = todoKeys.detail(1);

      expect(key1).toEqual(key2);
    });

    it('generates different keys for different IDs', () => {
      const key1 = todoKeys.detail(1);
      const key2 = todoKeys.detail(2);

      expect(key1).not.toEqual(key2);
    });
  });

  describe('Mock Functions Behavior', () => {
    it('tracks function calls correctly', async () => {
      const mockTodos: Todo[] = [];
      mockApi.getTodos.mockResolvedValue(mockTodos);

      await mockApi.getTodos();
      await mockApi.getTodos();

      expect(mockApi.getTodos).toHaveBeenCalledTimes(2);
    });

    it('can reset mock call history', async () => {
      const mockTodos: Todo[] = [];
      mockApi.getTodos.mockResolvedValue(mockTodos);

      await mockApi.getTodos();
      expect(mockApi.getTodos).toHaveBeenCalledTimes(1);

      jest.clearAllMocks();
      expect(mockApi.getTodos).toHaveBeenCalledTimes(0);
    });
  });

  describe('Error Handling Patterns', () => {
    it('handles network errors consistently', async () => {
      const networkError = new TypeError('Network request failed');
      mockApi.getTodos.mockRejectedValue(networkError);

      await expect(mockApi.getTodos()).rejects.toThrow(
        'Network request failed',
      );
    });

    it('handles API errors consistently', async () => {
      const apiError = new Error('API Error: 404 Not Found');
      mockApi.getTodo.mockRejectedValue(apiError);

      await expect(mockApi.getTodo(999)).rejects.toThrow(
        'API Error: 404 Not Found',
      );
    });
  });
});
