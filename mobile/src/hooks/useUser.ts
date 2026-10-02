/**
 * User Profile Hooks
 * TanStack Query wrappers for user profile API calls
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { userService } from '@services/api/user.service';
import { getErrorMessage } from '@utils/errorHandler';
import { showError } from '@utils/toast';
import { UserProfile } from '@/types/user.types';

// ── Query key factory ─────────────────────────────────────────────────────────

export const userKeys = {
  all: ['user'] as const,
  profile: () => [...userKeys.all, 'profile'] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const useUserProfile = () =>
  useQuery({
    queryKey: userKeys.profile(),
    queryFn: userService.getProfile,
    staleTime: 5 * 60 * 1000,
  });

// ── Mutations ─────────────────────────────────────────────────────────────────

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: (payload: Partial<UserProfile>) =>
      userService.updateProfile(payload),
    onMutate: async payload => {
      await queryClient.cancelQueries({ queryKey: userKeys.profile() });
      const snapshot = queryClient.getQueryData(userKeys.profile());
      queryClient.setQueryData(userKeys.profile(), (old: any) =>
        old ? { ...old, ...payload } : old,
      );
      return { snapshot };
    },
    onError: (error, _vars, ctx) => {
      queryClient.setQueryData(userKeys.profile(), ctx?.snapshot);
      showError({ title: t(getErrorMessage(error)) });
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.profile() });
    },
  });
};
