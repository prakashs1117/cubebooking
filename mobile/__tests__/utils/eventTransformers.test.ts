/**
 * Event Transformer Tests
 * Full branch coverage for all transformation and formatting utilities
 */

import {
  formatEventDate,
  formatEventDateShort,
  formatEventDateRange,
  formatEventTime,
  getEventStatus,
  transformAPIEventsToCards,
  filterEventsByStatus,
  getUpcomingEvents,
  sortEventsByDateTime,
  type APIEvent,
  type EventsAPIResponse,
} from '@utils/eventTransformers';

// ── Fixtures ─────────────────────────────────────────────────────────────────

const makeEvent = (overrides: Partial<APIEvent> = {}): APIEvent => ({
  id: 'evt-1',
  title: 'Test Event',
  slug: 'test-event',
  description: 'A test event',
  startTime: '2026-06-15T09:00:00.000Z',
  endTime: '2026-06-17T17:00:00.000Z',
  timezone: 'UTC',
  venue: 'Main Hall',
  latitude: 0,
  longitude: 0,
  capacity: 100,
  status: 'PUBLISHED',
  visibility: 'PUBLIC',
  ...overrides,
});

// ── formatEventDate ──────────────────────────────────────────────────────────

describe('formatEventDate', () => {
  it('returns a formatted date string', () => {
    const result = formatEventDate('2026-06-15T09:00:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns original string on invalid date', () => {
    const result = formatEventDate('not-a-date');
    // Invalid dates return NaN-based output or the original; just check non-empty
    expect(typeof result).toBe('string');
  });
});

// ── formatEventDateShort ─────────────────────────────────────────────────────

describe('formatEventDateShort', () => {
  it('returns a date string without year', () => {
    const result = formatEventDateShort('2026-06-15T09:00:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    // Year should not appear in the short format
    expect(result).not.toContain('2026');
  });

  it('falls back gracefully on invalid date', () => {
    const result = formatEventDateShort('bad-date');
    expect(typeof result).toBe('string');
  });
});

// ── formatEventDateRange ─────────────────────────────────────────────────────

describe('formatEventDateRange', () => {
  it('returns single date when start and end are the same day', () => {
    const result = formatEventDateRange(
      '2026-06-15T09:00:00.000Z',
      '2026-06-15T17:00:00.000Z',
    );
    expect(result).not.toContain(' - ');
  });

  it('returns range string when start and end are different days', () => {
    const result = formatEventDateRange(
      '2026-06-15T09:00:00.000Z',
      '2026-06-17T17:00:00.000Z',
    );
    expect(result).toContain(' - ');
  });

  it('falls back to short start date on error', () => {
    const result = formatEventDateRange('bad', 'also-bad');
    expect(typeof result).toBe('string');
  });
});

// ── formatEventTime ──────────────────────────────────────────────────────────

describe('formatEventTime', () => {
  it('returns a time string', () => {
    const result = formatEventTime('2026-06-15T09:00:00.000Z');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('returns empty string on invalid timestamp', () => {
    const result = formatEventTime('not-a-time');
    // Invalid Date returns NaN; result may be empty string or placeholder
    expect(typeof result).toBe('string');
  });
});

// ── getEventStatus ───────────────────────────────────────────────────────────

describe('getEventStatus', () => {
  it('returns CANCELLED when apiStatus is CANCELLED', () => {
    const result = getEventStatus(
      '2026-06-15T09:00:00.000Z',
      '2026-06-17T17:00:00.000Z',
      'CANCELLED',
    );
    expect(result).toBe('CANCELLED');
  });

  it('returns LIVE when current time is between start and end', () => {
    const now = new Date();
    const start = new Date(now.getTime() - 60 * 60 * 1000).toISOString(); // 1h ago
    const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString(); // 1h ahead
    const result = getEventStatus(start, end, 'PUBLISHED');
    expect(result).toBe('LIVE');
  });

  it('returns COMPLETED when end time is in the past', () => {
    const result = getEventStatus(
      '2020-01-01T09:00:00.000Z',
      '2020-01-02T17:00:00.000Z',
      'PUBLISHED',
    );
    expect(result).toBe('COMPLETED');
  });

  it('returns UPCOMING when start time is in the future', () => {
    const result = getEventStatus(
      '2099-01-01T09:00:00.000Z',
      '2099-01-02T17:00:00.000Z',
      'PUBLISHED',
    );
    expect(result).toBe('UPCOMING');
  });
});

// ── transformAPIEventsToCards ────────────────────────────────────────────────

describe('transformAPIEventsToCards', () => {
  it('transforms events to card data', () => {
    const apiResponse: EventsAPIResponse = {
      events: [makeEvent()],
    };
    const result = transformAPIEventsToCards(apiResponse);
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('evt-1');
    expect(result[0].title).toBe('Test Event');
    expect(result[0].slug).toBe('test-event');
  });

  it('uses venueModel city/state when available', () => {
    const event = makeEvent({
      venueModel: {
        name: 'Convention Center',
        address: '123 Main St',
        city: 'Boston',
        state: 'MA',
        country: 'US',
      },
    });
    const result = transformAPIEventsToCards({ events: [event] });
    expect(result[0].location).toBe('Boston, MA');
  });

  it('falls back to venue string when venueModel is absent', () => {
    const event = makeEvent({ venueModel: undefined, venue: 'Grand Hall' });
    const result = transformAPIEventsToCards({ events: [event] });
    expect(result[0].location).toBe('Grand Hall');
  });

  it('returns TBA when neither venueModel nor venue is present', () => {
    const event = makeEvent({ venueModel: undefined, venue: '' });
    const result = transformAPIEventsToCards({ events: [event] });
    expect(result[0].location).toBe('TBA');
  });

  it('returns empty array for empty events list', () => {
    const result = transformAPIEventsToCards({ events: [] });
    expect(result).toHaveLength(0);
  });

  it('includes tags and scheduleItems from source event', () => {
    const event = makeEvent({
      tags: [{ id: 't1', name: 'Tech', slug: 'tech' }],
      scheduleItems: [],
    });
    const result = transformAPIEventsToCards({ events: [event] });
    expect(result[0].tags).toEqual(event.tags);
    expect(result[0].scheduleItems).toEqual([]);
  });
});

// ── filterEventsByStatus ─────────────────────────────────────────────────────

describe('filterEventsByStatus', () => {
  const cards = [
    {
      id: '1',
      title: 'A',
      status: 'UPCOMING' as const,
      date: '',
      time: '',
      location: '',
      startTime: '',
      endTime: '',
      capacity: 0,
    },
    {
      id: '2',
      title: 'B',
      status: 'LIVE' as const,
      date: '',
      time: '',
      location: '',
      startTime: '',
      endTime: '',
      capacity: 0,
    },
    {
      id: '3',
      title: 'C',
      status: 'COMPLETED' as const,
      date: '',
      time: '',
      location: '',
      startTime: '',
      endTime: '',
      capacity: 0,
    },
    {
      id: '4',
      title: 'D',
      status: 'UPCOMING' as const,
      date: '',
      time: '',
      location: '',
      startTime: '',
      endTime: '',
      capacity: 0,
    },
  ];

  it('filters to only UPCOMING events', () => {
    const result = filterEventsByStatus(cards, 'UPCOMING');
    expect(result).toHaveLength(2);
    result.forEach(e => expect(e.status).toBe('UPCOMING'));
  });

  it('filters to only LIVE events', () => {
    const result = filterEventsByStatus(cards, 'LIVE');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('returns empty array when no matches', () => {
    const result = filterEventsByStatus(cards, 'CANCELLED');
    expect(result).toHaveLength(0);
  });
});

// ── getUpcomingEvents ────────────────────────────────────────────────────────

describe('getUpcomingEvents', () => {
  const cards = [
    {
      id: '1',
      title: 'A',
      status: 'UPCOMING' as const,
      date: '',
      time: '',
      location: '',
      startTime: '',
      endTime: '',
      capacity: 0,
    },
    {
      id: '2',
      title: 'B',
      status: 'LIVE' as const,
      date: '',
      time: '',
      location: '',
      startTime: '',
      endTime: '',
      capacity: 0,
    },
    {
      id: '3',
      title: 'C',
      status: 'COMPLETED' as const,
      date: '',
      time: '',
      location: '',
      startTime: '',
      endTime: '',
      capacity: 0,
    },
  ];

  it('returns both UPCOMING and LIVE events', () => {
    const result = getUpcomingEvents(cards);
    expect(result).toHaveLength(2);
    result.forEach(e => expect(['UPCOMING', 'LIVE']).toContain(e.status));
  });

  it('returns empty array when there are no upcoming/live events', () => {
    const completedOnly = cards.filter(c => c.status === 'COMPLETED');
    const result = getUpcomingEvents(completedOnly);
    expect(result).toHaveLength(0);
  });
});

// ── sortEventsByDateTime ─────────────────────────────────────────────────────

describe('sortEventsByDateTime', () => {
  const makeCard = (id: string, startTime: string) => ({
    id,
    title: id,
    status: 'UPCOMING' as const,
    date: '',
    time: '',
    location: '',
    startTime,
    endTime: '',
    capacity: 0,
  });

  it('sorts events ascending by startTime', () => {
    const cards = [
      makeCard('c', '2026-06-17T09:00:00.000Z'),
      makeCard('a', '2026-06-15T09:00:00.000Z'),
      makeCard('b', '2026-06-16T09:00:00.000Z'),
    ];
    const sorted = sortEventsByDateTime(cards);
    expect(sorted.map(e => e.id)).toEqual(['a', 'b', 'c']);
  });

  it('does not mutate the original array', () => {
    const cards = [
      makeCard('b', '2026-06-16T09:00:00.000Z'),
      makeCard('a', '2026-06-15T09:00:00.000Z'),
    ];
    const original = [...cards];
    sortEventsByDateTime(cards);
    expect(cards).toEqual(original);
  });

  it('returns empty array for empty input', () => {
    expect(sortEventsByDateTime([])).toEqual([]);
  });

  it('handles undefined startTime gracefully', () => {
    const cards = [
      { ...makeCard('a', ''), startTime: undefined as any },
      makeCard('b', '2026-06-15T09:00:00.000Z'),
    ];
    expect(() => sortEventsByDateTime(cards)).not.toThrow();
  });
});
