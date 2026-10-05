import type { ApiClient } from './_client';
import type { Submission, ChatMessage, Status, ListSubmissionsParams } from '../types';

/**
 * Map API submission response to app Submission type
 */
function mapApiSubmission(d: any): Submission {
  return {
    id: d.id ?? d._id,
    ref: d.ref ?? '',
    title: d.appName ?? d.title ?? '',
    description: d.problemStatement ?? d.description ?? '',
    status: d.status ?? 'Draft',
    priority: capitalizeFirst(d.priority ?? 'Medium') as Submission['priority'],
    requestorId: d.requestorId ?? '',
    requestorName: d.requestorName ?? d.requestor ?? '',
    requestor: d.requestorName ?? d.requestor ?? '',
    department: d.department ?? '',
    category: Array.isArray(d.appType) ? d.appType[0] ?? '' : d.category ?? '',
    currentStep: d.currentStep ?? 0,
    completedSteps: d.completedSteps ?? [],
    messages: (d.messages ?? []).map(mapApiMessage),
    timeline: (d.timeline ?? []).map((e: any) => ({
      id: e.id ?? e._id ?? crypto.randomUUID(),
      actor: e.actor ?? '',
      action: e.action ?? '',
      time: e.time ?? '',
      status: e.status ?? 'Draft',
    })),
    attachments: (d.attachments ?? []).map((a: any) => ({
      name: a.name ?? a.filename ?? '',
      size: a.size ?? '',
    })),
    collaborators: (d.collaborators ?? []).map((c: any) => ({
      userId: c.userId ?? c.id ?? '',
      name: c.name ?? '',
      role: c.role ?? '',
    })),
    createdAt: d.createdAt ?? '',
    updatedAt: d.updatedAt ?? '',
    // Pass through all step fields for detail view / wizard resume
    appName: d.appName ?? '',
    sponsorName: d.sponsorName ?? '',
    contactEmail: d.contactEmail ?? '',
    problemStatement: d.problemStatement ?? '',
    businessBenefits: d.businessBenefits ?? '',
    hasInitiative: d.hasInitiative ?? false,
    initiativeName: d.initiativeName ?? '',
    appType: d.appType ?? [],
    mobilePlatforms: d.mobilePlatforms ?? [],
    accessType: d.accessType ?? '',
    domainType: d.domainType ?? '',
    replacesExisting: d.replacesExisting ?? false,
    existingAppName: d.existingAppName ?? '',
    userGroups: d.userGroups ?? [],
    userCount: d.userCount ?? '',
    geography: d.geography ?? '',
    techLevel: d.techLevel ?? '',
    hasAccessibility: d.hasAccessibility ?? false,
    isMultilingual: d.isMultilingual ?? false,
    features: d.features ?? [],
    hasDashboard: d.hasDashboard ?? false,
    hasReporting: d.hasReporting ?? false,
    hasNotifications: d.hasNotifications ?? false,
    notificationTypes: d.notificationTypes ?? [],
    hasFileUpload: d.hasFileUpload ?? false,
    hasPayments: d.hasPayments ?? false,
    hasWorkflow: d.hasWorkflow ?? false,
    hasOffline: d.hasOffline ?? false,
    hasRealtime: d.hasRealtime ?? false,
    otherRequirements: d.otherRequirements ?? '',
    hasExistingApp: d.hasExistingApp ?? false,
    existingApps: d.existingApps ?? '',
    currentLimitations: d.currentLimitations ?? '',
    needsMigration: d.needsMigration ?? false,
    migrationDataTypes: d.migrationDataTypes ?? [],
    dataVolume: d.dataVolume ?? '',
    hasContinuingIntegrations: d.hasContinuingIntegrations ?? false,
    dataSensitivity: d.dataSensitivity ?? '',
    sensitiveDataTypes: d.sensitiveDataTypes ?? [],
    complianceRequirements: d.complianceRequirements ?? [],
    authRequirements: d.authRequirements ?? [],
    accessControl: d.accessControl ?? [],
    requiresAuditLog: d.requiresAuditLog ?? false,
    requiresEncryption: d.requiresEncryption ?? false,
    requiresPenTest: d.requiresPenTest ?? false,
    dataResidency: d.dataResidency ?? '',
    followBranding: d.followBranding ?? false,
    designStyle: d.designStyle ?? '',
    layoutPreference: d.layoutPreference ?? '',
    isResponsive: d.isResponsive ?? true,
    isMobileFirst: d.isMobileFirst ?? false,
    uiComponents: d.uiComponents ?? [],
    designNotes: d.designNotes ?? '',
    hasIntegrations: d.hasIntegrations ?? false,
    integrationDetails: d.integrationDetails ?? '',
    needsEmail: d.needsEmail ?? false,
    needsSMS: d.needsSMS ?? false,
    needsCRM: d.needsCRM ?? false,
    needsERP: d.needsERP ?? false,
    apiConstraints: d.apiConstraints ?? '',
  };
}

