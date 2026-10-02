/**
 * API Error Handler
 * Maps HTTP status codes and API endpoints to localized error messages
 */

// AxiosError import removed — using duck-typed error shape from fetch-based client
import i18n from '@localization/i18n';

export interface ApiError {
  code: number;
  message: string;
  endpoint?: string;
  httpStatus?: string;
  originalError?: any;
}

/**
 * HTTP Status Code to human-readable name mapping
 */
const HTTP_STATUS_NAMES: Record<number, string> = {
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  409: 'Conflict',
  422: 'Unprocessable Entity',
  429: 'Too Many Requests',
  500: 'Internal Server Error',
  502: 'Bad Gateway',
  503: 'Service Unavailable',
  504: 'Gateway Timeout',
};

/**
 * Endpoint-specific error mappings
 * Maps HTTP status codes for specific endpoints to translation keys
 */
const ENDPOINT_ERROR_MAP: Record<string, Record<number, string>> = {
  '/auth/register/start': {
    409: 'errors.api.emailAlreadyRegistered',
    400: 'errors.api.invalidRegistrationData',
    422: 'errors.api.validationFailed',
  },
  '/auth/register/verify': {
    400: 'errors.api.invalidVerificationCode',
    404: 'errors.api.verificationCodeExpired',
    410: 'errors.api.verificationCodeExpired',
  },
  '/auth/login': {
    401: 'errors.api.invalidCredentials',
    404: 'errors.api.userNotFound',
    403: 'errors.api.accountDisabled',
  },
  '/user/auth/login': {
    401: 'errors.api.invalidCredentials',
    404: 'errors.api.userNotFound',
    403: 'errors.api.accountDisabled',
  },
  '/auth/password/forgot': {
    404: 'errors.api.emailNotFound',
    429: 'errors.api.tooManyRequests',
  },
  '/auth/password/reset': {
    400: 'errors.api.invalidResetCode',
    404: 'errors.api.resetCodeExpired',
    410: 'errors.api.resetCodeExpired',
  },
  '/auth/verify-otp': {
    400: 'errors.api.invalidOTP',
    404: 'errors.api.otpExpired',
    410: 'errors.api.otpExpired',
    429: 'errors.api.tooManyOTPAttempts',
  },
  '/auth/resend-otp': {
    429: 'errors.api.tooManyResendRequests',
  },
};

/**
 * Generic HTTP status code error mappings
 * Used when no endpoint-specific mapping is found
 */
const GENERIC_ERROR_MAP: Record<number, string> = {
  400: 'errors.http.badRequest',
  401: 'errors.http.unauthorized',
  403: 'errors.http.forbidden',
  404: 'errors.http.notFound',
  409: 'errors.http.conflict',
  422: 'errors.http.unprocessableEntity',
  429: 'errors.http.tooManyRequests',
  500: 'errors.http.internalServerError',
  502: 'errors.http.badGateway',
  503: 'errors.http.serviceUnavailable',
  504: 'errors.http.gatewayTimeout',
};

/**
 * Get endpoint path from full URL
 */
function getEndpointPath(url?: string): string | undefined {
  if (!url) return undefined;

  try {
    // Remove base URL and query params
    const path = url.split('?')[0];
    // Extract path after /api/v1
    const match = path.match(/\/api\/v\d+(.*)/) || path.match(/\/api(.*)/);
    return match ? match[1] : path;
  } catch {
    return undefined;
  }
}

/**
 * Parse API error from Axios error
 */
export function parseApiError(error: unknown): ApiError {
  if (!error) {
    return {
      code: 0,
      message: i18n.t('errors.api.unknown'),
    };
  }

  // Handle API client errors (fetch-based, duck-typed like AxiosError)
  if (error instanceof Error && (error as any).response) {
    const apiError = error as any;
    const statusCode = apiError.response?.status || 0;
    const endpoint = getEndpointPath(apiError.config?.url);
    const responseData = apiError.response?.data as any;

    // Get HTTP status name
    const httpStatus = HTTP_STATUS_NAMES[statusCode] || 'Unknown Error';

    // Try to get error message from response (check multiple possible fields)
    let serverMessage =
      responseData?.message ||
      responseData?.error ||
      responseData?.msg ||
      (typeof responseData === 'string' ? responseData : undefined);

    // If response data is empty object or null/undefined, server returned no body
    const hasEmptyResponse =
      !serverMessage &&
      (responseData === null ||
        responseData === undefined ||
        (typeof responseData === 'object' && Object.keys(responseData).length === 0));

    // Use HTTP status message for empty responses (will be localized later)
    const finalMessage =
      serverMessage || apiError.message || (hasEmptyResponse ? undefined : `HTTP ${statusCode}`);

    return {
      code: statusCode,
      message: finalMessage || '',
      endpoint,
      httpStatus,
      originalError: apiError,
    };
  }

  // Handle standard Error objects
  if (error instanceof Error) {
    return {
      code: 0,
      message: error.message,
    };
  }

  // Handle string errors
  if (typeof error === 'string') {
    return {
      code: 0,
      message: error,
    };
  }

  // Unknown error type
  return {
    code: 0,
    message: i18n.t('errors.api.unknown'),
  };
}

/**
 * Get localized error message based on error code and endpoint
 *
 * Priority:
 * 1. If server returned a non-empty message → use it (user-friendly server msg)
 * 2. Endpoint-specific mapped translation (for known endpoints/status codes)
 * 3. Generic HTTP status code translation
 * 4. Ultimate fallback to unknown error
 */
export function getLocalizedErrorMessage(apiError: ApiError): string {
  const { code, endpoint, message } = apiError;

  // 1. Prefer non-empty server message if available
  if (message && typeof message === 'string' && message.trim()) {
    return message;
  }

  // 2. Try endpoint-specific error message (e.g., /auth/login 403 → account disabled)
  if (endpoint && ENDPOINT_ERROR_MAP[endpoint]?.[code]) {
    const translationKey = ENDPOINT_ERROR_MAP[endpoint][code];
    return i18n.t(translationKey);
  }

  // 3. Try generic HTTP status code message
  if (GENERIC_ERROR_MAP[code]) {
    const translationKey = GENERIC_ERROR_MAP[code];
    return i18n.t(translationKey);
  }

  // 4. Ultimate fallback
  const fallback = i18n.t('errors.api.unknown');
  return fallback || 'An error occurred. Please try again.';
}

/**
 * Format error message with HTTP status code
 */
export function formatErrorMessage(apiError: ApiError): string {
  const localizedMessage = getLocalizedErrorMessage(apiError);

  // If we have a status code, show it with the HTTP status name
  if (apiError.code && apiError.httpStatus) {
    return `${localizedMessage}\n\n${i18n.t('errors.errorCode')}: ${
      apiError.code
    } (${apiError.httpStatus})`;
  }

  return localizedMessage;
}

/**
 * Main error handler function
 * Parses error and returns formatted localized message
 */
export function handleApiError(error: unknown): string {
  const apiError = parseApiError(error);
  return formatErrorMessage(apiError);
}

/**
 * Get short error title for Alert dialogs
 */
export function getErrorTitle(apiError: ApiError): string {
  if (apiError.code) {
    return `${i18n.t('common.error')} ${apiError.code}`;
  }
  return i18n.t('common.error');
}
