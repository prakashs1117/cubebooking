/**
 * Events Service
 * Handles all events-related API calls
 * Auth token injection and 401 refresh are handled by the shared Axios interceptor in client.ts
 */

import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import { EventsAPIResponse } from '@utils/eventTransformers';

// Auth redirects are handled by the shared Axios interceptor in client.ts.
// This no-op exists for backwards compatibility with App.tsx root setup.
 
export const setEventsServiceNavigationRef = (_ref: any): void => {};

export const getEvents = async (): Promise<EventsAPIResponse> => {
  const { data } = await apiClient.get<EventsAPIResponse>(
    ENDPOINTS.EVENTS.LIST,
  );
  return data;
};

export const getEventById = async (slug: string): Promise<any> => {
  const { data } = await apiClient.get<any>(ENDPOINTS.EVENTS.DETAIL(slug));
  return data;
};

export const searchEvents = async (
  query: string,
  page = 1,
  limit = 10,
): Promise<EventsAPIResponse> => {
  const { data } = await apiClient.get<EventsAPIResponse>(
    ENDPOINTS.EVENTS.SEARCH(query, page, limit),
  );
  return data;
};

export const eventsService = {
  getEvents,
  getEventById,
  searchEvents,
};

export default eventsService;
