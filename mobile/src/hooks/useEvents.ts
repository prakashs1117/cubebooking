/**
 * Events Hooks
 * TanStack Query wrappers for events API calls
 */

import { useQuery } from '@tanstack/react-query';
import {
  getEvents,
  getEventById,
  searchEvents,
} from '@services/api/events.service';

// ── Query key factory ─────────────────────────────────────────────────────────

export const eventKeys = {
  all: ['events'] as const,
  lists: () => [...eventKeys.all, 'list'] as const,
  detail: (slug: string) => [...eventKeys.all, 'detail', slug] as const,
  search: (query: string) => [...eventKeys.all, 'search', query] as const,
};

// ── Queries ───────────────────────────────────────────────────────────────────

export const useEvents = () =>
  useQuery({
    queryKey: eventKeys.lists(),
    queryFn: getEvents,
    staleTime: 5 * 60 * 1000,
  });

export const useEvent = (slug: string) =>
  useQuery({
    queryKey: eventKeys.detail(slug),
    queryFn: () => getEventById(slug),
    enabled: !!slug,
    staleTime: 10 * 60 * 1000,
  });

export const useEventSearch = (query: string, page = 1, limit = 20) =>
  useQuery({
    queryKey: eventKeys.search(query),
    queryFn: () => searchEvents(query, page, limit),
    enabled: query.trim().length > 0,
    staleTime: 2 * 60 * 1000,
  });
