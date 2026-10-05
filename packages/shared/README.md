# @demand/shared — Shared Business Logic

**Version:** 0.1.0  
**Status:** Production-ready  
**Used by:** Web app (`src/`), Mobile app (`mobile/`)

---

## Overview

`@demand/shared` is a platform-agnostic package containing all business logic for the Demand Management portal. It provides types, validation schemas, utility functions, and service factories that both web (React) and mobile (React Native) applications reuse.

**Why?** Instead of duplicating code across web and mobile, this package is the single source of truth.

---

## Installation

Already installed in the monorepo. To use in web or mobile:

```typescript
// Web (React)
import { Role, Status, Priority } from '@demand/shared';
import { requestSchema } from '@demand/shared';
import { authService } from '@/app/lib/api';  // Wired service

// Mobile (React Native)
import { Role, Status, Priority } from '@demand/shared';
import { requestSchema } from '@demand/shared';
import { authService } from '@/services/api/demand/auth';  // Wired service
```

---

## What's Exported

### 34 Re-exports from root `index.ts`

#### Types (13 exports)

**Domain Models:**
```typescript
import {
  Role,        // "Requestor" | "Approver" | "Watcher" | "Admin" | "Super Admin"
  Status,      // "Draft" | "Under Review" | "Awaiting Input" | "Approved" | "Rejected"
  Priority,    // "Low" | "Medium" | "High" | "Critical"
  Submission,  // Full submission object with all 9 wizard step fields
  User,        // User profile with role and tenant
  Notification,// Notification with read/unread state
  ChatMessage, // Message in submission thread
  TimelineEvent,// Audit log entry
  Collaborator,// User participating in submission
  ListSubmissionsParams,  // Query params for submissions endpoint
} from '@demand/shared';
```

**API Wire Types:**
```typescript
import {
  ApiRole,     // From backend API (may differ from domain Role)
  ApiUser,     // User as returned from /auth/me endpoint
  LoginResponse,    // { user: ApiUser, accessToken: string }
  MeResponse,       // { user: ApiUser }
  RefreshResponse,  // { accessToken: string }
} from '@demand/shared';
```

#### Services (9 exports)

```typescript
import {
  ApiClient,                           // Interface for HTTP client
  createAuthService, type AuthService,         // Authentication service
  createSubmissionService, type SubmissionService,     // Submissions CRUD
  createNotificationService, type NotificationService, // Notifications
  createUserService, type UserService,         // Users management
} from '@demand/shared';
```

**How to use:**

```typescript
// Each service is a factory that accepts ApiClient
import { createAuthService } from '@demand/shared';

// Web: wire with Axios client
import { httpClient } from './http';  // Axios instance
const authService = createAuthService(httpClient);

// Mobile: wire with AsyncStorage + Axios client
import { apiClient } from '@/services/api/client';
const authService = createAuthService(apiClient);
```

#### Utilities (7 exports)

```typescript
import {
  // Date utilities
  formatDate,    // (iso: string) => "Jan 1, 2026"
  timeAgo,       // (iso: string) => "5m ago", "2h ago", "3d ago"

  // ID utilities
  generateId,    // () => UUID (crypto.randomUUID)
  generateRef,   // () => "REQ-2026-12345" format

  // Status/Priority colors (semantic tokens)
  statusColor,   // (status: Status) => { color, bg, border }
  priorityColor, // (priority: Priority) => { color, bg, border }
  type ColorToken,   // { color: string; bg: string; border: string }
} from '@demand/shared';
```

**Examples:**

```typescript
// Date formatting
const formatted = formatDate('2026-05-17T10:30:00Z');  // "May 17, 2026"
const ago = timeAgo('2026-05-17T10:00:00Z');  // "30m ago"

// ID generation
const uuid = generateId();  // "f47ac10b-58cc-4372-a567-0e02b2c3d479"
const ref = generateRef();  // "REQ-2026-45821"

// Status/Priority colors (platform-agnostic semantic tokens)
const approved = statusColor('Approved');
// { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' }

// Web adapter converts to Tailwind
const webColor = statusColor('Approved');  // Returns Tailwind class string

// Mobile uses directly
const nativeColor = statusColor('Approved');  // Returns RGB hex string
```

#### Schemas (5 exports)

```typescript
import {
  requestSchema,    // Zod schema for 10-step form validation
  type RequestForm, // TypeScript type inferred from schema
  defaultValues,    // Empty form seed object
  STEP_FIELDS,      // [["field1", "field2"], ...] per step
  STEP_META,        // [{ label: "Step 1" }, ...] with descriptions
} from '@demand/shared';
```

**Usage in forms:**

