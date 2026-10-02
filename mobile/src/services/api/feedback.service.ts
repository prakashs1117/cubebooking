import apiClient from '@services/api/client';
import { ENDPOINTS } from '@services/api/endpoints';

export interface FeedbackPayload {
  reaction: 'up' | 'down';
  tags: string[];
  message: string;
}

export interface FeedbackStatus {
  hasSubmitted: boolean;
  submittedAt?: string;
}

export const feedbackService = {
  async submit(payload: FeedbackPayload): Promise<void> {
    await apiClient.post(ENDPOINTS.FEEDBACK.SUBMIT, payload);
  },

  async myStatus(): Promise<FeedbackStatus> {
    const res = await apiClient.get<{ success: boolean; data: FeedbackStatus }>(
      ENDPOINTS.FEEDBACK.MY_STATUS,
    );
    return res.data.data;
  },
};
