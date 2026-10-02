/**
 * Date utility functions
 */

/**
 * Format timestamp to relative time (e.g., "2 hours ago")
 */
export const formatRelativeTime = (
  timestamp: number,
  t: (key: string, options?: any) => string,
  _language: string,
): string => {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (seconds < 60) {
    return t('events.justNow');
  } else if (minutes === 1) {
    return t('events.minuteAgo');
  } else if (minutes < 60) {
    return t('events.minutesAgo', { count: minutes });
  } else if (hours === 1) {
    return t('events.hourAgo');
  } else if (hours < 24) {
    return t('events.hoursAgo', { count: hours });
  } else if (days === 1) {
    return t('events.dayAgo');
  } else if (days < 7) {
    return t('events.daysAgo', { count: days });
  } else if (weeks === 1) {
    return t('events.weekAgo');
  } else if (weeks < 4) {
    return t('events.weeksAgo', { count: weeks });
  } else if (months === 1) {
    return t('events.monthAgo');
  } else {
    return t('events.monthsAgo', { count: months });
  }
};

/**
 * Format date to localized string
 */
export const formatDate = (timestamp: number, language: string): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  return date.toLocaleDateString(language, options);
};

/**
 * Format date and time to localized string
 */
export const formatDateTime = (timestamp: number, language: string): string => {
  const date = new Date(timestamp);
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return date.toLocaleString(language, options);
};
