export type ApiRole = 'viewer' | 'employee' | 'clinician' | 'manager' | 'tenant_admin' | 'super_admin' | 'dm_requestor' | 'dm_approver' | 'dm_watcher';

export interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: ApiRole;
  roles: string[];
  tenantId?: string;
  isEmailVerified?: boolean;
}

export interface ApiResponse<T = undefined> {
  success: boolean;
  message: string;
  data?: T;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  data: {
    user: ApiUser;
    accessToken: string;
    refreshToken: string;
  };
}

export interface MeResponse {
  success: boolean;
  data: {
    user: ApiUser;
    accessToken: string;
  };
}

export interface RefreshResponse {
  success: boolean;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}
