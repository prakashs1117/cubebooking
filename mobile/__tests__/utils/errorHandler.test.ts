/**
 * Error Handler Utility Tests
 */

import { AxiosError } from 'axios';
import {
  getErrorMessage,
  getAuthErrorMessage,
  isNetworkError,
  isAuthError,
} from '@utils/errorHandler';

// Helper to build a minimal AxiosError
function makeAxiosError(
  status?: number,
  apiError?: string,
  message = 'Request failed',
  code?: string,
): AxiosError {
  const err = new AxiosError(message);
  (err as any).isAxiosError = true;
  err.code = code;
  if (status !== undefined) {
    err.response = {
      status,
      data: apiError ? { error: apiError } : {},
      headers: {},
      config: {} as any,
      statusText: '',
    };
  }
  return err;
}

describe('getErrorMessage', () => {
  it('returns api error string when present', () => {
    const err = makeAxiosError(401, 'Custom API error');
    expect(getErrorMessage(err)).toBe('Custom API error');
  });

  it('returns 400 message for bad request', () => {
    expect(getErrorMessage(makeAxiosError(400))).toBe(
      'Invalid request. Please check your input.',
    );
  });

  it('returns 401 message for unauthorized', () => {
    expect(getErrorMessage(makeAxiosError(401))).toBe(
      'Invalid credentials. Please try again.',
    );
  });

  it('returns 403 message for forbidden', () => {
    expect(getErrorMessage(makeAxiosError(403))).toBe(
      'Access denied. Please verify your email.',
    );
  });

  it('returns 404 message for not found', () => {
    expect(getErrorMessage(makeAxiosError(404))).toBe('Resource not found.');
  });

  it('returns 409 message for conflict', () => {
    expect(getErrorMessage(makeAxiosError(409))).toBe(
      'This email or username is already registered.',
    );
  });

  it('returns 429 message for too many requests', () => {
    expect(getErrorMessage(makeAxiosError(429))).toBe(
      'Too many requests. Please try again later.',
    );
  });

  it('returns 500 message for server error', () => {
    expect(getErrorMessage(makeAxiosError(500))).toBe(
      'Server error. Please try again later.',
    );
  });

  it('returns 503 message for service unavailable', () => {
    expect(getErrorMessage(makeAxiosError(503))).toBe(
      'Service unavailable. Please try again later.',
    );
  });

  it('returns network error message for Network Error', () => {
    const err = makeAxiosError(undefined, undefined, 'Network Error');
    expect(getErrorMessage(err)).toBe(
      'Network error. Please check your internet connection.',
    );
  });

  it('returns timeout message for ECONNABORTED', () => {
    const err = makeAxiosError(undefined, undefined, 'timeout', 'ECONNABORTED');
    expect(getErrorMessage(err)).toBe('Request timeout. Please try again.');
  });

  it('falls back to err.message for unknown axios status', () => {
    const err = makeAxiosError(418, undefined, 'I am a teapot');
    expect(getErrorMessage(err)).toBe('I am a teapot');
  });

  it('handles plain Error', () => {
    expect(getErrorMessage(new Error('plain error'))).toBe('plain error');
  });

  it('returns fallback for unknown types', () => {
    expect(getErrorMessage('string error')).toBe(
      'An unexpected error occurred',
    );
    expect(getErrorMessage(42)).toBe('An unexpected error occurred');
    expect(getErrorMessage(null)).toBe('An unexpected error occurred');
  });
});

describe('getAuthErrorMessage', () => {
  it('returns base message when no context match', () => {
    const err = makeAxiosError(500);
    expect(getAuthErrorMessage(err)).toBe(
      'Server error. Please try again later.',
    );
  });

  it('returns plain error message (not status code string) without special login branch', () => {
    const err = makeAxiosError(404);
    const msg = getAuthErrorMessage(err, 'login');
    expect(msg).toBe('Resource not found.');
  });

  it('returns register conflict message', () => {
    const err = makeAxiosError(409);
    expect(getAuthErrorMessage(err, 'register')).toBe(
      'This email or username is already registered.',
    );
  });

  it('returns forgot-password not found message', () => {
    const err = makeAxiosError(404);
    // base message is 'Resource not found.' which doesn't include '404'
    // so the context branch won't fire — returns base message
    expect(getAuthErrorMessage(err, 'forgot-password')).toBe(
      'Resource not found.',
    );
  });

  it('returns base message for non-matching context', () => {
    const err = makeAxiosError(400);
    expect(getAuthErrorMessage(err, 'verify-otp')).toBe(
      'Invalid request. Please check your input.',
    );
  });

  it('returns base message with no context', () => {
    expect(getAuthErrorMessage(new Error('oops'))).toBe('oops');
  });
});

describe('isNetworkError', () => {
  it('returns true for Network Error message', () => {
    expect(
      isNetworkError(makeAxiosError(undefined, undefined, 'Network Error')),
    ).toBe(true);
  });

  it('returns true for ECONNABORTED code', () => {
    expect(
      isNetworkError(
        makeAxiosError(undefined, undefined, 'timeout', 'ECONNABORTED'),
      ),
    ).toBe(true);
  });

  it('returns true for ERR_NETWORK code', () => {
    const err = makeAxiosError(
      undefined,
      undefined,
      'net error',
      'ERR_NETWORK',
    );
    expect(isNetworkError(err)).toBe(true);
  });

  it('returns false for non-network axios error', () => {
    expect(isNetworkError(makeAxiosError(404))).toBe(false);
  });

  it('returns false for plain Error', () => {
    expect(isNetworkError(new Error('oops'))).toBe(false);
  });

  it('returns false for non-error values', () => {
    expect(isNetworkError(null)).toBe(false);
    expect(isNetworkError('string')).toBe(false);
  });
});

describe('isAuthError', () => {
  it('returns true for 401', () => {
    expect(isAuthError(makeAxiosError(401))).toBe(true);
  });

  it('returns true for 403', () => {
    expect(isAuthError(makeAxiosError(403))).toBe(true);
  });

  it('returns false for other status codes', () => {
    expect(isAuthError(makeAxiosError(404))).toBe(false);
    expect(isAuthError(makeAxiosError(500))).toBe(false);
  });

  it('returns false for non-axios error', () => {
    expect(isAuthError(new Error('oops'))).toBe(false);
    expect(isAuthError(null)).toBe(false);
  });
});
