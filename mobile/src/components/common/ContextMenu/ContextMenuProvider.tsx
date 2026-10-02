import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useAuth } from '@context/AuthContext';
import { useFavoriteLists } from '@hooks/useFavoriteLists';
import { getFavoriteLists } from '@services/favoritesListService';
import type { Article } from '@components/search/ArticleCard';
import type { FavoriteList } from '@services/favoritesListService';
import type { RemoteFavoriteList } from '@/types/favorites.types';
import {
  ContextMenuContext,
  type ContextMenuContextType,
} from '@context/ContextMenuContext';
import type { ActionType } from '@components/common/ContextMenu/registry';

interface ContextMenuProviderProps {
  children: React.ReactNode;
}

export const ContextMenuProvider: React.FC<ContextMenuProviderProps> = ({
  children,
}) => {
  // Modal state
  const [isVisible, setIsVisible] = useState(false);
  const [article, setArticle] = useState<Article | null>(null);
  const [actionType, setActionType] = useState<ActionType | null>(null);

  // Cache state
  const [favoritesLists, setFavoritesLists] = useState<FavoriteList[]>([]);
  const [remoteFavoritesLists, setRemoteFavoritesLists] = useState<
    RemoteFavoriteList[]
  >([]);
  const [cacheReady, setCacheReady] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get auth state and remote lists
  const { isGuest, user } = useAuth();
  const isLoggedIn = !isGuest && !!user;
  const { data: remoteListsQuery = [] } = useFavoriteLists(isLoggedIn);

  // Effect 1: Guest list loading — only re-runs when auth state changes, not on every query update
  useEffect(() => {
    if (isGuest) {
      (async () => {
        setIsLoading(true);
        setError(null);
        try {
          const lists = await getFavoriteLists();
          setFavoritesLists(lists);
          setCacheReady(true);
        } catch (err) {
          const message =
            err instanceof Error ? err.message : 'Failed to load favorites';
          setError(message);
          console.error('ContextMenuProvider cache error:', err);
          setCacheReady(true); // Still mark ready, just with error
        } finally {
          setIsLoading(false);
        }
      })();
    }
  }, [isGuest]);

  // Effect 2: Remote list sync — runs when TanStack Query data changes (logged-in users only)
  useEffect(() => {
    if (isLoggedIn && remoteListsQuery.length > 0) {
      setRemoteFavoritesLists(remoteListsQuery);
      setCacheReady(true);
    }
  }, [isLoggedIn, remoteListsQuery]);

  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup close timer on unmount to prevent memory leak
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  const openMenu = useCallback((art: Article, action: ActionType) => {
    setArticle(art);
    setActionType(action);
    setIsVisible(true);
  }, []);

  const closeMenu = useCallback(() => {
    setIsVisible(false);
    // Keep article/actionType in state briefly so the modal's closing animation completes
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setArticle(null);
      setActionType(null);
      closeTimerRef.current = null;
    }, 100);
  }, []);

  const invalidateCache = useCallback(async () => {
    setIsLoading(true);
    try {
      if (isGuest) {
        const lists = await getFavoriteLists();
        setFavoritesLists(lists);
      }
      // Remote lists are managed by TanStack Query, invalidation happens there
    } catch (err) {
      console.error('Cache invalidation error:', err);
      setError(
        err instanceof Error ? err.message : 'Failed to invalidate cache',
      );
    } finally {
      setIsLoading(false);
    }
  }, [isGuest]);

  const contextValue: ContextMenuContextType = useMemo(
    () => ({
      isVisible,
      article,
      actionType,
      openMenu,
      closeMenu,
      favoritesLists,
      remoteFavoritesLists,
      cacheReady,
      invalidateCache,
      isLoading,
      error,
    }),
    [
      isVisible,
      article,
      actionType,
      openMenu,
      closeMenu,
      favoritesLists,
      remoteFavoritesLists,
      cacheReady,
      invalidateCache,
      isLoading,
      error,
    ],
  );

  return (
    <ContextMenuContext.Provider value={contextValue}>
      {children}
    </ContextMenuContext.Provider>
  );
};
