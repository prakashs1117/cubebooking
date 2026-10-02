import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Article } from '@components/search/ArticleCard';

const LISTS_KEY = '@mms_favorites_lists';
const ITEMS_KEY = '@mms_favorites_items';

export interface FavoriteList {
  id: string;
  name: string;
  createdAt: string;
}

export async function getFavoriteLists(): Promise<FavoriteList[]> {
  const raw = await AsyncStorage.getItem(LISTS_KEY);
  return raw ? (JSON.parse(raw) as FavoriteList[]) : [];
}

export async function createFavoriteList(name: string): Promise<FavoriteList> {
  const lists = await getFavoriteLists();
  const trimmed = name.trim();
  const exists = lists.some(
    l => l.name.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  if (exists) throw new Error('DUPLICATE_LIST_NAME');
  const newList: FavoriteList = {
    id: Date.now().toString(),
    name: trimmed,
    createdAt: new Date().toISOString(),
  };
  await AsyncStorage.setItem(LISTS_KEY, JSON.stringify([newList, ...lists]));
  return newList;
}

export async function deleteFavoriteList(id: string): Promise<void> {
  const lists = await getFavoriteLists();
  await AsyncStorage.setItem(
    LISTS_KEY,
    JSON.stringify(lists.filter(l => l.id !== id)),
  );
  await AsyncStorage.removeItem(`${ITEMS_KEY}_${id}`);
}

export async function getListArticles(listId: string): Promise<Article[]> {
  const raw = await AsyncStorage.getItem(`${ITEMS_KEY}_${listId}`);
  return raw ? (JSON.parse(raw) as Article[]) : [];
}

export async function addArticleToList(
  listId: string,
  article: Article,
): Promise<void> {
  const existing = await getListArticles(listId);
  if (existing.some(a => a.materialNumber === article.materialNumber)) return;
  await AsyncStorage.setItem(
    `${ITEMS_KEY}_${listId}`,
    JSON.stringify([article, ...existing]),
  );
}

export async function removeArticleFromList(
  listId: string,
  materialNumber: string,
): Promise<void> {
  const existing = await getListArticles(listId);
  await AsyncStorage.setItem(
    `${ITEMS_KEY}_${listId}`,
    JSON.stringify(existing.filter(a => a.materialNumber !== materialNumber)),
  );
}

export async function clearAllLocalFavorites(): Promise<void> {
  const lists = await getFavoriteLists();
  await Promise.all(
    lists.map(l => AsyncStorage.removeItem(`${ITEMS_KEY}_${l.id}`)),
  );
  await AsyncStorage.removeItem(LISTS_KEY);
}
