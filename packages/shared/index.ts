// ============================================================================
// @demand/shared — Root Barrel Export
// ============================================================================
// This file aggregates all types, utilities, schemas, and services for
// convenient importing across web and mobile packages.

// ============================================================================
// FLUENTEDGE — Design tokens, product constants, domain type skeletons
// ============================================================================
// The FluentEdge design system + domain contracts consumed by both web and
// mobile. (The Demand-Management exports below are being phased out as the
// monorepo pivots to FluentEdge — see plan/FluentEdge Phase 0 Plan.md.)

export {
  FE_THEMES,
  FE_ACCENTS,
  FE_ACCENT_KEYS,
  FE_GRADIENTS,
  FE_OUTER_BG,
  FE_TONES,
  FE_TWEAK_DEFAULTS,
  FE_RADIUS_RANGE,
  FE_FONT_FAMILY,
  FE_FONT_WEIGHTS,
} from './design/tokens';
export type {
  FEThemeMode,
  FEResolvedMode,
  FEThemePreference,
  FEAccentKey,
  FEThemeVars,
  FEAccent,
  FEGradient,
  FETone,
  FEAppearance,
} from './design/tokens';

export { FE_PILLARS, FE_PERSONAS, FE_GOALS, FE_TIERS } from './design/constants';
export type { FEPillar, FEPillarId, FEPersona, FEGoal, FETier, FETierId } from './design/constants';

export {
  FE_FEATURE_KEYS,
  DEFAULT_FEATURE_FLAGS,
  TIER_ENTITLEMENTS,
  TIER_ORDER,
  minTierForFeature,
  canUseFeature,
} from './design/features';
export type { FEFeatureKey, FEFeatureFlags, FEConfig } from './design/features';

export type {
  Score,
  PillarScores,
  FEUser,
  Streak,
  Recording,
  SpeakSession,
  SpeakSessionKind,
  Subscription,
} from './types/fluentedge';

// ============================================================================
// ENUMS
// ============================================================================

// Role enums and utilities
export {
  UserRoleEnum,
  RoleDisplayNames,
  RoleApiNames,
  DisplayNameToEnum,
  ApiNameToEnum,
  hasRolePrivilege,
  getHighestRole,
  displayNameToEnum,
  apiNameToEnum,
  enumToDisplayName,
  enumToApiName,
} from './enums/roles';

// ============================================================================
// TYPES
// ============================================================================

// Domain model types
export type {
  Role,
  UserRole,
  Status,
  Priority,
  ChatMessage,
  TimelineEvent,
  Collaborator,
  Submission,
  Notification,
  User,
  ListSubmissionsParams,
  Tag,
  PlatformFeatures,
  FAQ,
  Feedback,
} from './types/index';
export { DEFAULT_PLATFORM_FEATURES } from './types/index';

// API wire types
export type {
  ApiRole,
  ApiUser,
  ApiResponse,
  LoginResponse,
  MeResponse,
  RefreshResponse,
} from './types/api';

// ============================================================================
// UTILITIES
// ============================================================================

// Date utilities
export { formatDate, timeAgo } from './utils/date-utils';

// ID utilities
export { generateId, generateRef } from './utils/id-utils';

// Status & Priority utilities
export { statusColor, priorityColor, type ColorToken } from './utils/status-utils';

// Axios adapter factory
export { createAxiosAdapter } from './utils/create-axios-adapter';

// ============================================================================
// SCHEMAS
// ============================================================================

export {
  requestSchema,
  type RequestForm,
  defaultValues,
  STEP_FIELDS,
  STEP_META,
} from './schemas/request-schema';

// ============================================================================
// SERVICES
// ============================================================================

export type { ApiClient } from './services/_client';
export { createAuthService, type AuthService } from './services/auth-service';
export { createSubmissionService, type SubmissionService } from './services/submission-service';
export { createNotificationService, type NotificationService } from './services/notification-service';
export { createUserService, type UserService } from './services/user-service';
export { createTagService, type ITagService } from './services/tag-service';
export { createFAQService, type FAQService } from './services/faq-service';
export { createFeedbackService, type FeedbackService } from './services/feedback-service';
