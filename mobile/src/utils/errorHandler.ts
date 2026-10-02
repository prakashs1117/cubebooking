/**
 * Error Handler Utility
 * Provides user-friendly error messages from API errors.
 * Works with both the fetch-based apiClient and legacy AxiosError shapes.
 */

import { ApiErrorResponse } from '@/types/auth.types';

// Shape thrown by our fetch-based apiClient
interface ApiClientError extends Error {
  response?: {
    data: unknown;
    status: number;
  };
}

function isApiClientError(error: unknown): error is ApiClientError {
  return (
    error instanceof Error &&
    'response' in error &&
    typeof (error as any).response?.status === 'number'
  );
}

function getStatus(error: unknown): number | undefined {
  if (isApiClientError(error)) return error.response?.status;
  // Legacy AxiosError fallback
  if (error instanceof Error && (error as any).response?.status) {
    return (error as any).response.status;
  }
  return undefined;
}

function getResponseData(error: unknown): ApiErrorResponse | undefined {
  if (isApiClientError(error)) return error.response?.data as ApiErrorResponse;
  if (error instanceof Error && (error as any).response?.data) {
    return (error as any).response.data as ApiErrorResponse;
  }
  return undefined;
}

/**
 * Get user-friendly error message i18n key from error object
 */
export const getErrorMessage = (error: unknown): string => {
  if (isApiClientError(error) || (error instanceof Error && (error as any).response)) {
    const apiError = getResponseData(error);
    const status = getStatus(error);

    if (apiError?.message) return apiError.message;
    if (apiError?.error) return apiError.error;

    switch (status) {
      case 400: return 'errors.http.badRequest';
      case 401: return 'errors.api.invalidCredentials';
      case 403: return 'errors.http.forbidden';
      case 404: return 'errors.http.notFound';
      case 409: return 'errors.api.emailAlreadyRegistered';
      case 429: return 'errors.http.tooManyRequests';
      case 500: return 'errors.http.internalServerError';
      case 503: return 'errors.http.serviceUnavailable';
    }

    if (error.message === 'Network Error') return 'errors.api.networkError';
    return error.message || 'errors.api.unknown';
  }

  if (error instanceof Error) return error.message;
  return 'errors.api.unknown';
};

/**
 * Get specific auth error message i18n key
 */
export const getAuthErrorMessage = (error: unknown, context?: string): string => {
  const status = getStatus(error);

  if (context === 'login') {
    if (status === 401) return 'errors.api.invalidCredentials';
    if (status === 403) return 'errors.http.forbidden';
  }
  if (context === 'register') {
    if (status === 409) return 'errors.api.emailAlreadyRegistered';
  }
  if (context === 'forgot-password') {
    if (status === 404) return 'errors.api.userNotFound';
  }
  if (context === 'reset-password') {
    if (status === 401) return 'errors.api.invalidResetCode';
  }
  if (context === 'verify-otp') {
    if (status === 401) return 'errors.api.invalidVerificationCode';
  }
  if (context === 'delete-account') {
    if (status === 401 || status === 403) return 'settings.deleteAccountError';
  }

  return getErrorMessage(error);
};

/**
 * Check if error is network related
 */
export const isNetworkError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message === 'Network Error' ||
      (error as any).code === 'ECONNABORTED' ||
      (error as any).code === 'ERR_NETWORK'
    );
  }
  return false;
};

/**
 * Check if error is authentication related (401, 403)
 */
export const isAuthError = (error: unknown): boolean => {
  const status = getStatus(error);
  return status === 401 || status === 403;
};
