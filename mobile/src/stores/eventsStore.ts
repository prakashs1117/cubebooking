/**
 * Events Store (Zustand)
 * Global state management for events
 */

import { create } from 'zustand';
import { Event, EventsStore } from '@models/events';

export const useEventsStore = create<EventsStore>(set => ({
  // State
  events: [],
  selectedEvent: null,
  isLoading: false,
  error: null,

  // Actions
  setEvents: (events: Event[]) =>
    set({
      events,
      error: null,
    }),

  setSelectedEvent: (event: Event | null) =>
    set({
      selectedEvent: event,
    }),

  clearEvents: () =>
    set({
      events: [],
      selectedEvent: null,
      error: null,
    }),

  setLoading: (isLoading: boolean) =>
    set({
      isLoading,
    }),

  setError: (error: string | null) =>
    set({
      error,
      isLoading: false,
    }),
}));
