import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { marketplaceService, ListPluginsParams, PluginPayload, FeedbackType } from '@services/api/marketplace.service';

export const marketplaceKeys = {
  all: ['marketplace'] as const,
  lists: () => [...marketplaceKeys.all, 'list'] as const,
  list: (params: object) => [...marketplaceKeys.lists(), params] as const,
  detail: (id: string) => [...marketplaceKeys.all, id] as const,
  feedback: (id: string) => [...marketplaceKeys.all, id, 'feedback'] as const,
  mine: () => [...marketplaceKeys.all, 'mine'] as const,
};

export function useInfinitePlugins(params?: Omit<ListPluginsParams, 'page'>) {
  return useInfiniteQuery({
    queryKey: marketplaceKeys.list(params ?? {}),
    queryFn: ({ pageParam = 1 }) =>
      marketplaceService.list({ ...params, page: pageParam as number, limit: 20 }),
    getNextPageParam: (last) => {
      const { page, totalPages } = last.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60_000,
  });
}

export function usePlugin(id: string) {
  return useQuery({
    queryKey: marketplaceKeys.detail(id),
    queryFn: () => marketplaceService.getOne(id),
    staleTime: 30_000,
    enabled: !!id,
  });
}

export function useMyPlugins() {
  return useQuery({
    queryKey: marketplaceKeys.mine(),
    queryFn: () => marketplaceService.mine(),
    staleTime: 30_000,
  });
}

export function usePluginFeedback(pluginId: string, enabled = false) {
  return useQuery({
    queryKey: marketplaceKeys.feedback(pluginId),
    queryFn: () => marketplaceService.getFeedback(pluginId),
    enabled,
    staleTime: 30_000,
  });
}

export function useSubmitPlugin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: Partial<PluginPayload>) => marketplaceService.submit(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.mine() });
    },
  });
}

export function useDeletePlugin() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => marketplaceService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.lists() });
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.mine() });
    },
  });
}

export function useSubmitFeedback() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ pluginId, type, message }: { pluginId: string; type: FeedbackType; message: string }) =>
      marketplaceService.submitFeedback(pluginId, { type, message }),
    onSuccess: (_data, { pluginId }) => {
      queryClient.invalidateQueries({ queryKey: marketplaceKeys.feedback(pluginId) });
    },
  });
}
