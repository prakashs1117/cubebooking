/**
 * User Service
 * Handles user profile-related API calls
 */

import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { UserProfile, UserProfileResponse } from '@/types/user.types';
import { User } from '@/types/auth.types';

export interface DeleteAccountPayload {
  userId: string;
  email: string;
  name: string | null;
  position: string | null;
}

export const userService = {
  getProfile: async (): Promise<UserProfileResponse> => {
    const { data } = await apiClient.get<UserProfileResponse>(
      ENDPOINTS.USER.PROFILE,
    );
    return data;
  },

  updateProfile: async (
    profileData: Partial<UserProfile>,
  ): Promise<UserProfileResponse> => {
    const { data } = await apiClient.put<UserProfileResponse>(
      ENDPOINTS.USER.PROFILE,
      profileData,
    );
    return data;
  },

  deleteAccount: async (user: User): Promise<void> => {
    const payload: DeleteAccountPayload = {
      userId: user.id,
      email: user.email,
      name: user.name || null,
      position: user.position || null,
    };
    await apiClient.request<void>({
      method: 'delete',
      url: ENDPOINTS.USER.DELETE,
      data: payload,
    });
  },
};

export default userService;
