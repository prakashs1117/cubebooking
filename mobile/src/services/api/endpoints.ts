/**
 * API Endpoint Constants
 * Single source of truth for all API endpoint strings.
 * Import from here — never hardcode endpoint strings in service files.
 */

export const ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    SSO_REDIRECT: '/auth/sso/redirect',
    SSO_EXCHANGE: '/auth/sso/exchange',
    // Legacy My M Safety endpoints (unused)
    CAPTCHA: '/user/captcha',
    REGISTER_START: '/user/registration',
    REGISTER_VERIFY: '/user/registration/code',
    FORGOT_PASSWORD: '/user/password/forgot',
    RESET_PASSWORD: '/user/auth/password/reset',
    VERIFY_OTP: '/user/auth/verify-otp',
    RESEND_OTP: '/user/auth/resend-otp',
  },

  USER: {
    PROFILE: '/me/profile',
    DELETE: '/user/delete',
  },

  EVENTS: {
    LIST: '/events',
    DETAIL: (slug: string) => `/events/${slug}`,
    SEARCH: (query: string, page = 1, limit = 10) =>
      `/events?page=${page}&limit=${limit}&search=${encodeURIComponent(query)}`,
  },

  NOTIFICATIONS: {
    LIST: (page = 1, limit = 20) =>
      `/notifications?page=${page}&limit=${limit}`,
  },

  FAVORITES: {
    LISTS: '/favorites-lists',
    LIST_BY_ID: (id: number) => `/favorites-lists/${id}`,
    BULK_CREATE: '/favorites-lists/all',
    ARTICLES: (listId: number) => `/favorites-lists/${listId}/favorites`,
    REMOVE_ARTICLE: (listId: number, articleId: number) =>
      `/favorites-lists/${listId}/favorites/${articleId}`,
  },

  POSTS: {
    LIST: '/posts',
    DETAIL: (id: string) => `/posts/${id}`,
    LIKE: (id: string) => `/posts/${id}/like`,
    SHARE: (id: string) => `/posts/${id}/share`,
    COMMENTS: (id: string) => `/posts/${id}/comments`,
    COMMENT: (postId: string, commentId: string) => `/posts/${postId}/comments/${commentId}`,
  },

  MARKETPLACE: {
    LIST: '/marketplace',
    MINE: '/marketplace/mine',
    DETAIL: (id: string) => `/marketplace/${id}`,
    FEEDBACK: (id: string) => `/marketplace/${id}/feedback`,
    STATUS: (id: string) => `/marketplace/${id}/status`,
  },

  VERSION: {
    CHECK: '/app-version',
  },

  DASHBOARD: '/dashboard',

  OFFICES: {
    LIST:    '/offices',
    NEARBY:  (lat: number, lng: number) => `/offices/nearby?lat=${lat}&lng=${lng}`,
    BY_ID:   (id: string) => `/offices/${id}`,
  },

  FEATURE_FLAGS: {
    LIST:      '/feature-flags',
    BY_KEY:    (key: string) => `/feature-flags/${key}`,
  },

  PLATFORM_CONFIG: {
    GET: '/platform-config',
  },

  ONBOARDING: {
    GUIDE: '/onboarding/guide',
  },

  SETTINGS: {
    DETAIL: '/settings',
  },

  FAQ: {
    LIST: '/faqs',
  },

  FEEDBACK: {
    SUBMIT: '/feedback',
    MY_STATUS: '/feedback/my-status',
  },

  FOOD: {
    MENU:           '/food/menu',
    MEALS:          '/food/meals',
    ORDERS:         '/food/orders',
    ORDERS_BY_DATE: (dateKey: string) => `/food/orders/date/${dateKey}`,
    ORDERS_BULK:    '/food/orders/bulk',
    ORDER_CANCEL:   (id: string) => `/food/orders/${id}/cancel`,
    ORDER_RATE:     (id: string) => `/food/orders/${id}/rate`,
    ORDER_PASS:     (id: string) => `/food/orders/${id}/pass`,
    ORDER_FEEDBACK: (id: string) => `/food/orders/${id}/feedback`,
    ORDER_CHECKIN:  (id: string) => `/food/orders/${id}/checkin`,
    SEED:           '/food/seed',
    MEALS_ALL:                '/food/meals/all',
    MEALS_BY_DATE:            (dateKey: string) => `/food/meals/date/${dateKey}`,
    MEAL_CREATE:              '/food/meals',
    MEAL_TOGGLE_AVAILABILITY: (id: string) => `/food/meals/${id}/availability`,
    DISHES:                   '/food/dishes',
    MEAL_RATES:               '/food/rates',
  },
} as const;

// Atlas API endpoints (separate base URL — see atlasClient.ts)
export const ATLAS_ENDPOINTS = {
  SEARCH: '/v4/safetydata/searchVerbose/PUBLIC/EU/EN',
} as const;
