/**
 * Favorites API Service — My M Safety backend
 * All endpoints require a valid Bearer token (injected by apiClient interceptor).
 */

import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import type {
  RemoteFavoriteList,
  RemoteArticle,
} from '@/types/favorites.types';

export const favoritesApiService = {
  /**
   * Fetch all favorite lists for the authenticated user.
   * GET /favorites-lists
   */
  fetchFavoriteLists: async (): Promise<RemoteFavoriteList[]> => {
    const { data } = await apiClient.get<RemoteFavoriteList[]>(
      ENDPOINTS.FAVORITES.LISTS,
    );
    return data ?? [];
  },

  /**
   * Create a single list (with optional articles).
   * POST /favorites-lists
   */
  createFavoriteList: async (
    name: string,
    articles: RemoteArticle[] = [],
  ): Promise<RemoteFavoriteList> => {
    const { data } = await apiClient.post<RemoteFavoriteList>(
      ENDPOINTS.FAVORITES.LISTS,
      {
        name,
        articles,
      },
    );
    return data;
  },

  /**
   * Bulk-create multiple lists in one call — used for guest→cloud migration.
   * POST /favorites-lists/all
   */
  bulkCreateFavoriteLists: async (
    lists: RemoteFavoriteList[],
  ): Promise<void> => {
    await apiClient.post(ENDPOINTS.FAVORITES.BULK_CREATE, lists);
  },

  /**
   * Replace a list's name and articles in one shot.
   * PUT /favorites-lists/{id}
   */
  updateFavoriteList: async (
    id: number,
    list: RemoteFavoriteList,
  ): Promise<RemoteFavoriteList> => {
    const { data } = await apiClient.put<RemoteFavoriteList>(
      ENDPOINTS.FAVORITES.LIST_BY_ID(id),
      list,
    );
    return data;
  },

  /**
   * Delete a list by its server-assigned numeric ID.
   * DELETE /favorites-lists/{id}
   */
  deleteFavoriteList: async (id: number): Promise<void> => {
    await apiClient.delete(ENDPOINTS.FAVORITES.LIST_BY_ID(id));
  },

  /**
   * Add an article to an existing list.
   * POST /favorites-lists/{listId}/favorites
   */
  addArticleToList: async (
    listId: number,
    article: RemoteArticle,
  ): Promise<RemoteArticle> => {
    const { data } = await apiClient.post<RemoteArticle>(
      ENDPOINTS.FAVORITES.ARTICLES(listId),
      article,
    );
    return data;
  },

  /**
   * Remove an article from a list by its server-assigned article ID.
   * DELETE /favorites-lists/{listId}/favorites/{articleId}
   */
  removeArticleFromList: async (
    listId: number,
    articleId: number,
  ): Promise<void> => {
    await apiClient.delete(
      ENDPOINTS.FAVORITES.REMOVE_ARTICLE(listId, articleId),
    );
  },
};
