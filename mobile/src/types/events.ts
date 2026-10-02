/**
 * Event Types
 * Type definitions for events from /events endpoint
 */

export interface Event {
  id: string;
  title: string;
  description?: string;
  timestamp: string; // ISO 8601 format
  type?: string;
  location?: string;
  organizer?: string;
  status?: 'upcoming' | 'ongoing' | 'completed' | 'cancelled';
  imageUrl?: string;
  metadata?: Record<string, any>;
}

export interface EventsResponse {
  events: Event[];
  total?: number;
  page?: number;
  limit?: number;
}

export interface EventsQueryParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

export interface EventsStore {
  events: Event[];
  selectedEvent: Event | null;
  isLoading: boolean;
  error: string | null;
  setEvents: (events: Event[]) => void;
  setSelectedEvent: (event: Event | null) => void;
  clearEvents: () => void;
  setLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
}