/**
 * Map API chat message to app ChatMessage type
 */
function mapApiMessage(m: any): ChatMessage {
  return {
    id: m.id ?? m._id ?? crypto.randomUUID(),
    author: m.author ?? '',
    role: m.role ?? 'Requestor',
    text: m.text ?? '',
    time: m.time ?? '',
    self: m.self ?? false,
  };
}

/**
 * Capitalize first character of string
 */
function capitalizeFirst(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : s;
}

/**
 * Factory function for submission service
 * Accepts platform-agnostic ApiClient implementation
 */
export function createSubmissionService(client: ApiClient) {
  return {
    async createDraft(): Promise<Submission> {
      const res = await client.post<any>('/submissions');
      return mapApiSubmission(res?.data?.submission ?? res?.submission);
    },

    async getAll(params?: ListSubmissionsParams): Promise<Submission[]> {
      const apiParams: Record<string, string | number | undefined> = {};
      if (params?.statuses?.length) apiParams.statuses = params.statuses.join(',');
      else if (params?.status) apiParams.status = params.status;
      if (params?.priorities?.length) apiParams.priorities = params.priorities.join(',');
      else if (params?.priority) apiParams.priority = params.priority.toLowerCase();
      if (params?.department) apiParams.department = params.department;
      if (params?.category) apiParams.category = params.category;
      if (params?.search) apiParams.search = params.search;
      if (params?.ref) apiParams.ref = params.ref;
      if (params?.requestorName) apiParams.requestorName = params.requestorName;
      if (params?.sortBy) apiParams.sortBy = params.sortBy;
      if (params?.sortOrder) apiParams.sortOrder = params.sortOrder;
      if (params?.page) apiParams.page = params.page;
      if (params?.limit) apiParams.limit = params.limit;

      const res = await client.get<any>('/submissions', apiParams);
      const list = res?.data?.submissions ?? res?.submissions ?? [];
      return list.map(mapApiSubmission);
    },

    async getById(id: string): Promise<Submission> {
      const res = await client.get<any>(`/submissions/${id}`);
      return mapApiSubmission(res?.data?.submission ?? res?.submission ?? res?.data ?? res);
    },

    async saveStep(id: string, step: number, data: Record<string, unknown>): Promise<Submission> {
      const res = await client.patch<any>(`/submissions/${id}/step/${step}`, data);
      return mapApiSubmission(res?.data?.submission ?? res?.submission);
    },

    async submitForReview(id: string): Promise<Submission> {
      const res = await client.post<any>(`/submissions/${id}/submit`);
      return mapApiSubmission(res?.data?.submission ?? res?.submission);
    },

    async changeStatus(id: string, status: Status): Promise<Submission> {
      const res = await client.patch<any>(`/submissions/${id}/status`, { status });
      return mapApiSubmission(res?.data?.submission ?? res?.submission ?? res?.data ?? res);
    },

    async getReviewQueue(params?: Pick<ListSubmissionsParams, 'statuses' | 'priorities' | 'search' | 'ref' | 'requestorName' | 'sortBy' | 'sortOrder'>): Promise<Submission[]> {
      const apiParams: Record<string, string | undefined> = {};
      if (params?.statuses?.length) apiParams.statuses = params.statuses.join(',');
      if (params?.priorities?.length) apiParams.priorities = params.priorities.join(',');
      if (params?.search) apiParams.search = params.search;
      if (params?.ref) apiParams.ref = params.ref;
      if (params?.requestorName) apiParams.requestorName = params.requestorName;
      if (params?.sortBy) apiParams.sortBy = params.sortBy;
      if (params?.sortOrder) apiParams.sortOrder = params.sortOrder;
      const res = await client.get<any>('/submissions/review-queue', apiParams);
      const list = res?.data?.submissions ?? res?.submissions ?? [];
      return list.map(mapApiSubmission);
    },

    async getMessages(id: string): Promise<ChatMessage[]> {
      const res = await client.get<any>(`/submissions/${id}/messages`);
      return (res?.data?.messages ?? res?.messages ?? []).map(mapApiMessage);
    },

    async postMessage(id: string, text: string): Promise<ChatMessage[]> {
      const res = await client.post<any>(`/submissions/${id}/messages`, { text });
      return (res?.data?.messages ?? res?.messages ?? []).map(mapApiMessage);
    },

    async deleteDraft(id: string): Promise<void> {
      await client.delete(`/submissions/${id}`);
    },

    async bulkDeleteDrafts(ids: string[]): Promise<void> {
      await client.delete('/submissions/delete-many', { data: { ids } });
    },

    async getStats(): Promise<{
      byStatus: Record<string, number>;
      last7Days: { day: string; count: number }[];
    }> {
      const res = await client.get<any>('/submissions/stats');
      return res?.data ?? { byStatus: {}, last7Days: [] };
    },
  };
}

export type SubmissionService = ReturnType<typeof createSubmissionService>;