```typescript
import { requestSchema, defaultValues, STEP_FIELDS } from '@demand/shared';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

const { control, handleSubmit } = useForm({
  resolver: zodResolver(requestSchema),
  defaultValues,  // Empty form
});

// Web: validate current step
const isStepValid = await trigger(STEP_FIELDS[currentStep]);

// Mobile: same validation
const isStepValid = await trigger(STEP_FIELDS[currentStep]);
```

---

## Service Details

### AuthService

```typescript
const authService = createAuthService(apiClient);

// Methods:
await authService.login(email: string, password: string)
  // Returns: { user: User, accessToken: string }

await authService.getMe()
  // Returns: { user: User }

await authService.logout()
  // Returns: void

await authService.forgotPassword(email: string)
  // Returns: void
```

### SubmissionService

```typescript
const submissionService = createSubmissionService(apiClient);

// CRUD
await submissionService.createDraft()
  // Returns: Submission (empty draft)

await submissionService.getAll(params?: ListSubmissionsParams)
  // Returns: Submission[]

await submissionService.getById(id: string)
  // Returns: Submission

// Wizard workflow
await submissionService.saveStep(id: string, step: number, data: unknown)
  // Returns: Submission (updated with step data)

await submissionService.submitForReview(id: string)
  // Returns: Submission (status changed to "Under Review")

// Status management
await submissionService.changeStatus(id: string, status: Status)
  // Returns: Submission (status updated)

// Review workflow
await submissionService.getReviewQueue()
  // Returns: Submission[] (pending approval for current user)

// Messaging
await submissionService.getMessages(id: string)
  // Returns: ChatMessage[]

await submissionService.postMessage(id: string, text: string)
  // Returns: ChatMessage (new message)
```

### NotificationService

```typescript
const notificationService = createNotificationService(apiClient);

await notificationService.getAll()
  // Returns: Notification[]

await notificationService.markRead(id: string)
  // Returns: void

await notificationService.markAllRead()
  // Returns: void
```

### UserService

```typescript
const userService = createUserService(apiClient);

await userService.getAll()
  // Returns: User[]

await userService.getById(id: string)
  // Returns: User

await userService.update(id: string, patch: Partial<User>)
  // Returns: User (updated)

await userService.create(user: Omit<User, 'id'>)
  // Returns: User (newly created)
```

---

## ApiClient Interface

Every service factory expects an `ApiClient` implementation. This is the contract that both web and mobile must fulfill:

```typescript
interface ApiClient {
  get<T>(url: string, params?: Record<string, unknown>): Promise<T>;
  post<T>(url: string, data?: unknown): Promise<T>;
  patch<T>(url: string, data?: unknown): Promise<T>;
  delete<T>(url: string): Promise<T>;
}
```

**Web Implementation:**

```typescript
// src/app/lib/http.ts
const httpClient: ApiClient = {
  get: async (url, params) => {
    const { data } = await axios.get(url, { params });
    return data;
  },
  post: async (url, data) => {
    const { data: response } = await axios.post(url, data);
    return response;
  },
  patch: async (url, data) => {
    const { data: response } = await axios.patch(url, data);
    return response;
  },
  delete: async (url) => {
    const { data } = await axios.delete(url);
    return data;
  },
};
```

**Mobile Implementation:**

```typescript
// mobile/src/services/api/client.ts
class HttpClient implements ApiClient {
  private axios = axios.create({ baseURL: API_URL });

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.axios.get<T>(url, { params });
    return response.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const response = await this.axios.post<T>(url, data);
    return response.data;
  }
  // ... etc
}
```

---

## Type System

### Domain Types vs API Types

The package distinguishes between:

**API Wire Types** (`api.ts`) — What the backend returns:
```typescript
interface ApiUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: ApiRole;  // Backend's role enum
  tenantId: string;
}

type ApiRole = 'viewer' | 'employee' | 'clinician' | 'manager' | 'tenant_admin' | 'super_admin';
```

**Domain Types** (`index.ts`) — What the app uses:
```typescript
interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: Role;  // App's normalized role
  tenantId: string;
}

type Role = 'Requestor' | 'Approver' | 'Watcher' | 'Admin' | 'Super Admin';
```

Services handle the mapping:

```typescript
// backend returns ApiRole 'tenant_admin'
const response = await authService.getMe();
// Service maps to Role 'Admin'
const normalizedUser: User = mapApiUserToDomainUser(response.user);
```

---

## Validation Schema

The 10-step form is defined once in Zod and shared:

```typescript
const requestSchema = z.object({
  // Step 0: Business Context
  appName: z.string().min(1),
  sponsorName: z.string().min(1),
  contactEmail: z.string().email(),
  problemStatement: z.string().min(10),

  // Step 1: Application Type
  category: z.enum(['SAP', 'Custom', 'Salesforce', 'Microsoft']),
  appType: z.string(),
  accessType: z.enum(['Web', 'Desktop', 'Mobile']),

  // ... 8 more steps

  // Step 9: Design & Security
  designStyle: z.string(),
  responsive: z.boolean(),
  integrations: z.object({
    email: z.boolean(),
    sms: z.boolean(),
    crm: z.boolean(),
  }),
});

type RequestForm = z.infer<typeof requestSchema>;
```

