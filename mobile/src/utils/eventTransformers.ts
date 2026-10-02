/**
 * Event Data Transformers
 * Utilities to transform event API data into UI-friendly structures
 */

import { EventCardData } from '@components/events/EventCard';

interface Speaker {
  name: string;
  title: string;
  company: string;
  bio?: string;
  photo?: string;
}

interface ScheduleItem {
  id: string;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  location: string;
  type: string;
  speakers: Speaker[] | null;
  capacity: number | null;
  isHighlight: boolean;
  tags?: string[] | null;
  difficultyLevel?: string | null;
}

// API Event structure
export interface APIEvent {
  id: string;
  title: string;
  slug: string;
  description: string;
  startTime: string;
  endTime: string;
  timezone: string;
  venue: string;
  latitude: number;
  longitude: number;
  capacity: number;
  bannerPath?: string;
  status: string;
  visibility: string;
  tags?: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  venueModel?: {
    name: string;
    address: string;
    city: string;
    state: string;
    country: string;
  };
  availableSeats?: number;
  confirmedCount?: number;
  scheduleItems?: ScheduleItem[];
}

export interface EventsAPIResponse {
  events: APIEvent[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Format date string to readable format
 * e.g., "2026-06-15T09:00:00.000Z" -> "Jun 15, 2026"
 */
export const formatEventDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
};

/**
 * Format date string without year
 * e.g., "2026-06-15T09:00:00.000Z" -> "Jun 15"
 */
export const formatEventDateShort = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const options: Intl.DateTimeFormatOptions = {
      month: 'short',
      day: 'numeric',
    };
    return date.toLocaleDateString('en-US', options);
  } catch {
    return dateString;
  }
};

/**
 * Format date range without year
 * e.g., "Jun 15 - Jun 17" or "Jun 15" (if same day)
 */
export const formatEventDateRange = (
  startTime: string,
  endTime: string,
): string => {
  try {
    const start = new Date(startTime);
    const end = new Date(endTime);

    // Check if same day
    if (
      start.getFullYear() === end.getFullYear() &&
      start.getMonth() === end.getMonth() &&
      start.getDate() === end.getDate()
    ) {
      return formatEventDateShort(startTime);
    }

    // Different days
    return `${formatEventDateShort(startTime)} - ${formatEventDateShort(
      endTime,
    )}`;
  } catch {
    return formatEventDateShort(startTime);
  }
};

/**
 * Format ISO timestamp to readable time
 * e.g., "2026-06-15T09:00:00.000Z" -> "09:00 AM"
 */
export const formatEventTime = (isoTimestamp: string): string => {
  try {
    const date = new Date(isoTimestamp);
    const options: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    };
    return date.toLocaleTimeString('en-US', options);
  } catch {
    return '';
  }
};

/**
 * Determine event status badge based on dates
 */
export const getEventStatus = (
  startTime: string,
  endTime: string,
  apiStatus: string,
): 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'FULL' => {
  const now = new Date();
  const start = new Date(startTime);
  const end = new Date(endTime);

  if (apiStatus === 'CANCELLED') return 'CANCELLED';

  if (now >= start && now <= end) return 'LIVE';
  if (now > end) return 'COMPLETED';

  return 'UPCOMING';
};

/**
 * Get venue location string
 */
const getVenueLocation = (event: APIEvent): string => {
  if (event.venueModel) {
    return `${event.venueModel.city}, ${event.venueModel.state}`;
  }
  return event.venue || 'TBA';
};

/**
 * Transform API event response to EventCardData array
 */
export const transformAPIEventsToCards = (
  apiResponse: EventsAPIResponse,
): EventCardData[] => {
  return apiResponse.events.map(event => ({
    id: event.id,
    title: event.title,
    slug: event.slug, // ✅ Add slug field for navigation
    imageUrl: undefined, // Show placeholder - can be updated to use bannerPath if needed
    status: getEventStatus(event.startTime, event.endTime, event.status),
    date: formatEventDate(event.startTime),
    time: formatEventTime(event.startTime),
    location: getVenueLocation(event),
    startTime: event.startTime,
    endTime: event.endTime,
    capacity: event.capacity,
    tags: event.tags,
    scheduleItems: event.scheduleItems,
  }));
};

/**
 * Filter events by status
 */
export const filterEventsByStatus = (
  events: EventCardData[],
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED' | 'CANCELLED' | 'FULL',
): EventCardData[] => {
  return events.filter(event => event.status === status);
};

/**
 * Get upcoming events (UPCOMING or LIVE status)
 */
export const getUpcomingEvents = (events: EventCardData[]): EventCardData[] => {
  return events.filter(
    event => event.status === 'UPCOMING' || event.status === 'LIVE',
  );
};

/**
 * Sort events by start date/time ascending
 */
export const sortEventsByDateTime = (
  events: EventCardData[],
): EventCardData[] => {
  return [...events].sort((a, b) => {
    const dateA = new Date(a.startTime ?? 0).getTime();
    const dateB = new Date(b.startTime ?? 0).getTime();
    return dateA - dateB;
  });
};
