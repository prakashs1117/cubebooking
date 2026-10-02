/**
 * API Service Tests
 * Tests for the API service layer with network-aware error handling
 */

import { api, Todo, User, Post } from '@services/api';

// Mock fetch globally
const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>;

describe('API Service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('apiClient', () => {
    const mockTodo: Todo = {
      id: 1,
      userId: 1,
      title: 'Test Todo',
      completed: false,
    };

    it('makes successful GET request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodo,
      } as Response);

      const result = await api.getTodo(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/todos/1',
        expect.objectContaining({
          headers: { 'Content-Type': 'application/json' },
        }),
      );
      expect(result).toEqual(mockTodo);
    });

    it('makes successful POST request', async () => {
      const newTodo = { userId: 1, title: 'New Todo', completed: false };
      const createdTodo = { ...newTodo, id: 201 };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => createdTodo,
      } as Response);

      const result = await api.createTodo(newTodo);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/todos',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newTodo),
        }),
      );
      expect(result).toEqual(createdTodo);
    });

    it('makes successful PATCH request', async () => {
      const updateData = { completed: true };
      const updatedTodo = { ...mockTodo, ...updateData };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTodo,
      } as Response);

      const result = await api.updateTodo(1, updateData);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/todos/1',
        expect.objectContaining({
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        }),
      );
      expect(result).toEqual(updatedTodo);
    });

    it('makes successful DELETE request', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({}),
      } as Response);

      await api.deleteTodo(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/todos/1',
        expect.objectContaining({
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
        }),
      );
    });

    it('handles HTTP error responses', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      } as Response);

      await expect(api.getTodo(999)).rejects.toThrow(
        'API Error: 404 Not Found',
      );
    });

    it('handles network errors', async () => {
      mockFetch.mockRejectedValueOnce(new TypeError('Network request failed'));

      await expect(api.getTodos()).rejects.toThrow(
        'Network error: Please check your connection',
      );
    });

    it('handles JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => {
          throw new SyntaxError('Unexpected token');
        },
      } as Response);

      await expect(api.getTodos()).rejects.toThrow('Unexpected token');
    });
  });

  describe('Todo Endpoints', () => {
    it('getTodos calls correct endpoint', async () => {
      const mockTodos: Todo[] = [
        { id: 1, userId: 1, title: 'Todo 1', completed: false },
        { id: 2, userId: 1, title: 'Todo 2', completed: true },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodos,
      } as Response);

      const result = await api.getTodos();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/todos',
        expect.any(Object),
      );
      expect(result).toEqual(mockTodos);
    });

    it('getTodo calls correct endpoint with ID', async () => {
      const mockTodo: Todo = {
        id: 1,
        userId: 1,
        title: 'Test Todo',
        completed: false,
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockTodo,
      } as Response);

      const result = await api.getTodo(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/todos/1',
        expect.any(Object),
      );
      expect(result).toEqual(mockTodo);
    });
  });

  describe('User Endpoints', () => {
    it('getUsers calls correct endpoint', async () => {
      const mockUsers: User[] = [
        {
          id: 1,
          name: 'John Doe',
          username: 'johndoe',
          email: 'john@example.com',
          phone: '123-456-7890',
          website: 'johndoe.com',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      } as Response);

      const result = await api.getUsers();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/users',
        expect.any(Object),
      );
      expect(result).toEqual(mockUsers);
    });

    it('getUser calls correct endpoint with ID', async () => {
      const mockUser: User = {
        id: 1,
        name: 'John Doe',
        username: 'johndoe',
        email: 'john@example.com',
        phone: '123-456-7890',
        website: 'johndoe.com',
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUser,
      } as Response);

      const result = await api.getUser(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/users/1',
        expect.any(Object),
      );
      expect(result).toEqual(mockUser);
    });
  });

  describe('Post Endpoints', () => {
    it('getPosts calls correct endpoint', async () => {
      const mockPosts: Post[] = [
        {
          id: 1,
          userId: 1,
          title: 'Post Title',
          body: 'Post body content',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      } as Response);

      const result = await api.getPosts();

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/posts',
        expect.any(Object),
      );
      expect(result).toEqual(mockPosts);
    });

    it('getPostsByUser calls correct endpoint with user ID', async () => {
      const mockPosts: Post[] = [
        {
          id: 1,
          userId: 1,
          title: 'User Post',
          body: 'Post by specific user',
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockPosts,
      } as Response);

      const result = await api.getPostsByUser(1);

      expect(mockFetch).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/users/1/posts',
        expect.any(Object),
      );
      expect(result).toEqual(mockPosts);
    });
  });

  describe('Error Handling Edge Cases', () => {
    it('handles empty response', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => null,
      } as Response);

      const result = await api.getTodos();
      expect(result).toBeNull();
    });

    it('handles server error (500)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
      } as Response);

      await expect(api.getTodos()).rejects.toThrow(
        'API Error: 500 Internal Server Error',
      );
    });

    it('handles timeout/abort errors', async () => {
      mockFetch.mockRejectedValueOnce(
        new DOMException('Aborted', 'AbortError'),
      );

      await expect(api.getTodos()).rejects.toThrow('Aborted');
    });
  });
});
