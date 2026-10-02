/**
 * API Service Layer
 * Centralized HTTP client configuration with network-aware error handling
 */

import { API_BASE_URL, API_TIMEOUT } from '@env';

export interface Todo {
  id: number;
  userId: number;
  title: string;
  completed: boolean;
}

export interface User {
  id: number;
  name: string;
  username: string;
  email: string;
  phone: string;
  website: string;
}

export interface Post {
  id: number;
  userId: number;
  title: string;
  body: string;
}

// Use environment variables with fallback for demo endpoints
const BASE_URL = API_BASE_URL || 'http://localhost:4000/api/v1';
const TIMEOUT = parseInt(API_TIMEOUT || '30000', 10);

/**
 * Network-aware fetch with proper error handling
 */
const apiClient = async <T>(
  endpoint: string,
  options?: RequestInit,
): Promise<T> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      signal: controller.signal,
      ...options,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    clearTimeout(timeoutId);

    // Handle different error types
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new Error('Request timeout: Please check your connection');
      }
      if (error.message.includes('Network request failed')) {
        throw new Error('Network error: Please check your connection');
      }
    }
    throw error;
  }
};

/**
 * API Endpoints
 */
export const api = {
  // Todo endpoints
  getTodos: (): Promise<Todo[]> => apiClient('/todos'),
  getTodo: (id: number): Promise<Todo> => apiClient(`/todos/${id}`),
  createTodo: (todo: Omit<Todo, 'id'>): Promise<Todo> =>
    apiClient('/todos', {
      method: 'POST',
      body: JSON.stringify(todo),
    }),
  updateTodo: (id: number, todo: Partial<Todo>): Promise<Todo> =>
    apiClient(`/todos/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(todo),
    }),
  deleteTodo: (id: number): Promise<void> =>
    apiClient(`/todos/${id}`, { method: 'DELETE' }),

  // User endpoints
  getUsers: (): Promise<User[]> => apiClient('/users'),
  getUser: (id: number): Promise<User> => apiClient(`/users/${id}`),

  // Post endpoints
  getPosts: (): Promise<Post[]> => apiClient('/posts'),
  getPost: (id: number): Promise<Post> => apiClient(`/posts/${id}`),
  getPostsByUser: (userId: number): Promise<Post[]> =>
    apiClient(`/users/${userId}/posts`),
};
