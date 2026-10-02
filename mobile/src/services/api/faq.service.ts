import apiClient from '@services/api/client';
import { ENDPOINTS } from '@services/api/endpoints';

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
  createdAt: string;
}

interface FAQListResponse {
  success: boolean;
  data: { faqs: FAQ[] };
}

export const faqService = {
  async list(): Promise<FAQ[]> {
    const res = await apiClient.get<FAQListResponse>(ENDPOINTS.FAQ.LIST);
    return res.data.data.faqs ?? [];
  },
};
