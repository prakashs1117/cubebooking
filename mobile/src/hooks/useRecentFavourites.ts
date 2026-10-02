// src/hooks/useRecentFavourites.ts
import { useCallback, useMemo, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '@context/AuthContext';
import { useFavoriteLists } from '@hooks/useFavoriteLists';
import { getFavoriteLists, getListArticles } from '@services/favoritesListService';
import type { Article } from '@components/search/ArticleCard';

export interface RecentFavourite {
  materialNumber: string;
  articleName: string;
  substance?: string;
  casNumber?: string;
  articleNumber?: string;
  brand?: string;
}

function dedupeByMaterialNumber(articles: RecentFavourite[]): RecentFavourite[] {
  const seen = new Set<string>();
  return articles.filter(a => {
    if (seen.has(a.materialNumber)) return false;
    seen.add(a.materialNumber);
    return true;
  });
}

export function useRecentFavourites(limit = 10): {
  articles: RecentFavourite[];
  isLoading: boolean;
  isEmpty: boolean;
} {
  const { isGuest, user, isLoading: authLoading } = useAuth();
  const isLoggedIn = !isGuest && !!user;

  // ── Authenticated path ────────────────────────────────────────────────────
  const { data: remoteLists = [], isLoading: remoteLoading, refetch } = useFavoriteLists(isLoggedIn);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn) { refetch(); }
    }, [isLoggedIn, refetch]),
  );

  const remoteArticles = useMemo<RecentFavourite[]>(() => {
    if (!isLoggedIn) return [];
    const flat = remoteLists.flatMap(list =>
      (list.articles ?? []).map(a => ({
        materialNumber: a.materialNumber,
        articleName: a.articleName,
        substance: a.substance,
        casNumber: a.casNumber,
        articleNumber: a.articleNumber,
        brand: a.system,
      })),
    );
    return dedupeByMaterialNumber(flat).slice(0, limit);
  }, [isLoggedIn, remoteLists, limit]);

  // ── Guest path ────────────────────────────────────────────────────────────
  const [guestArticles, setGuestArticles] = useState<RecentFavourite[]>([]);
  const [guestLoading, setGuestLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      if (authLoading) return;
      if (isLoggedIn) {
        setGuestArticles([]);
        return;
      }
      let cancelled = false;
      setGuestLoading(true);
      (async () => {
        try {
          const lists = await getFavoriteLists();
          const allResults = await Promise.all(lists.map(l => getListArticles(l.id)));
          const all: Article[] = allResults.flat();
          if (!cancelled) {
            setGuestArticles(
              dedupeByMaterialNumber(
                all.map(a => ({
                  materialNumber: a.materialNumber,
                  articleName: a.articleName,
                  substance: a.substance,
                  casNumber: a.casNumber,
                  articleNumber: a.articleNumber,
                  brand: a.brand,
                })),
              ).slice(0, limit),
            );
          }
        } catch (e) {
          if (__DEV__) { console.warn('[useRecentFavourites] guest load failed:', e); }
        } finally {
          if (!cancelled) setGuestLoading(false);
        }
      })();
      return () => { cancelled = true; };
    }, [authLoading, isLoggedIn, limit]),
  );

  const articles = isLoggedIn ? remoteArticles : guestArticles;
  const isLoading = isLoggedIn ? remoteLoading : guestLoading;

  return { articles, isLoading, isEmpty: articles.length === 0 };
}
