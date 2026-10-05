import { z } from "zod";

export const requestSchema = z.object({
  // Step 1 — Business Context
  appName: z.string().min(2, "Application name is required"),
  department: z.string().min(1, "Select a department"),
  sponsorName: z.string().min(2, "Sponsor name is required"),
  contactEmail: z.string().email("Enter a valid email"),
  problemStatement: z.string().min(100, "Minimum 100 characters required"),
  businessBenefits: z.string().min(10, "Describe the expected benefits"),
  priority: z.enum(["critical", "high", "medium", "low"], { required_error: "Pick a priority", message: "Pick a priority" }),
  hasInitiative: z.boolean().default(false),
  initiativeName: z.string().optional(),

  // Step 2 — App Type
  appType: z.array(z.string()).min(1, "Select at least one application type"),
  mobilePlatforms: z.array(z.string()).optional(),
  accessType: z.string().min(1, "Select an access type"),
  domainType: z.enum(["public", "internal", "both"], { required_error: "Select a domain type", message: "Select a domain type" }),
  replacesExisting: z.boolean().default(false),
  existingAppName: z.string().optional(),

  // Step 3 — Collaborators
  collaborators: z.array(z.object({ id: z.string(), name: z.string(), role: z.string() })).default([]),

  // Step 4 — Audience
  userGroups: z.array(z.string()).min(1, "Select at least one user group"),
  userCount: z.string().min(1, "Estimate the number of users"),
  geography: z.string().min(1, "Select geographic distribution"),
  techLevel: z.string().min(1, "Select user technical comfort"),
  hasAccessibility: z.boolean().default(false),
  isMultilingual: z.boolean().default(false),

  // Step 5 — Features
  features: z.array(z.string()).min(3, "Add at least 3 core features"),
  hasDashboard: z.boolean().default(false),
  hasReporting: z.boolean().default(false),
  hasNotifications: z.boolean().default(false),
  notificationTypes: z.array(z.string()).optional(),
  hasFileUpload: z.boolean().default(false),
  hasPayments: z.boolean().default(false),
  hasWorkflow: z.boolean().default(false),
  hasOffline: z.boolean().default(false),
  hasRealtime: z.boolean().default(false),
  otherRequirements: z.string().optional(),

  // Step 6 — Migration
  hasExistingApp: z.boolean().default(false),
  existingApps: z.string().optional(),
  currentLimitations: z.string().optional(),
  needsMigration: z.boolean().default(false),
  migrationDataTypes: z.array(z.string()).optional(),
  dataVolume: z.string().optional(),
  hasContinuingIntegrations: z.boolean().default(false),

  // Step 7 — Security
  dataSensitivity: z.string().min(1, "Select a data sensitivity level"),
  sensitiveDataTypes: z.array(z.string()).optional(),
  complianceRequirements: z.array(z.string()).min(1, "Select compliance requirements"),
  authRequirements: z.array(z.string()).min(1, "Select authentication requirements"),
  accessControl: z.array(z.string()).optional(),
  requiresAuditLog: z.boolean().default(false),
  requiresEncryption: z.boolean().default(false),
  dataResidency: z.string().optional(),
  requiresPenTest: z.boolean().default(false),

  // Step 8 — Design
  followBranding: z.boolean().default(false),
  designStyle: z.string().optional(),
  layoutPreference: z.string().optional(),
  isResponsive: z.boolean().default(true),
  isMobileFirst: z.boolean().default(false),
  uiComponents: z.array(z.string()).optional(),
  designNotes: z.string().optional(),

  // Step 9 — Integration
  hasIntegrations: z.boolean().default(false),
  integrationDetails: z.string().optional(),
  needsEmail: z.boolean().default(false),
  needsSMS: z.boolean().default(false),
  needsCRM: z.boolean().default(false),
  needsERP: z.boolean().default(false),
  apiConstraints: z.string().optional(),
});

export type RequestForm = z.infer<typeof requestSchema>;

export const defaultValues: Partial<RequestForm> = {
  appName: "", department: "", sponsorName: "", contactEmail: "",
  problemStatement: "", businessBenefits: "", priority: undefined,
  hasInitiative: false, initiativeName: "",
  appType: [], mobilePlatforms: [], accessType: "", domainType: undefined,
  replacesExisting: false, existingAppName: "",
  collaborators: [],
  userGroups: [], userCount: "", geography: "", techLevel: "",
  hasAccessibility: false, isMultilingual: false,
  features: [], hasDashboard: false, hasReporting: false, hasNotifications: false,
  notificationTypes: [], hasFileUpload: false, hasPayments: false, hasWorkflow: false,
  hasOffline: false, hasRealtime: false, otherRequirements: "",
  hasExistingApp: false, existingApps: "", currentLimitations: "", needsMigration: false,
  migrationDataTypes: [], dataVolume: "", hasContinuingIntegrations: false,
  dataSensitivity: "", sensitiveDataTypes: [], complianceRequirements: [],
  authRequirements: [], accessControl: [], requiresAuditLog: false,
  requiresEncryption: false, dataResidency: "", requiresPenTest: false,
  followBranding: false, designStyle: "", layoutPreference: "",
  isResponsive: true, isMobileFirst: false, uiComponents: [], designNotes: "",
  hasIntegrations: false, integrationDetails: "", needsEmail: false, needsSMS: false,
  needsCRM: false, needsERP: false, apiConstraints: "",
};

export const STEP_FIELDS: (keyof RequestForm)[][] = [
  ["appName", "department", "sponsorName", "contactEmail", "problemStatement", "businessBenefits", "priority", "hasInitiative", "initiativeName"],
  ["appType", "mobilePlatforms", "accessType", "domainType", "replacesExisting", "existingAppName"],
  ["collaborators"],
  ["userGroups", "userCount", "geography", "techLevel", "hasAccessibility", "isMultilingual"],
  ["features", "hasDashboard", "hasReporting", "hasNotifications", "notificationTypes", "hasFileUpload", "hasPayments", "hasWorkflow", "hasOffline", "hasRealtime", "otherRequirements"],
  ["hasExistingApp", "existingApps", "currentLimitations", "needsMigration", "migrationDataTypes", "dataVolume", "hasContinuingIntegrations"],
  ["dataSensitivity", "sensitiveDataTypes", "complianceRequirements", "authRequirements", "accessControl", "requiresAuditLog", "requiresEncryption", "dataResidency", "requiresPenTest"],
  ["followBranding", "designStyle", "layoutPreference", "isResponsive", "isMobileFirst", "uiComponents", "designNotes"],
  ["hasIntegrations", "integrationDetails", "needsEmail", "needsSMS", "needsCRM", "needsERP", "apiConstraints"],
  [],
];

export const STEP_META = [
  { label: "Business Context", desc: "Tell us about the business need" },
  { label: "App Type", desc: "What kind of application?" },
  { label: "Collaborators", desc: "Who else is involved?" },
  { label: "Audience", desc: "Who will use it?" },
  { label: "Features", desc: "Core functionality" },
  { label: "Migration", desc: "Existing systems & data" },
  { label: "Security", desc: "Compliance & access" },
  { label: "Design", desc: "Look & feel" },
  { label: "Integration", desc: "External systems" },
  { label: "Review", desc: "Final review & submit" },
] as const;
