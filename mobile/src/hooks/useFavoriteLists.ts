import { useQuery } from '@tanstack/react-query';
import { favoritesApiService } from '@services/api/favorites.service';
import type { RemoteFavoriteList } from '@/types/favorites.types';

export const favoriteListKeys = {
  all: ['favoriteLists'] as const,
  lists: () => [...favoriteListKeys.all, 'list'] as const,
};

export function useFavoriteLists(enabled: boolean = true) {
  return useQuery<RemoteFavoriteList[], Error>({
    queryKey: favoriteListKeys.lists(),
    queryFn: () => favoritesApiService.fetchFavoriteLists(),
    enabled,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
}