**Usage:**

```typescript
// Validate entire form
const valid = await requestSchema.parseAsync(formData);

// Validate single step
const stepSchema = z.object({
  appName: requestSchema.shape.appName,
  sponsorName: requestSchema.shape.sponsorName,
});
await stepSchema.parseAsync(stepData);

// With React Hook Form (web and mobile both support this)
const { formState: { errors } } = useForm({
  resolver: zodResolver(requestSchema),
  defaultValues,
});
```

---

## Color Tokens

The package exports semantic color tokens that both platforms can use:

```typescript
type ColorToken = { color: string; bg: string; border: string };

const approved = statusColor('Approved');
// { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' }
```

**Web:** Converts to Tailwind classes
```typescript
// src/app/utils/status-utils.ts (adapter)
export function statusColor(s: Status): string {
  const token = _statusColor(s);  // From shared
  return `text-[${token.color}] bg-[${token.bg}]`;  // Tailwind
}
```

**Mobile:** Uses directly
```typescript
const token = statusColor('Approved');
// Use token.color, token.bg, token.border for RN StyleSheet
```

---

## Files & Paths

```
packages/shared/
├── index.ts                    ← Main export (re-exports everything)
├── types/
│   ├── api.ts                  ← ApiRole, ApiUser, LoginResponse, etc.
│   └── index.ts                ← Role, Status, Priority, Submission, etc.
├── utils/
│   ├── date-utils.ts           ← formatDate, timeAgo
│   ├── id-utils.ts             ← generateId, generateRef
│   └── status-utils.ts         ← statusColor, priorityColor
├── schemas/
│   └── request-schema.ts       ← Zod requestSchema + STEP_FIELDS + STEP_META
└── services/
    ├── _client.ts              ← ApiClient interface
    ├── auth-service.ts         ← createAuthService
    ├── submission-service.ts   ← createSubmissionService
    ├── notification-service.ts ← createNotificationService
    ├── user-service.ts         ← createUserService
    └── index.ts                ← Service barrel export
```

---

## Adding New Features

### 1. Add a new type to shared

```typescript
// packages/shared/types/index.ts
export interface NewType {
  id: string;
  name: string;
}
```

Automatically available to both web and mobile:
```typescript
import { NewType } from '@demand/shared';
```

### 2. Add a new service method

```typescript
// packages/shared/services/submission-service.ts
export function createSubmissionService(client: ApiClient) {
  return {
    // ... existing methods
    duplicateSubmission: (id: string) =>
      client.post(`/submissions/${id}/duplicate`),
  };
}
```

Both web and mobile can use it immediately:
```typescript
// Web
const newSubmission = await submissionService.duplicateSubmission(id);

// Mobile (exact same call)
const newSubmission = await submissionService.duplicateSubmission(id);
```

### 3. Add a new utility

```typescript
// packages/shared/utils/validation-utils.ts
export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
```

Update the barrel export:
```typescript
// packages/shared/index.ts
export { isValidEmail } from './utils/validation-utils';
```

Both apps can use it:
```typescript
import { isValidEmail } from '@demand/shared';
```

---

## Versioning & Publishing

**Current version:** 0.1.0

To release a new version:

```bash
# 1. Update version in packages/shared/package.json
# 2. Commit
git add packages/shared/package.json
git commit -m "bump(shared): v0.1.0 -> v0.2.0"

# 3. Tag
git tag @demand/shared@0.2.0

# 4. Push
git push origin feature/branch --tags
```

Note: Currently used as a workspace package (not published to npm).

---

## Troubleshooting

### Import not found

```typescript
// ❌ This doesn't exist
import { NonExistentType } from '@demand/shared';

// ✅ Check what's exported in packages/shared/index.ts
```

### TypeScript not finding types

```bash
# Solution: Restart TypeScript in IDE
# VS Code: Cmd+Shift+P → TypeScript: Restart TS Server
```

### Service factory not working

```typescript
// ❌ Forgot to wire with client
const authService = createAuthService();  // Error: missing argument

// ✅ Always provide ApiClient
const authService = createAuthService(httpClient);
```

---

## References

- **API Endpoints:** See `/docs/superpowers/specs/2026-05-17-monorepo-shared-layer-and-mobile-app-design.md#api-endpoints-reference`
- **Architecture:** See `MONOREPO.md`
- **Web App Usage:** See `/CLAUDE.md`
- **Mobile App Usage:** See `/mobile/SETUP.md`
