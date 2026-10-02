/**
 * Authentication Service — EC2 Backend
 *
 * Login endpoint: POST /auth/login
 * Returns: { success, data: { user: { id, email, firstName, lastName, role }, accessToken, refreshToken } }
 */

import apiClient from './client';
import { ENDPOINTS } from './endpoints';
import {
  LoginRequest,
  LoginResponse,
  CaptchaResponse,
  RegisterStartRequest,
  RegisterStartResponse,
  RegisterVerifyRequest,
  RegisterVerifyResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  ForgotPasswordResponse,
  ResetPasswordRequest,
  ResetPasswordResponse,
  OTPVerificationRequest,
  OTPVerificationResponse,
  ResendOTPRequest,
  ResendOTPResponse,
  User,
} from '@/types/auth.types';

// Raw shape from POST /auth/login on EC2 backend
interface EC2LoginRaw {
  success: boolean;
  data: {
    user: {
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
    };
    accessToken: string;
    refreshToken: string;
  };
}

function normalizeEC2LoginResponse(raw: EC2LoginRaw): LoginResponse {
  if (!raw?.data) {
    throw new Error('Invalid login response from server');
  }
  const { user: apiUser, accessToken, refreshToken } = raw.data;
  const user: User = {
    id: apiUser.id,
    email: apiUser.email,
    name: `${apiUser.firstName} ${apiUser.lastName}`.trim(),
    position: apiUser.role ?? null,
    country: null,
    alternateEmail: null,
    username: apiUser.email,
  };
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    token: accessToken,
    accessToken,
    refreshToken,
    expiresIn: 900,
    user,
  };
}

export const authService = {
  fetchCaptcha: async (): Promise<CaptchaResponse> => {
    return {
      image: 'data:image/png;base64,',
      identifier: 'mock-id',
    };
  },

  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await apiClient.post<EC2LoginRaw>(ENDPOINTS.AUTH.LOGIN, {
      email: credentials.email,
      password: credentials.password,
    });
    return normalizeEC2LoginResponse(response.data);
  },

  registerStart: async (
    payload: RegisterStartRequest,
  ): Promise<RegisterStartResponse> => {
    // Registration removed — My M Safety API no longer available
    console.warn('[auth.service] registerStart: API removed, returning mock');
    return { message: 'Registration not available', status: false };
  },

  registerVerify: async (
    payload: RegisterVerifyRequest,
  ): Promise<LoginResponse> => {
    // Registration removed — My M Safety API no longer available
    console.warn('[auth.service] registerVerify: API removed, throwing error');
    throw new Error('REGISTRATION_NOT_AVAILABLE');
  },

  refreshToken: async (
    payload: RefreshTokenRequest,
  ): Promise<RefreshTokenResponse> => {
    const response = await apiClient.post<{
      success: boolean;
      data: { accessToken: string; refreshToken: string };
    }>(ENDPOINTS.AUTH.REFRESH, { refreshToken: payload.refreshToken });
    return {
      accessToken: response.data.data.accessToken,
      refreshToken: response.data.data.refreshToken,
      expiresIn: 900,
    };
  },

  forgotPassword: async (email: string): Promise<ForgotPasswordResponse> => {
    // Password reset removed — My M Safety API no longer available
    console.warn('[auth.service] forgotPassword: API removed, returning mock');
    return { email, message: 'Password reset not available' };
  },

  resetPassword: async (
    payload: ResetPasswordRequest,
  ): Promise<ResetPasswordResponse> => {
    // Password reset removed — My M Safety API no longer available
    console.warn('[auth.service] resetPassword: API removed, throwing error');
    throw new Error('PASSWORD_RESET_NOT_AVAILABLE');
  },

  verifyOTP: async (
    payload: OTPVerificationRequest,
  ): Promise<OTPVerificationResponse> => {
    // OTP verification removed — My M Safety API no longer available
    console.warn('[auth.service] verifyOTP: API removed, throwing error');
    throw new Error('OTP_VERIFICATION_NOT_AVAILABLE');
  },

  resendOTP: async (payload: ResendOTPRequest): Promise<ResendOTPResponse> => {
    // OTP resend removed — My M Safety API no longer available
    console.warn('[auth.service] resendOTP: API removed, throwing error');
    throw new Error('OTP_RESEND_NOT_AVAILABLE');
  },

  /**
   * Exchange a short-lived SSO one-time code for app tokens.
   *
   * Called after the mobile deep link fires (ocbapp://auth/callback?code=xxx).
   * The backend's /auth/sso/exchange endpoint validates the code, deletes it
   * (single-use), and returns a fresh token pair.
   *
   * @param code - One-time code from the deep link query param
   * @returns User object + token pair ready for storage
   *
   * To reuse in another app: ensure the backend has POST /auth/sso/exchange
   * returning { success, data: { user, accessToken, refreshToken } }
   */
  ssoExchange: async (code: string): Promise<{ user: User; accessToken: string; refreshToken: string }> => {
    const response = await apiClient.post<{
      success: boolean;
      data: {
        user: {
          id: string;
          email: string;
          firstName: string;
          lastName: string;
          role: string;
        };
        accessToken: string;
        refreshToken: string;
      };
    }>(ENDPOINTS.AUTH.SSO_EXCHANGE, { code });

    const { user: apiUser, accessToken, refreshToken } = response.data.data;
    const user: User = {
      id: apiUser.id,
      email: apiUser.email,
      name: `${apiUser.firstName} ${apiUser.lastName}`.trim(),
      position: apiUser.role ?? null,
      country: null,
      alternateEmail: null,
      username: apiUser.email,
    };
    return { user, accessToken, refreshToken };
  },

  logout: async (): Promise<void> => Promise.resolve(),
};
