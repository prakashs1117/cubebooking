/**
 * API Error Handler Tests
 */

import { AxiosError } from 'axios';

// i18n mock returns the key itself, so we can assert on translation keys or fallback values
jest.mock('@localization/i18n', () => ({
  __esModule: true,
  default: {
    t: (key: string) => key,
  },
}));

import {
  parseApiError,
  getLocalizedErrorMessage,
  formatErrorMessage,
  handleApiError,
  getErrorTitle,
} from '@utils/apiErrorHandler';

function makeAxiosError(
  status: number,
  url: string,
  responseData?: Record<string, any>,
): AxiosError {
  const err = new AxiosError('Request failed');
  (err as any).isAxiosError = true;
  err.config = { url } as any;
  err.response = {
    status,
    data: responseData ?? {},
    headers: {},
    config: {} as any,
    statusText: '',
  };
  return err;
}

describe('parseApiError', () => {
  it('returns code 0 for null/undefined', () => {
    const result = parseApiError(null);
    expect(result.code).toBe(0);
    expect(result.message).toBe('errors.api.unknown');
  });

  it('parses axios error with status and response message', () => {
    const err = makeAxiosError(401, '/api/v1/auth/login', {
      message: 'Invalid token',
    });
    const result = parseApiError(err);
    expect(result.code).toBe(401);
    expect(result.message).toBe('Invalid token');
    expect(result.endpoint).toBe('/auth/login');
    expect(result.httpStatus).toBe('Unauthorized');
  });

  it('parses axios error with response error field', () => {
    const err = makeAxiosError(409, '/api/v1/auth/register/start', {
      error: 'Duplicate email',
    });
    const result = parseApiError(err);
    expect(result.code).toBe(409);
    expect(result.message).toBe('Duplicate email');
  });

  it('parses plain Error', () => {
    const result = parseApiError(new Error('plain error'));
    expect(result.code).toBe(0);
    expect(result.message).toBe('plain error');
  });

  it('parses string error', () => {
    const result = parseApiError('string error');
    expect(result.code).toBe(0);
    expect(result.message).toBe('string error');
  });

  it('returns unknown for unknown type', () => {
    const result = parseApiError(42);
    expect(result.code).toBe(0);
    expect(result.message).toBe('errors.api.unknown');
  });

  it('handles axios error with no response (network error)', () => {
    const err = new AxiosError('Network Error');
    (err as any).isAxiosError = true;
    const result = parseApiError(err);
    expect(result.code).toBe(0);
    expect(result.message).toBe('Network Error');
  });

  it('extracts endpoint from URL with query params', () => {
    const err = makeAxiosError(404, '/api/v1/auth/verify-otp?token=abc');
    const result = parseApiError(err);
    expect(result.endpoint).toBe('/auth/verify-otp');
  });

  it('uses Unknown Error for unmapped status codes', () => {
    const err = makeAxiosError(418, '/api/v1/some/path');
    const result = parseApiError(err);
    expect(result.httpStatus).toBe('Unknown Error');
  });

  it('parses login error with invalid credentials', () => {
    const err = makeAxiosError(401, '/api/v1/user/auth/login', {
      error: 'Invalid email or password',
    });
    const result = parseApiError(err);
    expect(result.code).toBe(401);
    expect(result.message).toBe('Invalid email or password');
    expect(result.endpoint).toBe('/user/auth/login');
  });

  it('extracts message from msg field when present', () => {
    const err = makeAxiosError(400, '/api/v1/auth/login', {
      msg: 'Wrong credentials format',
    });
    const result = parseApiError(err);
    expect(result.message).toBe('Wrong credentials format');
  });

  it('handles 403 login error with empty response body', () => {
    const err = makeAxiosError(403, '/api/v1/user/auth/login', {});
    const result = parseApiError(err);
    expect(result.code).toBe(403);
    expect(result.endpoint).toBe('/user/auth/login');
    expect(result.httpStatus).toBe('Forbidden');
    // Empty response body, falls back to axios error message
    expect(result.message).toBe('Request failed');
  });

  it('handles 403 login error with null response body', () => {
    const err = new AxiosError('Request failed');
    (err as any).isAxiosError = true;
    err.config = { url: '/api/v1/user/auth/login' } as any;
    err.response = {
      status: 403,
      data: null,
      headers: {},
      config: {} as any,
      statusText: '',
    };
    const result = parseApiError(err);
    expect(result.code).toBe(403);
    expect(result.message).toBe('Request failed');
  });
});

