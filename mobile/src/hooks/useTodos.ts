/**
 * Todo-related React Query hooks
 * Demonstrates network-aware data fetching, caching, and mutations
 */

import React from 'react';
import {
  useQuery,
  useMutation,
  useQueryClient,
  UseQueryOptions,
  UseMutationOptions,
} from '@tanstack/react-query';
import { api, Todo } from '@services/api';
import { isOnline } from '@lib/queryClient';

/**
 * Query Keys for consistent cache management
 */
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
};

/**
 * Hook to fetch all todos
 */
export const useTodos = (
  options?: Omit<UseQueryOptions<Todo[]>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: todoKeys.lists(),
    queryFn: api.getTodos,
    staleTime: 1000 * 60 * 5, // 5 minutes
    ...options,
  });
};

/**
 * Hook to fetch a specific todo by ID
 */
export const useTodo = (
  id: number,
  options?: Omit<UseQueryOptions<Todo>, 'queryKey' | 'queryFn'>,
) => {
  return useQuery({
    queryKey: todoKeys.detail(id),
    queryFn: () => api.getTodo(id),
    enabled: !!id && id > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes for individual todos
    ...options,
  });
};

/**
 * Hook to create a new todo
 */
export const useCreateTodo = (
  options?: UseMutationOptions<Todo, Error, Omit<Todo, 'id'>>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.createTodo,
    onSuccess: newTodo => {
      // Update the todos list cache
      queryClient.setQueryData<Todo[]>(todoKeys.lists(), oldTodos => {
        return oldTodos ? [...oldTodos, newTodo] : [newTodo];
      });

      // Invalidate and refetch todos list
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
    // Only try to create todos when online
    networkMode: 'online',
    ...options,
  });
};

/**
 * Hook to update an existing todo
 */
export const useUpdateTodo = (
  options?: UseMutationOptions<
    Todo,
    Error,
    { id: number; data: Partial<Todo> }
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => api.updateTodo(id, data),
    onMutate: async ({ id, data }) => {
      // Cancel outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: todoKeys.detail(id) });

      // Snapshot the previous value
      const previousTodo = queryClient.getQueryData<Todo>(todoKeys.detail(id));

      // Optimistically update to the new value
      if (previousTodo) {
        queryClient.setQueryData<Todo>(todoKeys.detail(id), {
          ...previousTodo,
          ...data,
        });
      }

      // Return a context with the previous and new todo
      return { previousTodo, newTodo: { ...previousTodo, ...data } };
    },
    onError: (err, { id }, context) => {
      // Rollback on error
      if (context?.previousTodo) {
        queryClient.setQueryData(todoKeys.detail(id), context.previousTodo);
      }
    },
    onSettled: (data, error, { id }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: todoKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
    networkMode: 'online',
    ...options,
  });
};

/**
 * Hook to delete a todo
 */
export const useDeleteTodo = (
  options?: UseMutationOptions<void, Error, number>,
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: api.deleteTodo,
    onMutate: async todoId => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: todoKeys.lists() });
      await queryClient.cancelQueries({ queryKey: todoKeys.detail(todoId) });

      // Snapshot the previous values
      const previousTodos = queryClient.getQueryData<Todo[]>(todoKeys.lists());
      const previousTodo = queryClient.getQueryData<Todo>(
        todoKeys.detail(todoId),
      );

      // Optimistically remove from the list
      if (previousTodos) {
        queryClient.setQueryData<Todo[]>(
          todoKeys.lists(),
          previousTodos.filter(todo => todo.id !== todoId),
        );
      }

      // Remove the individual todo from cache
      queryClient.removeQueries({ queryKey: todoKeys.detail(todoId) });

      return { previousTodos, previousTodo };
    },
    onError: (err, todoId, context) => {
      // Rollback on error
      if (context?.previousTodos) {
        queryClient.setQueryData(todoKeys.lists(), context.previousTodos);
      }
      if (context?.previousTodo) {
        queryClient.setQueryData(todoKeys.detail(todoId), context.previousTodo);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: todoKeys.lists() });
    },
    networkMode: 'online',
    ...options,
  });
};

/**
 * Hook to toggle todo completion status
 */
export const useToggleTodo = (
  options?: UseMutationOptions<Todo, Error, { id: number; completed: boolean }>,
) => {
  return useMutation({
    mutationFn: ({ id, completed }) => api.updateTodo(id, { completed }),
    ...options,
  });
};

/**
 * Custom hook to check if we can perform mutations
 */
export const useCanMutate = () => {
  const [canMutate, setCanMutate] = React.useState(true);

  React.useEffect(() => {
    const checkConnection = async () => {
      const online = await isOnline();
      setCanMutate(online);
    };

    checkConnection();

    // Check every 30 seconds
    const interval = setInterval(checkConnection, 30000);

    return () => clearInterval(interval);
  }, []);

  return canMutate;
};
