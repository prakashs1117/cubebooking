import { getAnalytics, logEvent, setUserId, setUserProperties } from 'firebase/analytics';
import app from '../shared/firebase';

let analytics: ReturnType<typeof getAnalytics> | null = null;

export const initAnalytics = () => {
  if (!analytics) {
    analytics = getAnalytics(app);
  }
  return analytics;
};

export const trackEvent = (eventName: string, eventParams?: Record<string, any>) => {
  if (!analytics) {
    initAnalytics();
  }
  if (analytics) {
    logEvent(analytics, eventName, eventParams);
  }
};

export const setCurrentUser = (userId: string) => {
  if (!analytics) {
    initAnalytics();
  }
  if (analytics) {
    setUserId(analytics, userId);
  }
};

export const setUserProps = (props: Record<string, string | number | boolean>) => {
  if (!analytics) {
    initAnalytics();
  }
  if (analytics) {
    setUserProperties(analytics, props);
  }
};

export const trackPageView = (pageName: string, pageTitle?: string) => {
  trackEvent('page_view', {
    page_title: pageTitle || pageName,
    page_location: window.location.href,
  });
};

export const trackUserSignIn = (userId: string, method: 'email' | 'google' | 'anonymous' = 'email') => {
  setCurrentUser(userId);
  trackEvent('sign_in', {
    method,
  });
};

export const trackUserSignOut = () => {
  trackEvent('sign_out');
  setUserId(analytics!, null);
};

export const trackBookingInitiated = (programId: string, programName?: string) => {
  trackEvent('booking_initiated', {
    program_id: programId,
    program_name: programName,
  });
};

export const trackProgramSelected = (programId: string, programName?: string) => {
  trackEvent('program_selected', {
    program_id: programId,
    program_name: programName,
  });
};

export const trackTimeSlotSelected = (timeSlot: string, date?: string) => {
  trackEvent('time_slot_selected', {
    time_slot: timeSlot,
    date: date,
  });
};

export const trackBookingDetailsSubmitted = (details: Record<string, any>) => {
  trackEvent('booking_details_submitted', {
    form_completed: true,
    ...details,
  });
};

export const trackBookingReviewed = (bookingId: string) => {
  trackEvent('booking_reviewed', {
    booking_id: bookingId,
  });
};

export const trackBookingConfirmed = (bookingId: string, programId: string, totalAmount?: number) => {
  trackEvent('booking_completed', {
    booking_id: bookingId,
    program_id: programId,
    value: totalAmount,
    currency: 'USD',
    transaction_id: bookingId,
  });
};

export const trackBookingCancelled = (bookingId: string, reason?: string) => {
  trackEvent('booking_cancelled', {
    booking_id: bookingId,
    reason: reason,
  });
};

export const trackRescheduleInitiated = (bookingId: string) => {
  trackEvent('reschedule_initiated', {
    booking_id: bookingId,
  });
};

export const trackProfileViewed = () => {
  trackEvent('profile_viewed');
};

export const trackProfileUpdated = (fields: string[]) => {
  trackEvent('profile_updated', {
    fields_updated: fields.join(','),
  });
};

export const trackKitViewed = () => {
  trackEvent('kit_viewed');
};

export const trackKitItemSelected = (itemId: string, itemName?: string) => {
  trackEvent('kit_item_selected', {
    item_id: itemId,
    item_name: itemName,
  });
};

export const trackNotificationReceived = (notificationType: string) => {
  trackEvent('notification_received', {
    notification_type: notificationType,
  });
};

export const trackSearchPerformed = (query: string, resultCount?: number) => {
  trackEvent('search', {
    search_term: query,
    number_of_results: resultCount,
  });
};

export const trackFilterApplied = (filterType: string, filterValue: string) => {
  trackEvent('filter_applied', {
    filter_type: filterType,
    filter_value: filterValue,
  });
};

export const trackError = (errorName: string, errorMessage?: string) => {
  trackEvent('app_error', {
    error_name: errorName,
    error_message: errorMessage,
  });
};

export const trackScreenView = (screenName: string, screenClass?: string) => {
  trackEvent('screen_view', {
    screen_name: screenName,
    screen_class: screenClass,
  });
};

export const trackButtonClick = (buttonName: string, buttonLocation?: string) => {
  trackEvent('button_click', {
    button_name: buttonName,
    button_location: buttonLocation,
  });
};

export const trackFormStarted = (formName: string) => {
  trackEvent('form_started', {
    form_name: formName,
  });
};

export const trackFormSubmitted = (formName: string, isSuccessful: boolean) => {
  trackEvent('form_submitted', {
    form_name: formName,
    form_success: isSuccessful,
  });
};

export const trackFormAbandoned = (formName: string, completionPercentage?: number) => {
  trackEvent('form_abandoned', {
    form_name: formName,
    completion_percentage: completionPercentage,
  });
};

export const trackImpressionView = (contentId: string, contentType: string, contentName?: string) => {
  trackEvent('view_item', {
    items: [
      {
        item_id: contentId,
        item_name: contentName,
        item_category: contentType,
      },
    ],
  });
};

export const trackFeatureUsed = (featureName: string, metadata?: Record<string, any>) => {
  trackEvent('feature_used', {
    feature_name: featureName,
    ...metadata,
  });
};

export const trackPerformanceMetric = (metricName: string, value: number, unit?: string) => {
  trackEvent('performance_metric', {
    metric_name: metricName,
    metric_value: value,
    metric_unit: unit,
  });
};

export const trackCustomEvent = (eventName: string, eventData: Record<string, any>) => {
  trackEvent(eventName, eventData);
};
