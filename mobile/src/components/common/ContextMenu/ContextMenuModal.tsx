import React from 'react';
import { useAuth } from '@context/AuthContext';
import { useContextMenuState } from '@context/ContextMenuContext';
import AddToFavoritesSheet from '@components/favorites/AddToFavoritesSheet';

/**
 * Context menu modal that wraps AddToFavoritesSheet.
 * Displayed when user long-presses an article card.
 *
 * This is a single modal instance rendered once at the app root
 * and reused across all screens via context state management.
 */
export const ContextMenuModal: React.FC = () => {
  const { isVisible, article, actionType, closeMenu, remoteFavoritesLists } =
    useContextMenuState();
  const { isGuest } = useAuth();

  // Only show for addToFavorites action (for now)
  // Future: support other action types with different modal content
  if (!isVisible || !article || actionType !== 'addToFavorites') {
    return null;
  }

  return (
    <AddToFavoritesSheet
      visible={isVisible}
      article={article}
      onClose={closeMenu}
      onSaved={closeMenu}
      isLoggedIn={!isGuest}
      remoteLists={remoteFavoritesLists}
    />
  );
};

export default ContextMenuModal;
