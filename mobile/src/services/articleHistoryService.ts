import AsyncStorage from '@react-native-async-storage/async-storage';

const HISTORY_KEY = '@mms_article_history';
const MAX_ITEMS = 50;

export interface HistoryArticle {
  id: string; // materialNumber used as stable id
  materialNumber: string;
  articleName: string;
  substance?: string;
  casNumber?: string;
  articleNumber?: string;
  brand?: string;
  viewedAt: string; // ISO date
}

export async function getArticleHistory(): Promise<HistoryArticle[]> {
  try {
    const raw = await AsyncStorage.getItem(HISTORY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addToArticleHistory(
  article: Omit<HistoryArticle, 'id' | 'viewedAt'>,
): Promise<void> {
  try {
    const existing = await getArticleHistory();
    // Remove previous entry for same material (move-to-top dedup)
    const filtered = existing.filter(
      h => h.materialNumber !== article.materialNumber,
    );
    const entry: HistoryArticle = {
      ...article,
      id: article.materialNumber,
      viewedAt: new Date().toISOString(),
    };
    const updated = [entry, ...filtered].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {
    // Silently ignore storage errors
  }
}

export async function removeFromArticleHistory(
  materialNumber: string,
): Promise<void> {
  try {
    const existing = await getArticleHistory();
    const updated = existing.filter(h => h.materialNumber !== materialNumber);
    await AsyncStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
  } catch {}
}

export async function clearArticleHistory(): Promise<void> {
  try {
    await AsyncStorage.removeItem(HISTORY_KEY);
  } catch {}
}
