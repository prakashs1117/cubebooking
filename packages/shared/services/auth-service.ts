import type { ApiClient } from './_client';
import type { User, UserRole } from '../types';
import type { ApiUser, LoginResponse, MeResponse } from '../types/api';

const ROLE_MAP: Record<string, UserRole> = {
  super_admin: 'Super Admin',
  tenant_admin: 'Admin',
  dm_requestor: 'DM Requestor',
  dm_approver: 'DM Approver',
  dm_watcher: 'DM Watcher',
  employee: 'Employee',
  clinician: 'Employee',
  manager: 'DM Approver',
  viewer: 'Employee',
};

function mapApiRoles(apiRoles: string[]): UserRole[] {
  const mapped = apiRoles.map(r => ROLE_MAP[r] ?? 'Employee' as UserRole);
  return mapped.length ? mapped : ['Employee'];
}

function mapApiUser(apiUser: ApiUser): User {
  const rawRoles = apiUser.roles?.length ? apiUser.roles : [apiUser.role];
  return {
    id: apiUser.id,
    name: `${apiUser.firstName} ${apiUser.lastName}`.trim(),
    email: apiUser.email,
    roles: mapApiRoles(rawRoles),
    status: 'Active',
    lastLogin: new Date().toISOString().slice(0, 10),
  };
}

/**
 * Factory function for auth service
 * Accepts platform-agnostic ApiClient implementation
 */
export function createAuthService(client: ApiClient) {
  return {
    async register(
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      confirmPassword: string,
    ): Promise<{ user: User; accessToken: string }> {
      const res = await client.post<LoginResponse>('/auth/register', {
        firstName,
        lastName,
        email,
        password,
        confirmPassword,
      });
      if (!res.success) throw new Error(res.message);
      return {
        user: mapApiUser(res.data!.user),
        accessToken: res.data!.accessToken,
      };
    },

    async login(email: string, password: string): Promise<{ user: User; accessToken: string; refreshToken: string }> {
      const res = await client.post<LoginResponse>('/auth/login', { email, password });
      if (!res.success) throw new Error(res.message);
      return {
        user: mapApiUser(res.data!.user),
        accessToken: res.data!.accessToken,
        refreshToken: res.data!.refreshToken,
      };
    },

    // Returns a fresh accessToken from the server — required for SSO flow where
    // the backend sets a cookie and redirects; the client has no other way to
    // get the access token without calling /auth/me.
    async getMe(): Promise<{ user: User; accessToken: string }> {
      const res = await client.get<MeResponse>('/auth/me');
      return {
        user: mapApiUser(res.data!.user),
        accessToken: res.data!.accessToken,
      };
    },

    async logout(): Promise<void> {
      await client.post('/auth/logout');
    },

    async forgotPassword(email: string): Promise<void> {
      await client.post('/auth/forgot-password', { email });
    },
  };
}

export type AuthService = ReturnType<typeof createAuthService>;
