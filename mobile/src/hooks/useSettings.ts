import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService } from '@services/api/settings.service';
import { AppSettings } from '@/types/settings.types';
import { showSuccess, showError } from '@utils/toast';
import { useAuth } from '@context/AuthContext';
import { DEFAULT_SETTINGS } from '@utils/defaultSettings';

export const settingsKeys = {
  all: ['settings'] as const,
  detail: () => [...settingsKeys.all, 'detail'] as const,
};

export function useSettings() {
  const queryClient = useQueryClient();
  const { isAuthenticated, isGuest } = useAuth();

  const query = useQuery({
    queryKey: settingsKeys.detail(),
    queryFn: () => settingsService.getSettings(),
    staleTime: 5 * 60 * 1000,
    enabled: isAuthenticated && !isGuest,
    retry: 1,
    select: (data) => (!data || !data.home ? DEFAULT_SETTINGS : data),
  });

  const mutation = useMutation({
    mutationFn: (newSettings: AppSettings) =>
      settingsService.updateSettings(newSettings),
    onMutate: async (newSettings) => {
      await queryClient.cancelQueries({ queryKey: settingsKeys.detail() });
      const previous = queryClient.getQueryData<AppSettings>(
        settingsKeys.detail(),
      );
      queryClient.setQueryData(settingsKeys.detail(), newSettings);
      return { previous };
    },
    onError: (err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(settingsKeys.detail(), context.previous);
      }
      showError({
        title: 'Error',
        message: 'Failed to save settings',
      });
    },
    onSuccess: () => {
      showSuccess({
        title: 'Saved',
        message: 'Settings updated',
      });
    },
  });

  return {
    settings: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    updateSettings: mutation.mutate,
    isSaving: mutation.isPending,
  };
}
