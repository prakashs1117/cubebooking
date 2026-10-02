/**
 * Posts API Service
 * Handles all posts / feed-related API calls (blog, news, kudos, announcements)
 */

import apiClient from '@services/api/client';
import { ENDPOINTS } from '@services/api/endpoints';

export interface Post {
  id: string;
  type: 'blog' | 'news' | 'kudos' | 'announcement';
  title?: string;
  content: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  authorInitials: string;
  authorGradient: [string, string];
  kudosTitle?: string;
  kudosDescription?: string;
  mediaType?: 'image' | 'video';
  mediaLabel?: string;
  mediaUrl?: string;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  liked?: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface ListPostsResponse {
  success: boolean;
  data: Post[];
  pagination: Pagination;
}

interface CommentsResponse {
  success: boolean;
  data: PostComment[];
  pagination: Pagination;
}

export const postsService = {
  async list(params?: { type?: string; page?: number; limit?: number; search?: string }): Promise<ListPostsResponse> {
    const response = await apiClient.get<ListPostsResponse>(ENDPOINTS.POSTS.LIST, { params });
    return response.data;
  },

  async getById(id: string): Promise<{ success: boolean; data: Post }> {
    const response = await apiClient.get<{ success: boolean; data: Post }>(ENDPOINTS.POSTS.DETAIL(id));
    return response.data;
  },

  async create(body: Partial<Post>): Promise<{ success: boolean; data: Post }> {
    const response = await apiClient.post<{ success: boolean; data: Post }>(ENDPOINTS.POSTS.LIST, body);
    return response.data;
  },

  async like(id: string): Promise<{ success: boolean; data: { liked: boolean; likeCount: number } }> {
    const response = await apiClient.post<{ success: boolean; data: { liked: boolean; likeCount: number } }>(ENDPOINTS.POSTS.LIKE(id));
    return response.data;
  },

  async share(id: string): Promise<{ success: boolean; data: { shareCount: number } }> {
    const response = await apiClient.post<{ success: boolean; data: { shareCount: number } }>(ENDPOINTS.POSTS.SHARE(id));
    return response.data;
  },

  async getComments(postId: string, page = 1): Promise<CommentsResponse> {
    const response = await apiClient.get<CommentsResponse>(ENDPOINTS.POSTS.COMMENTS(postId), { params: { page, limit: 30 } });
    return response.data;
  },

  async addComment(postId: string, text: string): Promise<{ success: boolean; data: PostComment }> {
    const response = await apiClient.post<{ success: boolean; data: PostComment }>(ENDPOINTS.POSTS.COMMENTS(postId), { text });
    return response.data;
  },

  async deleteComment(postId: string, commentId: string): Promise<void> {
    await apiClient.delete(ENDPOINTS.POSTS.COMMENT(postId, commentId));
  },
};
