// Re-export role enums and utilities
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
} from '../enums/roles';

/** @deprecated Use UserRole instead */
export type Role = "Requestor" | "Approver" | "Watcher" | "Admin" | "Super Admin";

export type UserRole =
  | "Employee"
  | "DM Requestor"
  | "DM Approver"
  | "DM Watcher"
  | "Admin"
  | "Super Admin";
export type Status = "Draft" | "Under Review" | "Awaiting Input" | "Approved" | "Rejected";
export type Priority = "Low" | "Medium" | "High" | "Critical";

export interface ChatMessage {
  id: string;
  author: string;
  role: string;
  text: string;
  time: string;
  self?: boolean;
}

export interface TimelineEvent {
  id: string;
  actor: string;
  action: string;
  time: string;
  status: string;
}

export interface Collaborator {
  userId: string;
  name: string;
  role: string;
}

export interface Submission {
  id: string;
  ref: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  requestorId: string;
  requestorName: string;
  requestor: string;
  department: string;
  category: string;
  currentStep: number;
  completedSteps: number[];
  messages: ChatMessage[];
  timeline: TimelineEvent[];
  attachments: { name: string; size: string }[];
  collaborators: Collaborator[];
  createdAt: string;
  updatedAt: string;

  // Step 0 — Business Context
  appName?: string;
  sponsorName?: string;
  contactEmail?: string;
  problemStatement?: string;
  businessBenefits?: string;
  hasInitiative?: boolean;
  initiativeName?: string;

  // Step 1 — App Type
  appType?: string[];
  mobilePlatforms?: string[];
  accessType?: string;
  domainType?: string;
  replacesExisting?: boolean;
  existingAppName?: string;

  // Step 3 — Audience
  userGroups?: string[];
  userCount?: string;
  geography?: string;
  techLevel?: string;
  hasAccessibility?: boolean;
  isMultilingual?: boolean;

  // Step 4 — Features
  features?: string[];
  hasDashboard?: boolean;
  hasReporting?: boolean;
  hasNotifications?: boolean;
  notificationTypes?: string[];
  hasFileUpload?: boolean;
  hasPayments?: boolean;
  hasWorkflow?: boolean;
  hasOffline?: boolean;
  hasRealtime?: boolean;
  otherRequirements?: string;

  // Step 5 — Migration
  hasExistingApp?: boolean;
  existingApps?: string;
  currentLimitations?: string;
  needsMigration?: boolean;
  migrationDataTypes?: string[];
  dataVolume?: string;
  hasContinuingIntegrations?: boolean;

  // Step 6 — Security
  dataSensitivity?: string;
  sensitiveDataTypes?: string[];
  complianceRequirements?: string[];
  authRequirements?: string[];
  accessControl?: string[];
  requiresAuditLog?: boolean;
  requiresEncryption?: boolean;
  requiresPenTest?: boolean;
  dataResidency?: string;

  // Step 7 — Design
  followBranding?: boolean;
  designStyle?: string;
  layoutPreference?: string;
  isResponsive?: boolean;
  isMobileFirst?: boolean;
  uiComponents?: string[];
  designNotes?: string;

  // Step 8 — Integration
  hasIntegrations?: boolean;
  integrationDetails?: string;
  needsEmail?: boolean;
  needsSMS?: boolean;
  needsCRM?: boolean;
  needsERP?: boolean;
  apiConstraints?: string;
}

export interface Notification {
  id: string;
  type: "approval" | "chat" | "request" | "system";
  title: string;
  message: string;
  time: string;
  read: boolean;
  linkTo?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: UserRole[];
  status: "Active" | "Inactive";
  lastLogin: string;
  avatar?: string;
}

export interface ListSubmissionsParams {
  status?: Status;
  statuses?: Status[];
  priority?: string;
  priorities?: string[];
  department?: string;
  category?: string;
  search?: string;
  ref?: string;
  requestorName?: string;
  sortBy?: 'createdAt' | 'updatedAt' | 'ref' | 'title' | 'status' | 'priority' | 'requestorName';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface Tag {
  id: string;
  name: string;
  category: 'blog' | 'feature' | 'topic' | 'skill' | 'technology';
  usageCount: number;
  isCommon: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order: number;
  isPublished: boolean;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  reaction: 'up' | 'down';
  tags: string[];
  message: string;
  createdAt: string;
}

export interface PlatformFeatures {
  posts: boolean;
  reports: boolean;
  audit: boolean;
  users: boolean;
  newRequest: boolean;
  reviewQueue: boolean;
  notifications: boolean;
  demandManagement: boolean;
  knowledgeBase: boolean;
  events: boolean;
  recognition: boolean;
  surveys: boolean;
  faq: boolean;
  feedback: boolean;
  marketplace: boolean;
  developerConsole: boolean;
}

export const DEFAULT_PLATFORM_FEATURES: PlatformFeatures = {
  posts: true,
  reports: true,
  audit: true,
  users: true,
  newRequest: true,
  reviewQueue: true,
  notifications: true,
  demandManagement: true,
  knowledgeBase: false,
  events: false,
  recognition: false,
  surveys: false,
  faq: true,
  feedback: true,
  marketplace: true,
  developerConsole: true,
};
