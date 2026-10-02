/**
 * usePosts Hook
 * TanStack Query wrapper for the Posts API
 */

import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from '@tanstack/react-query';
import { postsService, Post, PostComment } from '@services/api/posts.service';

export const postKeys = {
  all: ['posts'] as const,
  lists: () => [...postKeys.all, 'list'] as const,
  list: (params: object) => [...postKeys.lists(), params] as const,
  detail: (id: string) => [...postKeys.all, id] as const,
  comments: (id: string) => [...postKeys.all, id, 'comments'] as const,
};

export function usePosts(params?: { type?: string; search?: string; limit?: number }) {
  return useQuery({
    queryKey: postKeys.list(params ?? {}),
    queryFn: () => postsService.list({ limit: 20, ...params }),
    staleTime: 60_000,
    select: data => data.data,
  });
}

export function usePost(id: string) {
  return useQuery({
    queryKey: postKeys.detail(id),
    queryFn: () => postsService.getById(id),
    staleTime: 30_000,
    select: data => data.data,
  });
}

export function usePostComments(postId: string, enabled = false) {
  return useQuery({
    queryKey: postKeys.comments(postId),
    queryFn: () => postsService.getComments(postId),
    enabled,
    staleTime: 30_000,
    select: data => data.data,
  });
}

export function useLikePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (postId: string) => postsService.like(postId),
    onMutate: async (postId: string) => {
      // Optimistic update in all list caches
      await queryClient.cancelQueries({ queryKey: postKeys.lists() });
      const previousData = queryClient.getQueriesData<Post[]>({ queryKey: postKeys.lists() });

      queryClient.setQueriesData<Post[]>({ queryKey: postKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map(p =>
          p.id === postId
            ? { ...p, liked: !p.liked, likeCount: p.liked ? p.likeCount - 1 : p.likeCount + 1 }
            : p
        );
      });

      return { previousData };
    },
    onError: (_err, _postId, context: any) => {
      if (context?.previousData) {
        context.previousData.forEach(([key, data]: any) => {
          queryClient.setQueryData(key, data);
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}

export function useSharePost() {
  return useMutation({
    mutationFn: (postId: string) => postsService.share(postId),
  });
}

export function useAddComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, text }: { postId: string; text: string }) =>
      postsService.addComment(postId, text),
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
      // Bump comment count optimistically in list caches
      queryClient.setQueriesData<Post[]>({ queryKey: postKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map(p => p.id === postId ? { ...p, commentCount: p.commentCount + 1 } : p);
      });
    },
  });
}

export function useDeleteComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ postId, commentId }: { postId: string; commentId: string }) =>
      postsService.deleteComment(postId, commentId),
    onSuccess: (_data, { postId }) => {
      queryClient.invalidateQueries({ queryKey: postKeys.comments(postId) });
      queryClient.setQueriesData<Post[]>({ queryKey: postKeys.lists() }, (old) => {
        if (!old) return old;
        return old.map(p => p.id === postId ? { ...p, commentCount: Math.max(0, p.commentCount - 1) } : p);
      });
    },
  });
}

export function useInfinitePosts(type?: string) {
  return useInfiniteQuery({
    queryKey: postKeys.list({ type }),
    queryFn: ({ pageParam = 1 }) =>
      postsService.list({ type, page: pageParam as number, limit: 20 }),
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
    initialPageParam: 1,
    staleTime: 60_000,
  });
}

export function useCreatePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: {
      type: 'blog' | 'news' | 'kudos' | 'announcement';
      title?: string;
      content: string;
      tags?: string[];
      authorInitials: string;
      authorGradient: [string, string];
    }) => postsService.create(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: postKeys.lists() });
    },
  });
}
