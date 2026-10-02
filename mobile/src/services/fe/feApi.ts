import { feRequest, feTokens, AUTH_BASE_URL } from '@services/fe/feClient';
import type { FEConfig } from '@demand/shared/fe';
import type { FeApiError } from '@services/fe/feClient';

// ---- Types (mirror the backend responses) --------------------------------
export interface FeMe {
  id: string;
  _id?: string;
  email: string;
  firstName: string;
  lastName?: string;

  // Enterprise auth fields
  role: string;
  roles: string[];
  tenantId?: string;
  isEmailVerified: boolean;

  // FluentEdge fields (from unified auth)
  tier: 'free' | 'silver' | 'gold' | 'diamond';
  xp: number;
  level: number;
  streak: { current: number; longest: number; lastActiveAt?: string };
  persona?: 'silent' | 'over' | 'rusher';
  latestScore?: { overall: number; pillars: Record<string, number>; at: string };
  onboarding?: {
    state: string;
    goals?: string[];
    situations?: string[];
    [key: string]: any;
  };
}

export interface FePrompt {
  _id: string;
  type: string;
  text: string;
  pillarId?: string;
  tone?: string;
}

interface AuthResult {
  user: FeMe;
  accessToken: string;
  refreshToken: string;
}

/** Seeded demo account — offered as a one-tap "guest" entry on the auth screen. */
export const FE_DEMO_CREDENTIALS = { email: 'demo@fluentedge.app', password: 'Demo1234!' };

export async function feLogin(email: string, password: string): Promise<AuthResult> {
  const url = `${AUTH_BASE_URL}/auth/login`;
  const result = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
    .then(res => res.json())
    .then(json => {
      if (!json.success) throw new FeApiError(json.message || 'Login failed', 401);
      return json.data;
    });
  await feTokens.set(result.accessToken, result.refreshToken);
  return result;
}

/** Fetch the current user (requires a valid stored token). */
export async function feGetMe(): Promise<FeMe> {
  await feTokens.load();
  const token = feTokens.get();
  if (!token) throw new FeApiError('No access token available', 401);

  const url = `${AUTH_BASE_URL}/auth/me`;
  const result = await fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  })
    .then(res => res.json())
    .then(json => {
      if (!json.success) throw new FeApiError(json.message || 'Failed to fetch user', 401);
      return json.data.user;
    });
  return result;
}

/** True if a token is present in storage (not a validity guarantee). */
export async function feHasToken(): Promise<boolean> {
  await feTokens.load();
  return !!feTokens.get();
}

export function feGetConfig(): Promise<FEConfig> {
  return feRequest<FEConfig>('/config');
}

export interface OnboardingPayload {
  goals?: string[];
  situations?: string[];
  selfRating?: number;
  speakUp?: number;
  blocker?: string;
  profession?: string;
  language?: string;
  dailyGoalMin?: number;
  persona?: string;
  score?: { overall: number; pillars: Record<string, number> };
}

/** Persist funnel results + baseline assessment (auth required). Returns the updated user. */
export function feSaveOnboarding(payload: OnboardingPayload): Promise<FeMe> {
  return feRequest<FeMe>('/me/onboarding', { method: 'POST', body: payload, auth: true });
}

export async function feRegister(input: {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
}): Promise<AuthResult> {
  const url = `${AUTH_BASE_URL}/auth/register`;
  const result = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  })
    .then(res => res.json())
    .then(json => {
      if (!json.success) throw new FeApiError(json.message || 'Registration failed', 400);
      return json.data;
    });
  await feTokens.set(result.accessToken, result.refreshToken);
  return result;
}

export async function feLogout(): Promise<void> {
  await feTokens.clear();
}

export function feGetDailyPrompt(): Promise<FePrompt | null> {
  return feRequest<FePrompt | null>('/prompts/daily');
}

export function feListPrompts(type?: string): Promise<FePrompt[]> {
  return feRequest<FePrompt[]>(`/prompts${type ? `?type=${encodeURIComponent(type)}` : ''}`);
}

