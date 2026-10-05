import type { ApiClient } from './_client';
import type { FAQ } from '../types';

export interface FAQService {
  getAll(): Promise<FAQ[]>;
  create(data: { question: string; answer: string }): Promise<FAQ>;
  update(id: string, data: Partial<Pick<FAQ, 'question' | 'answer' | 'isPublished'>>): Promise<FAQ>;
  remove(id: string): Promise<void>;
  reorder(ids: string[]): Promise<void>;
}

export function createFAQService(client: ApiClient): FAQService {
  return {
    async getAll() {
      const res = await client.get<{ data: FAQ[] }>('/faqs');
      return res.data;
    },
    async create(data) {
      const res = await client.post<{ data: FAQ }>('/faqs', data);
      return res.data;
    },
    async update(id, data) {
      const res = await client.patch<{ data: FAQ }>(`/faqs/${id}`, data);
      return res.data;
    },
    async remove(id) {
      await client.delete(`/faqs/${id}`);
    },
    async reorder(ids) {
      await client.patch('/faqs/reorder', { ids });
    },
  };
}
