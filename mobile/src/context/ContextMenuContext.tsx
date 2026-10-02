import React, { createContext } from 'react';
import type { Article } from '@components/search/ArticleCard';
import type { FavoriteList } from '@services/favoritesListService';
import type { RemoteFavoriteList } from '@/types/favorites.types';
import type { ActionType } from '@components/common/ContextMenu/registry';

export interface ContextMenuContextType {
  // Modal state
  isVisible: boolean;
  article: Article | null;
  actionType: ActionType | null;

  // Modal controls
  openMenu: (article: Article, actionType: ActionType) => void;
  closeMenu: () => void;

  // Cache
  favoritesLists: FavoriteList[];
  remoteFavoritesLists: RemoteFavoriteList[];
  cacheReady: boolean;
  invalidateCache: () => Promise<void>;

  // Loading states
  isLoading: boolean;
  error: string | null;
}

export const ContextMenuContext = createContext<
  ContextMenuContextType | undefined
>(undefined);

export const useContextMenuState = () => {
  const context = React.useContext(ContextMenuContext);
  if (!context) {
    throw new Error(
      'useContextMenuState must be used within ContextMenuProvider',
    );
  }
  return context;
};