// ---- Onboarding Config (public, no auth required) ----
export interface OnboardingConfig {
  slides: WelcomeSlide[];
  steps: OnboardingStep[];
  prompts: AssessmentPrompt[];
  stepIndex: Record<string, OnboardingStep>;
  questionIndex: Record<string, OnboardingQuestion>;
  optionIndex: Record<string, OnboardingOption>;
}

export interface WelcomeSlide {
  _id: string;
  order: number;
  icons: string[];
  title: string;
  subtitle: string;
  active: boolean;
}

export interface OnboardingStep {
  _id: string;
  kind: 'welcome' | 'goals' | 'situations' | 'selfrate' | 'details' | 'assess' | 'signup' | 'trial';
  order: number;
  title: string;
  subtitle: string;
  config?: Record<string, any>;
  active: boolean;
  questions?: OnboardingQuestion[];
}

export interface OnboardingQuestion {
  _id: string;
  stepId: string;
  text: string;
  type: 'radio' | 'multiselect' | 'chips' | 'input' | 'segmented';
  minSelect?: number;
  maxSelect?: number;
  config?: Record<string, any>;
  optionIds: string[];
  order: number;
  active: boolean;
  options?: OnboardingOption[];
}

export interface OnboardingOption {
  _id: string;
  parentId: string;
  parentKind: 'question' | 'step';
  icon?: string;
  tone?: string;
  title: string;
  subtitle?: string;
  value: string;
  order: number;
  active: boolean;
}

export interface AssessmentPrompt {
  _id: string;
  text: string;
  active: boolean;
}

export function feGetOnboardingConfig(): Promise<OnboardingConfig> {
  return feRequest<OnboardingConfig>('/onboarding/config');
}

// ---- Practice Sessions ----
export type FESessionKind =
  | 'daily-speak'
  | 'assessment'
  | 'rapid-response'
  | 'shadow'
  | 'framework'
  | 'voice-journal'
  | 'ai-partner'
  | 'table-topics'
  | 'room';

export interface FEScore {
  overall: number;
  pillars: Record<string, number>;
}

export interface FESpeakSession {
  _id: string;
  userId: string;
  kind: FESessionKind;
  promptId?: string;
  recordingId?: string;
  score?: FEScore;
  coachNotes: string[];
  metrics?: Record<string, unknown>;
  durationSec: number;
  xpAwarded: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePracticeSessionPayload {
  kind: FESessionKind;
  durationSec: number;
  xpAwarded?: number;
  coachNotes?: string[];
  metrics?: Record<string, unknown>;
  score?: FEScore;
}

interface ListSessionsResponse {
  sessions: FESpeakSession[];
  total: number;
  limit: number;
  skip: number;
}

/** Create a practice session after drill completion (Table Topics, Rapid Response, etc). */
export function feCreatePracticeSession(payload: CreatePracticeSessionPayload): Promise<FESpeakSession> {
  return feRequest<FESpeakSession>('/practice/sessions', { method: 'POST', body: payload, auth: true });
}

/** List sessions for current user, optionally filtered by kind. */
export function feListPracticeSessions(kind?: FESessionKind, limit = 20, skip = 0): Promise<ListSessionsResponse> {
  const params = new URLSearchParams();
  if (kind) params.append('kind', kind);
  params.append('limit', limit.toString());
  params.append('skip', skip.toString());
  const qs = params.toString();
  return feRequest<ListSessionsResponse>(`/practice/sessions${qs ? `?${qs}` : ''}`, { auth: true });
}

// ── Play & Learn games ──────────────────────────────────────────────────────

export interface SaveGameResultPayload {
  gameId: string;
  score: number;
  stars?: number;
  stats?: Record<string, unknown>;
  xpAwarded?: number;
}

export interface SaveGameResultResponse {
  result: { id?: string; gameId: string; score: number; stars: number; xpAwarded: number };
  xp: number;
  level: number;
}

/** Save a game result after completion + award XP (Filler-Word Slayer, …). */
export function feSaveGameResult(payload: SaveGameResultPayload): Promise<SaveGameResultResponse> {
  return feRequest<SaveGameResultResponse>('/games/results', { method: 'POST', body: payload, auth: true });
}
