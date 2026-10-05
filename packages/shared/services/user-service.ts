import type { ApiClient } from './_client';
import type { User } from '../types';

/**
 * Factory function for user service
 * Accepts platform-agnostic ApiClient implementation
 */
export function createUserService(client: ApiClient) {
  return {
    async getAll(): Promise<User[]> {
      const res = await client.get<any>('/users');
      return res?.data?.users ?? res?.users ?? [];
    },

    async getById(id: string): Promise<User | undefined> {
      const res = await client.get<any>(`/users/${id}`);
      return res?.data?.user ?? res?.user;
    },

    async update(id: string, patch: Partial<User>): Promise<void> {
      await client.patch(`/users/${id}`, patch);
    },

    async create(u: Partial<User> & { password?: string }): Promise<void> {
      await client.post('/users', u);
    },
  };
}

export type UserService = ReturnType<typeof createUserService>;