describe('getLocalizedErrorMessage', () => {
  it('falls back to server message when all translation keys are untranslated', () => {
    // i18n.t mock returns the key itself (same as key) so both endpoint-specific
    // and generic lookups are treated as "not translated" → falls through to message
    const msg = getLocalizedErrorMessage({
      code: 401,
      endpoint: '/auth/login',
      message: 'Server msg',
    });
    expect(msg).toBe('Server msg');
  });

  it('falls back to message when no mapping exists for code', () => {
    const msg = getLocalizedErrorMessage({
      code: 418,
      message: 'I am a teapot',
    });
    expect(msg).toBe('I am a teapot');
  });

  it('falls back to errors.api.unknown when message is empty', () => {
    const msg = getLocalizedErrorMessage({ code: 0, message: '' });
    expect(msg).toBe('errors.api.unknown');
  });

  it('falls back to errors.api.unknown when message is whitespace', () => {
    const msg = getLocalizedErrorMessage({ code: 0, message: '   ' });
    expect(msg).toBe('errors.api.unknown');
  });

  it('uses endpoint-specific mapping for 403 login error with empty message', () => {
    const msg = getLocalizedErrorMessage({
      code: 403,
      endpoint: '/auth/login',
      message: '',
    });
    // /auth/login 403 maps to 'errors.api.accountDisabled'
    // In mock i18n, it returns the key itself
    expect(msg).toBe('errors.api.accountDisabled');
  });

  it('uses generic HTTP mapping when endpoint has no specific mapping', () => {
    const msg = getLocalizedErrorMessage({
      code: 403,
      endpoint: '/some/unknown/endpoint',
      message: '',
    });
    // No endpoint-specific mapping, falls back to generic 403 mapping
    expect(msg).toBe('errors.http.forbidden');
  });

  it('prefers server message over endpoint mapping when both available', () => {
    const msg = getLocalizedErrorMessage({
      code: 403,
      endpoint: '/auth/login',
      message: 'Account has been locked',
    });
    expect(msg).toBe('Account has been locked');
  });

  it('handles 403 empty response on login endpoint', () => {
    const msg = getLocalizedErrorMessage({
      code: 403,
      endpoint: '/auth/login',
      message: 'Request failed',
    });
    // Server returned generic 'Request failed' message, but we have endpoint mapping
    // Since message is non-empty, we use it (priority 1)
    expect(msg).toBe('Request failed');
  });

  it('maps 403 on /user/auth/login endpoint to account disabled', () => {
    const msg = getLocalizedErrorMessage({
      code: 403,
      endpoint: '/user/auth/login',
      message: '',
    });
    // /user/auth/login 403 maps to 'errors.api.accountDisabled'
    expect(msg).toBe('errors.api.accountDisabled');
  });
});

describe('formatErrorMessage', () => {
  it('appends error code when code and httpStatus exist', () => {
    const result = formatErrorMessage({
      code: 500,
      httpStatus: 'Internal Server Error',
      message: 'Server error',
    });
    expect(result).toContain('errors.errorCode');
    expect(result).toContain('500');
    expect(result).toContain('Internal Server Error');
  });

  it('returns just the localized message when no code', () => {
    const result = formatErrorMessage({ code: 0, message: 'plain error' });
    expect(result).toBe('plain error');
  });
});

describe('handleApiError', () => {
  it('returns a string for any error', () => {
    const result = handleApiError(new Error('oops'));
    expect(typeof result).toBe('string');
  });

  it('returns a string for axios errors', () => {
    const err = makeAxiosError(500, '/api/v1/events');
    const result = handleApiError(err);
    expect(typeof result).toBe('string');
  });
});

describe('getErrorTitle', () => {
  it('includes error code when present', () => {
    const result = getErrorTitle({ code: 404, message: 'Not found' });
    expect(result).toContain('404');
  });

  it('returns generic error when code is 0', () => {
    const result = getErrorTitle({ code: 0, message: 'unknown' });
    expect(result).toBe('common.error');
  });
});
