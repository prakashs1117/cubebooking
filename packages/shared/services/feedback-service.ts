import type { ApiClient } from './_client';
import type { Feedback } from '../types';

export interface FeedbackService {
  submit(data: { reaction: 'up' | 'down'; tags: string[]; message: string }): Promise<Feedback>;
  getAll(params?: { page?: number; limit?: number }): Promise<{ data: Feedback[]; total: number }>;
  hasSubmitted(): Promise<boolean>;
}

export function createFeedbackService(client: ApiClient): FeedbackService {
  return {
    async submit(data) {
      const res = await client.post<{ data: Feedback }>('/feedback', data);
      return res.data;
    },
    async getAll(params = {}) {
      const res = await client.get<{ data: Feedback[]; pagination: { total: number } }>('/feedback', params as Record<string, unknown>);
      return { data: res.data, total: res.pagination?.total ?? 0 };
    },
    async hasSubmitted() {
      const res = await client.get<{ data: { submitted: boolean } }>('/feedback/my-status');
      return res.data.submitted;
    },
  };
}
