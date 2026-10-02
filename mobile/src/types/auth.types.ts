/**
 * Authentication Type Definitions
 */

// ─── My M Safety API shapes ─────────────────────────────────────────────────

// User object — matches full My M Safety API response
export interface User {
  id: string;
  email: string;
  name: string;
  position: string | null;
  country: string | null;
  lockCount?: number;
  regEmailSentCount?: number;
  enableRegEmailSentCaptcha?: boolean;
  enableLockCountCaptcha?: boolean;
  alternateEmail: string | null;
  username?: string;
}

// Login request — My M Safety API POST /user/auth/login
export interface LoginRequest {
  email: string;
  password: string;
  recaptcha?: string; // Required only when CAPTCHA is triggered (3+ failures)
  identifier?: string; // CAPTCHA session ID (cap-sid header)
}

// Login response — My M Safety API { id, email, name, position, token }
export interface LoginResponse {
  id: string;
  email: string;
  name: string;
  position?: string;
  token: string; // Bearer JWT — no refresh token in My M Safety API
  // Normalized fields set by AuthContext for compatibility:
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  user: User;
}

// Captcha response — GET /user/captcha
export interface CaptchaResponse {
  image: string; // base64 data URI or image URL
  identifier: string; // session ID, sent back with registration
}

// Registration request/response
export interface RegisterStartRequest {
  email: string;
  name: string; // full name (was: username)
  password: string;
  agreement: boolean; // must be true
  recaptchaToken: string; // user's typed captcha answer
  identifier: string; // captcha session ID from CaptchaResponse
}

export interface RegisterStartResponse {
  message: string | null;
  status?: boolean;
  email?: string;
}

export interface RegisterVerifyRequest {
  email: string;
  code: string;
}

// Raw response from POST /user/registration/code
export interface RegisterVerifyResponse {
  id: number;
  email: string;
  name: string;
  position: string | null;
  token: string;
  country: string | null;
  lockCount: number;
  regEmailSentCount: number;
  enableRegEmailSentCaptcha: boolean;
  enableLockCountCaptcha: boolean;
  alternateEmail: string | null;
}

// Refresh token request/response
export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

// Forgot password request/response
export interface ForgotPasswordRequest {
  email: string;
}

export interface ForgotPasswordResponse {
  message: string;
  email: string;
}

// Reset password request/response
export interface ResetPasswordRequest {
  email: string;
  code: string;
  newPassword: string;
}

export interface ResetPasswordResponse {
  message: string;
}

// OTP verification request/response
export interface OTPVerificationRequest {
  email: string;
  code: string;
  type: 'registration' | 'password_reset';
}

export interface OTPVerificationResponse {
  message: string;
  verified: boolean;
}

// Resend OTP request/response
export interface ResendOTPRequest {
  email: string;
  type: 'registration' | 'password_reset';
}

export interface ResendOTPResponse {
  message: string;
}

// API error response
export interface ApiErrorResponse {
  error: string;
  details?: any[];
  statusCode?: number;
}

// Auth state
export interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isGuest: boolean; // true when user chose "Continue Without Registering"
  error: string | null;
}

// Auth context type
export interface AuthContextType extends AuthState {
  sessionExpired: boolean;
  fetchCaptcha: () => Promise<CaptchaResponse>;
  login: (credentials: LoginRequest) => Promise<void>;
  continueAsGuest: () => void;
  register: (data: RegisterStartRequest) => Promise<RegisterStartResponse>;
  verifyRegistration: (data: RegisterVerifyRequest) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => Promise<void>;
  forgotPassword: (email: string) => Promise<ForgotPasswordResponse>;
  resetPassword: (data: ResetPasswordRequest) => Promise<void>;
  verifyOTP: (data: OTPVerificationRequest) => Promise<OTPVerificationResponse>;
  resendOTP: (data: ResendOTPRequest) => Promise<void>;
  clearError: () => void;
  refreshAuth: () => Promise<void>;
  dismissSessionExpired: () => void;
  exitGuestMode: (target?: 'signIn' | 'signUp') => void;
  pendingAuthTarget: 'signIn' | 'signUp' | null;
  clearPendingAuthTarget: () => void;
  loginWithSso: () => Promise<void>;
  completeSSO: (user: any, accessToken: string, refreshToken: string) => Promise<void>;
}
