import { useEffect, useDebugValue } from 'react';
import { useLocation } from 'react-router-dom';
import { initAnalytics, trackPageView, trackScreenView } from '../services/analyticsService';

export const useAnalyticsInit = () => {
  useDebugValue('analytics', () => 'useAnalyticsInit: initialized')
  useEffect(() => {
    initAnalytics();
  }, []);
};

export const usePageTracking = () => {
  const location = useLocation();
  useDebugValue(location.pathname, (p) => `usePageTracking: ${p}`)

  useEffect(() => {
    const pathName = location.pathname;
    const pageTitle = getPageTitle(pathName);

    trackPageView(pathName, pageTitle);
    trackScreenView(pageTitle, 'screen');
  }, [location.pathname]);
};

const getPageTitle = (pathname: string): string => {
  const pathMap: Record<string, string> = {
    '/home': 'Home',
    '/bookings': 'My Bookings',
    '/bookings/:id': 'Booking Details',
    '/kit': 'Kit & Equipment',
    '/profile': 'Profile',
    '/book': 'Start Booking',
    '/book/programs': 'Select Program',
    '/book/time': 'Select Time',
    '/book/details': 'Booking Details',
    '/book/review': 'Review Booking',
    '/book/confirmed': 'Booking Confirmed',
    '/signin': 'Sign In',
    '/forgot-password': 'Forgot Password',
  };

  for (const [path, title] of Object.entries(pathMap)) {
    if (path === pathname || pathname.includes(path.split(':')[0])) {
      return title;
    }
  }

  return pathname;
};
