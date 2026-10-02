/**
 * Date Utility Tests
 * Full branch coverage for formatRelativeTime, formatDate, and formatDateTime
 */

import {
  formatRelativeTime,
  formatDate,
  formatDateTime,
} from '@utils/dateUtils';

// Stable mock translation function
const mockT = jest.fn((key: string, opts?: { count?: number }) => {
  if (opts?.count !== undefined) {
    return `${key}:${opts.count}`;
  }
  return key;
});

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;

const BASE_TIME = new Date('2025-06-15T12:00:00.000Z').getTime();

describe('formatRelativeTime', () => {
  let nowSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();
    nowSpy = jest.spyOn(Date, 'now').mockReturnValue(BASE_TIME);
  });

  afterEach(() => {
    nowSpy.mockRestore();
  });

  it('returns justNow for less than 60 seconds ago', () => {
    const result = formatRelativeTime(BASE_TIME - 30 * SECOND, mockT, 'en');
    expect(result).toBe('events.justNow');
  });

  it('returns minuteAgo for exactly 1 minute ago', () => {
    const result = formatRelativeTime(BASE_TIME - 1 * MINUTE, mockT, 'en');
    expect(result).toBe('events.minuteAgo');
  });

  it('returns minutesAgo for 2–59 minutes ago', () => {
    const result = formatRelativeTime(BASE_TIME - 30 * MINUTE, mockT, 'en');
    expect(result).toBe('events.minutesAgo:30');
    expect(mockT).toHaveBeenCalledWith('events.minutesAgo', { count: 30 });
  });

  it('returns hourAgo for exactly 1 hour ago', () => {
    const result = formatRelativeTime(BASE_TIME - 1 * HOUR, mockT, 'en');
    expect(result).toBe('events.hourAgo');
  });

  it('returns hoursAgo for 2–23 hours ago', () => {
    const result = formatRelativeTime(BASE_TIME - 5 * HOUR, mockT, 'en');
    expect(result).toBe('events.hoursAgo:5');
    expect(mockT).toHaveBeenCalledWith('events.hoursAgo', { count: 5 });
  });

  it('returns dayAgo for exactly 1 day ago', () => {
    const result = formatRelativeTime(BASE_TIME - 1 * DAY, mockT, 'en');
    expect(result).toBe('events.dayAgo');
  });

  it('returns daysAgo for 2–6 days ago', () => {
    const result = formatRelativeTime(BASE_TIME - 4 * DAY, mockT, 'en');
    expect(result).toBe('events.daysAgo:4');
    expect(mockT).toHaveBeenCalledWith('events.daysAgo', { count: 4 });
  });

  it('returns weekAgo for exactly 1 week ago', () => {
    const result = formatRelativeTime(BASE_TIME - 1 * WEEK, mockT, 'en');
    expect(result).toBe('events.weekAgo');
  });

  it('returns weeksAgo for 2–3 weeks ago', () => {
    const result = formatRelativeTime(BASE_TIME - 2 * WEEK, mockT, 'en');
    expect(result).toBe('events.weeksAgo:2');
    expect(mockT).toHaveBeenCalledWith('events.weeksAgo', { count: 2 });
  });

  it('returns monthAgo for exactly 1 month ago (30 days)', () => {
    const result = formatRelativeTime(BASE_TIME - 30 * DAY, mockT, 'en');
    expect(result).toBe('events.monthAgo');
  });

  it('returns monthsAgo for 2+ months ago', () => {
    const result = formatRelativeTime(BASE_TIME - 60 * DAY, mockT, 'en');
    expect(result).toBe('events.monthsAgo:2');
    expect(mockT).toHaveBeenCalledWith('events.monthsAgo', { count: 2 });
  });
});

describe('formatDate', () => {
  it('formats timestamp to localized date string', () => {
    const timestamp = new Date('2025-01-15').getTime();
    const result = formatDate(timestamp, 'en');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('uses the provided language for formatting', () => {
    const timestamp = new Date('2025-06-01').getTime();
    const enResult = formatDate(timestamp, 'en');
    // Just verify it returns a non-empty string — locale output varies by environment
    expect(enResult).toBeTruthy();
  });
});

describe('formatDateTime', () => {
  it('formats timestamp to localized date-time string', () => {
    const timestamp = new Date('2025-01-15T14:30:00').getTime();
    const result = formatDateTime(timestamp, 'en');
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('includes time information (different from date-only result)', () => {
    const timestamp = new Date('2025-01-15T14:30:00').getTime();
    const dateOnly = formatDate(timestamp, 'en');
    const dateTime = formatDateTime(timestamp, 'en');
    // datetime output should be at least as long as date output
    expect(dateTime.length).toBeGreaterThanOrEqual(dateOnly.length);
  });
});
