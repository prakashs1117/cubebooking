import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@context/AuthContext';
import { useFavoriteLists } from '@hooks/useFavoriteLists';
import { getFavoriteLists, getListArticles } from '@services/favoritesListService';

/**
 * Returns a Set of all materialNumbers currently saved in any favourite list.
 * - Logged-in users: derived from TanStack Query remote lists (cached, reactive)
 * - Guest users: loaded once from AsyncStorage on mount
 */
export function useFavouritedMaterialNumbers(): Set<string> {
  const { isGuest, user } = useAuth();
  const isLoggedIn = !isGuest && !!user;

  // Remote lists for logged-in users (already cached by TanStack Query)
  const { data: remoteLists = [] } = useFavoriteLists(isLoggedIn);

  // Local lists for guest users
  const [guestSet, setGuestSet] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoggedIn) {
      let cancelled = false;
      (async () => {
        try {
          const lists = await getFavoriteLists();
          const allNumbers: string[] = [];
          await Promise.all(
            lists.map(async list => {
              const articles = await getListArticles(list.id);
              articles.forEach(a => allNumbers.push(a.materialNumber));
            }),
          );
          if (!cancelled) setGuestSet(new Set(allNumbers));
        } catch {}
      })();
      return () => { cancelled = true; };
    }
  }, [isLoggedIn]);

  // Remote set — re-derives when TanStack Query updates
  const remoteSet = useMemo(() => {
    if (!isLoggedIn) return new Set<string>();
    const nums = remoteLists.flatMap(list =>
      (list.articles ?? []).map(a => a.materialNumber),
    );
    return new Set(nums);
  }, [isLoggedIn, remoteLists]);

  return isLoggedIn ? remoteSet : guestSet;
}
