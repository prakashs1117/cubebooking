# TanStack React Query Integration

This document explains how TanStack React Query has been integrated into the TodoApp with network-aware features.

## Overview

TanStack React Query provides powerful data-fetching, caching, and state synchronization capabilities. This integration includes:

- **Network-aware queries** that automatically pause when offline
- **Optimistic updates** for better user experience
- **Background synchronization** when connection is restored
- **Intelligent caching** with stale-while-revalidate strategy
- **Error handling** with automatic retries

## Key Components

### 1. Query Client Configuration (`src/lib/queryClient.ts`)

- **Stale Time**: 5 minutes for lists, 10 minutes for individual items
- **Cache Time**: 30 minutes for inactive data
- **Network Mode**: Queries pause when offline
- **Retry Logic**: Up to 3 attempts with exponential backoff
- **Network Listener**: Automatically resumes queries when back online

### 2. API Service (`src/services/api.ts`)

Centralized HTTP client with:

- JSONPlaceholder API integration for demos
- Network-aware error handling
- TypeScript interfaces for data models
- RESTful endpoints (GET, POST, PATCH, DELETE)

### 3. Custom Hooks (`src/hooks/useTodos.ts`)

**Query Hooks:**

- `useTodos()` - Fetch all todos with caching
- `useTodo(id)` - Fetch individual todo by ID

**Mutation Hooks:**

- `useCreateTodo()` - Create new todo with cache updates
- `useUpdateTodo()` - Update todo with optimistic updates
- `useDeleteTodo()` - Delete todo with optimistic removal
- `useToggleTodo()` - Toggle completion status

**Utility Hooks:**

- `useCanMutate()` - Check if mutations are allowed (online status)

### 4. Example Component (`src/components/examples/TodoListExample.tsx`)

Demonstrates:

- Data fetching with loading states
- Error handling with retry functionality
- Optimistic updates for better UX
- Network status indicators
- Pull-to-refresh functionality
- Form handling with mutations

## Query Keys Strategy

Hierarchical query keys for efficient cache management:

```typescript
export const todoKeys = {
  all: ['todos'] as const,
  lists: () => [...todoKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) =>
    [...todoKeys.lists(), filters] as const,
  details: () => [...todoKeys.all, 'detail'] as const,
  detail: (id: number) => [...todoKeys.details(), id] as const,
};
```

## Network Integration

### Automatic Pause/Resume

- Queries automatically pause when network is unavailable
- Mutations are blocked while offline
- Automatic resumption and cache invalidation when back online

### Optimistic Updates

- Immediate UI updates for better perceived performance
- Automatic rollback on errors
- Background synchronization when successful

### Error Handling

- Network-specific error messages
- Automatic retry with exponential backoff
- User-friendly error states with retry buttons

## Best Practices Implemented

1. **Query Key Management**: Consistent, hierarchical keys for efficient cache invalidation
2. **Optimistic Updates**: Immediate UI feedback with error rollback
3. **Network Awareness**: Respect offline state and provide appropriate feedback
4. **Error Boundaries**: Graceful error handling with recovery options
5. **Loading States**: Appropriate loading indicators for different states
6. **Cache Management**: Intelligent invalidation and background updates

## Usage Examples

### Basic Data Fetching

```typescript
const { data: todos, isLoading, error } = useTodos();
```

### Creating with Optimistic Updates

```typescript
const createTodo = useCreateTodo({
  onSuccess: () => {
    // Handle success
  },
  onError: error => {
    // Handle error
  },
});

// Usage
createTodo.mutate({
  title: 'New Todo',
  completed: false,
  userId: 1,
});
```

### Network-Aware Operations

```typescript
const canMutate = useCanMutate();

if (!canMutate) {
  // Show offline message
  return;
}

// Proceed with mutation
updateTodo.mutate({ id: 1, data: { completed: true } });
```

## Integration with Existing Features

### Theme System

- All query-related components use the theme system
- Loading states and error messages respect current theme
- Network status indicators follow theme colors

### Internationalization

- Error messages and UI text are localized
- Network status messages available in English, French, and Arabic
- RTL support for Arabic language

### Network Context

- Seamless integration with existing NetworkContext
- Shared network status between React Query and app components
- Consistent offline behavior across the application

## Benefits

1. **Better Performance**: Intelligent caching reduces unnecessary network requests
2. **Improved UX**: Optimistic updates and background sync provide smooth experience
3. **Network Resilience**: Graceful handling of offline scenarios
4. **Developer Experience**: Type-safe APIs with excellent debugging tools
5. **Scalability**: Easy to add new endpoints and maintain consistent patterns

## Future Enhancements

- **Infinite Queries**: For paginated data
- **Suspense Integration**: When React Native supports Suspense
- **Offline Storage**: Integration with AsyncStorage for offline-first approach
- **Real-time Updates**: WebSocket integration with React Query
- **Advanced Caching**: Custom cache strategies for different data types
