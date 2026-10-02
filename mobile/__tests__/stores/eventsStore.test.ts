/**
 * Events Store Tests (Zustand)
 * Covers all state transitions and actions in the events store
 */

import { useEventsStore } from '@stores/eventsStore';
import type { Event } from '@models/events';

// Reset store before each test for isolation
beforeEach(() => {
  useEventsStore.setState({
    events: [],
    selectedEvent: null,
    isLoading: false,
    error: null,
  });
});

const makeEvent = (id: string): Event => ({
  id,
  title: `Event ${id}`,
  timestamp: new Date().toISOString(),
});

describe('useEventsStore', () => {
  describe('initial state', () => {
    it('has empty events array', () => {
      expect(useEventsStore.getState().events).toEqual([]);
    });

    it('has null selectedEvent', () => {
      expect(useEventsStore.getState().selectedEvent).toBeNull();
    });

    it('has isLoading false', () => {
      expect(useEventsStore.getState().isLoading).toBe(false);
    });

    it('has null error', () => {
      expect(useEventsStore.getState().error).toBeNull();
    });
  });

  describe('setEvents', () => {
    it('sets the events list', () => {
      const events = [makeEvent('1'), makeEvent('2')];
      useEventsStore.getState().setEvents(events);
      expect(useEventsStore.getState().events).toEqual(events);
    });

    it('clears any existing error when events are set', () => {
      useEventsStore.setState({ error: 'previous error' });
      useEventsStore.getState().setEvents([makeEvent('1')]);
      expect(useEventsStore.getState().error).toBeNull();
    });

    it('replaces the previous events list', () => {
      useEventsStore.getState().setEvents([makeEvent('1')]);
      useEventsStore.getState().setEvents([makeEvent('2'), makeEvent('3')]);
      expect(useEventsStore.getState().events).toHaveLength(2);
      expect(useEventsStore.getState().events[0].id).toBe('2');
    });

    it('accepts an empty array', () => {
      useEventsStore.getState().setEvents([makeEvent('1')]);
      useEventsStore.getState().setEvents([]);
      expect(useEventsStore.getState().events).toHaveLength(0);
    });
  });

  describe('setSelectedEvent', () => {
    it('sets a selected event', () => {
      const event = makeEvent('42');
      useEventsStore.getState().setSelectedEvent(event);
      expect(useEventsStore.getState().selectedEvent).toEqual(event);
    });

    it('clears the selected event when null is passed', () => {
      useEventsStore.getState().setSelectedEvent(makeEvent('1'));
      useEventsStore.getState().setSelectedEvent(null);
      expect(useEventsStore.getState().selectedEvent).toBeNull();
    });
  });

  describe('clearEvents', () => {
    it('resets events to empty array', () => {
      useEventsStore.getState().setEvents([makeEvent('1'), makeEvent('2')]);
      useEventsStore.getState().clearEvents();
      expect(useEventsStore.getState().events).toEqual([]);
    });

    it('resets selectedEvent to null', () => {
      useEventsStore.getState().setSelectedEvent(makeEvent('1'));
      useEventsStore.getState().clearEvents();
      expect(useEventsStore.getState().selectedEvent).toBeNull();
    });

    it('resets error to null', () => {
      useEventsStore.setState({ error: 'some error' });
      useEventsStore.getState().clearEvents();
      expect(useEventsStore.getState().error).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('sets isLoading to true', () => {
      useEventsStore.getState().setLoading(true);
      expect(useEventsStore.getState().isLoading).toBe(true);
    });

    it('sets isLoading to false', () => {
      useEventsStore.setState({ isLoading: true });
      useEventsStore.getState().setLoading(false);
      expect(useEventsStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('sets an error message', () => {
      useEventsStore.getState().setError('Something went wrong');
      expect(useEventsStore.getState().error).toBe('Something went wrong');
    });

    it('sets isLoading to false when an error occurs', () => {
      useEventsStore.setState({ isLoading: true });
      useEventsStore.getState().setError('error');
      expect(useEventsStore.getState().isLoading).toBe(false);
    });

    it('clears the error when null is passed', () => {
      useEventsStore.setState({ error: 'previous error' });
      useEventsStore.getState().setError(null);
      expect(useEventsStore.getState().error).toBeNull();
    });
  });

  describe('state independence between tests', () => {
    it('does not retain state from previous test (setEvents)', () => {
      expect(useEventsStore.getState().events).toEqual([]);
    });

    it('does not retain state from previous test (error)', () => {
      expect(useEventsStore.getState().error).toBeNull();
    });
  });
});
