import type { ApiClient } from './_client';
import type { Tag } from '../types';

export interface ITagService {
  getTags(filters?: { category?: string; isCommon?: boolean; limit?: number }): Promise<Tag[]>;
  searchTags(query: string, limit?: number): Promise<Tag[]>;
  getCommonTags(): Promise<Tag[]>;
  createTag(name: string, category?: string): Promise<Tag>;
}

export function createTagService(client: ApiClient): ITagService {
  return {
    async getTags(filters = {}) {
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.isCommon !== undefined) params.append('isCommon', String(filters.isCommon));
      if (filters.limit) params.append('limit', String(filters.limit));

      const query = params.toString();
      const url = query ? `/tags?${query}` : '/tags';

      const response = await client.get<{ data: Tag[] }>(url);
      return response.data;
    },

    async searchTags(query: string, limit = 20) {
      const response = await client.get<{ data: Tag[] }>('/tags/search', {
        q: query,
        limit: Math.min(limit, 50),
      });
      return response.data;
    },

    async getCommonTags() {
      const response = await client.get<{ data: Tag[] }>('/tags/common');
      return response.data;
    },

    async createTag(name: string, category = 'blog') {
      const response = await client.post<{ data: Tag }>('/tags', {
        name,
        category,
      });
      return response.data;
    },
  };
}
