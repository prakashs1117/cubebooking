/**
 * Article Detail Service
 * Fetches complete article information from Atlas API by material number
 */

import { searchArticles } from '@services/api/atlasSearch.service';
import type { AtlasArticle } from '@services/api/atlasSearch.service';

export async function getArticleDetailByMaterialNumber(
  materialNumber: string,
): Promise<AtlasArticle | null> {
  try {
    const result = await searchArticles(materialNumber, 1, 0);
    const article = result.results.find(
      a => a.materialNumber === materialNumber,
    );
    return article || null;
  } catch (error) {
    console.error(
      `Failed to fetch article details for ${materialNumber}:`,
      error,
    );
    return null;
  }
}
