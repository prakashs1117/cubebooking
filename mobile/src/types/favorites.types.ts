/**
 * Favorites Type Definitions
 * LocalFavoriteList — stored in AsyncStorage (guest / offline)
 * RemoteFavoriteList — shape from My M Safety backend API
 */

import type { Article } from '@components/search/ArticleCard';

// ─── Local (AsyncStorage) ────────────────────────────────────────────────────

export interface LocalFavoriteList {
  id: string; // string timestamp, e.g. Date.now().toString()
  name: string;
  createdAt: string; // ISO timestamp
}

export interface LocalFavoritesEntry {
  list: LocalFavoriteList;
  articles: Article[];
}

// ─── Remote (My M Safety API) ────────────────────────────────────────────────

export interface RemoteArticle {
  id?: number; // server-assigned — present after add/fetch
  materialNumber: string;
  articleName: string;
  substance?: string;
  casNumber?: string;
  articleNumber?: string;
  system?: string;
  offlineAvailable?: boolean;
}

export interface RemoteFavoriteList {
  id?: number; // server-assigned — present after create/fetch
  uuid?: string;
  name: string;
  articles: RemoteArticle[];
  offlineAvailable?: boolean;
}

// ─── Mapping helper ──────────────────────────────────────────────────────────

export function toRemoteFavoriteList(
  entry: LocalFavoritesEntry,
): RemoteFavoriteList {
  return {
    name: entry.list.name,
    articles: entry.articles.map(a => ({
      materialNumber: a.materialNumber,
      articleName: a.articleName,
      substance: a.substance ?? '',
      casNumber: a.casNumber ?? '',
      articleNumber: a.articleNumber ?? '',
      system: a.brand ?? 'NEX',
    })),
  };
}

export function toRemoteArticle(article: Article): RemoteArticle {
  return {
    materialNumber: article.materialNumber,
    articleName: article.articleName,
    substance: article.substance ?? '',
    casNumber: article.casNumber ?? '',
    articleNumber: article.articleNumber ?? '',
    system: article.brand ?? 'NEX',
  };
}
