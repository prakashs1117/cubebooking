/**
 * Atlas Search Service
 * Wraps Atlas API search endpoint with HMAC token auth via atlasClient.
 * Endpoint: GET /v4/safetydata/searchVerbose/PUBLIC/EU/EN
 */

import atlasClient from '@services/api/atlasClient';
import { analytics } from '@services/analyticsService';

export interface AtlasArticle {
  materialNumber: string;
  articleNumber: string;
  articleName: string;
  substance: string;
  casNumber: string;
  system: string;
  offlineAvailable?: boolean;
}

export interface AtlasSearchResult {
  hits: number;
  results: AtlasArticle[];
}

// Path segments — EU/EN for RoW
const SEARCH_PATH = '/v4/safetydata/searchVerbose/PUBLIC/EU/EN';

// Filter out P24 system and bulk/variant material numbers (matches Ionic filterOut_Bulk_Var_0000_9999)
const FILTER_OUT_SYSTEM = 'qua';
const FILTER_OUT_INCLUDES = ['bulk', 'var', 'intr'];
const FILTER_OUT_ENDS = ['0000', '9999'];

function isValidArticle(article: AtlasArticle): boolean {
  const mat = article.materialNumber.toLowerCase();
  for (const token of FILTER_OUT_INCLUDES) {
    if (mat.includes(token)) return false;
  }
  for (const suffix of FILTER_OUT_ENDS) {
    if (mat.endsWith(suffix)) return false;
  }
  return article.system.toLowerCase() !== FILTER_OUT_SYSTEM;
}

export async function searchArticles(
  query: string,
  limit = 20,
  offset = 0,
  context?: { validity_area?: string; language?: string },
): Promise<AtlasSearchResult> {
  const startTime = Date.now();
  const response = await atlasClient.get<AtlasSearchResult>(SEARCH_PATH, {
    params: { q: query, limit, offset },
  });
  const apiResponseTime = Date.now() - startTime;

  const data = response.data;
  const filtered = (data.results ?? []).filter(isValidArticle);
  const result = { hits: data.hits ?? filtered.length, results: filtered };

  // Log analytics for search query
  try {
    analytics.logAtlasSearch({
      search_query: query,
      search_type: 'text',
      result_count: result.results.length,
      result_limit: limit,
      validity_area: (context?.validity_area || 'EU') as 'EU' | 'US' | 'CN',
      language: (context?.language || 'EN') as 'EN' | 'FR' | 'AR' | 'ZH',
      filter_applied: offset > 0, // pagination indicates filtering/secondary query
      api_response_time_ms: apiResponseTime,
    });
  } catch (analyticsError) {
    console.warn('Failed to log search analytics:', analyticsError);
  }

  return result;
}
