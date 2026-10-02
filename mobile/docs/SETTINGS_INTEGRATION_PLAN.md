# Settings Screen Integration Plan

**Project**: React Native My M Safety App Migration  
**Feature**: Settings Screen with Backend API Integration  
**API Endpoint**: `GET https://mymsafety-dev.merckgroup.com/api/v1/settings`  
**Status**: Planning Phase  
**Date**: 2026-05-22

---

## 1. Overview & Architecture

### 1.1 Current State (Ionic App)

The Ionic settings screen (`src/app/settings/`) implements a comprehensive settings interface with:

- **Three main sections** (Desktop/Web): Article Details, Language Settings, User Data
- **Home section**: Barcode scanner toggle
- **Article Details**: 16 SDS section toggles (enable/disable each section)
- **Language Settings**: Country selection, Language selection, Location settings (ask again, auto-update)
- **User Data**: Account deletion, Clear local data
- **Additional**: Rating, Version info

### 1.2 Backend API Response Structure

```json
{
    "home": {
        "barcodeScanner": boolean
    },
    "articleDetails": {
        "safetyDataSheet": boolean,
        "ehs": boolean,
        "transportInformation": boolean
    },
    "dataPrivacy": {
        "favourites": boolean,
        "customerData": boolean
    },
    "sections": [16 booleans],  // SDS sections 1-16
    "location": {
        "askLocationAgain": boolean,
        "locationUpdate": boolean,
        "error": number,
        "countryCode": string,
        "city": string,
        "long": number,
        "lat": number
    },
    "validityAreaLanguage": {
        "rating": string,          // "PUBLIC" etc
        "validityArea": string,     // "GB", "US" etc
        "language": string          // "EN", "FR" etc
    },
    "appLanguage": string           // "en", "fr" etc
}
```

### 1.3 React Native Current Implementation

- Basic settings with theme, notifications, privacy, terms
- Uses `SettingsScreen.tsx` (placeholder) and `SettingsScreenTabbed.tsx`
- Theme switching, language switching via header
- No backend integration yet

---

## 2. Key Differences: Ionic vs React Native

| Aspect               | Ionic App                                         | React Native                        | RN Strategy                              |
| -------------------- | ------------------------------------------------- | ----------------------------------- | ---------------------------------------- |
| **Structure**        | Accordion collapsible sections                    | ScrollView with sections            | Keep accordion pattern + settings groups |
| **API Integration**  | SettingsService manages API calls + local storage | TanStack Query for state management | Use custom hook (`useSDS` pattern)       |
| **State Management** | RxJS Observables (settings.subscribe)             | React hooks + TanStack Query        | `useSettings` hook                       |
| **Toggles**          | Ion-toggle with ngModelChange                     | RN Switch component                 | Same Switch behavior                     |
| **Navigation**       | Ion-tabs on desktop, accordion on mobile          | Consistent cross-platform           | Sections instead of tabs                 |
| **Localization**     | ngx-translate                                     | react-i18next                       | Use existing i18n                        |
| **Theme**            | CSS-based                                         | Context-based (existing)            | Extend theme context                     |
| **Forms/Selects**    | Ion-select dropdowns                              | Picker or native select             | Use existing picker patterns             |

---

## 3. Data Model

### 3.1 TypeScript Interfaces

```typescript
// src/types/settings.ts

interface HomeSettings {
  barcodeScanner: boolean;
}

interface ArticleDetailsSettings {
  safetyDataSheet: boolean;
  ehs: boolean;
  transportInformation: boolean;
}

interface DataPrivacySettings {
  favourites: boolean;
  customerData: boolean;
}

interface LocationSettings {
  askLocationAgain: boolean;
  locationUpdate: boolean;
  error: number;
  countryCode: string;
  city: string;
  long: number;
  lat: number;
}

interface ValidityAreaLanguageSettings {
  rating: string;
  validityArea: string;
  language: string;
}

interface AppSettings {
  home: HomeSettings;
  articleDetails: ArticleDetailsSettings;
  dataPrivacy: DataPrivacySettings;
  sections: boolean[]; // 16 sections
  location: LocationSettings;
  validityAreaLanguage: ValidityAreaLanguageSettings;
  appLanguage: string;
}

interface SettingsResponse extends AppSettings {}
```

### 3.2 Component State Structure

```typescript
type SettingsState = {
  data: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  changes: Partial<AppSettings>;
};
```

---

## 4. Implementation Plan

### Phase 1: Foundation & Hooks (Days 1-2)

#### 4.1.1 Create Settings Service

**File**: `src/services/settingsService.ts`

```typescript
// Key functions:
- getSettings(): Promise<AppSettings>
- updateSettings(settings: AppSettings): Promise<AppSettings>
- resetSettings(): Promise<void>
- syncSettings(): void  // Cache management
```

**Integration Points**:

- Uses `safetyDataApiService` for API calls (like `safety-data-api.service.ts` pattern in Ionic)
- Implements retry logic (3 attempts, exponential backoff)
- Handles offline scenarios with local cache
- Emits update events via context

#### 4.1.2 Create useSettings Hook

**File**: `src/hooks/useSettings.ts`

```typescript
interface UseSettingsReturn {
  settings: AppSettings | null;
  isLoading: boolean;
  error: string | null;
  updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K],
  ): Promise<void>;
  updateNestedSetting(path: string, value: any): Promise<void>;
  refreshSettings(): Promise<void>;
}

// Uses TanStack Query for:
// - Caching (staleTime: 5 minutes)
// - Auto-refetch on app focus
// - Offline-aware querying
// - Mutation handling for updates
```

**Features**:

- Wraps TanStack Query `useQuery` and `useMutation`
- Debounces updates (500ms)
- Tracks dirty state
- Handles optimistic updates

---

### Phase 2: UI Components (Days 2-4)

#### 4.2.1 Restructure SettingsScreen

**File**: `src/screens/SettingsScreen.tsx` (refactor existing)

**Structure** (one-column mobile, accordion sections):

```
ScrollView
├── Profile Header
│   ├── Avatar + User Icon
│   ├── Username
│   ├── Email
│   └── Role Badge
│
├── Section 1: Home Settings
│   └── Barcode Scanner Toggle
│
├── Section 2: Article Details
│   ├── SafetyDataSheet Toggle
│   ├── EHS Toggle
│   └── TransportInformation Toggle
│
├── Section 3: Privacy
│   ├── Favourites Toggle
│   └── Customer Data Toggle
│
├── Section 4: SDS Sections
│   ├── Accordion Header: "Safety Data Sections"
│   └── 16 Toggles (Sections 1-16)
│
├── Section 5: Language & Location
│   ├── Accordion Header: "Safety Language Settings"
│   ├── Country Selector (Dropdown/Picker)
│   ├── Language Selector (Dropdown/Picker)
│   ├── Ask Location Again Toggle
│   ├── Auto-Update Location Toggle
│   └── Location Error Display
│
├── Section 6: User Data
│   ├── Accordion Header: "User Data & Account"
│   ├── Delete Account Button
│   └── Clear Local Data Button
│
└── Section 7: Other
    ├── Rate Application
    └── Version Info
```

#### 4.2.2 Component: SettingsSectionToggle

**File**: `src/components/settings/SettingsSectionToggle.tsx`

Reusable component for each toggle-able setting:

```typescript
interface SettingsSectionToggleProps {
  icon: IconName;
  label: string;
  description?: string;
  enabled: boolean;
  onToggle: (newValue: boolean) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}
```

#### 4.2.3 Component: CollapsibleSection

**File**: `src/components/settings/CollapsibleSection.tsx`

Accordion-style section (like Ionic toggleArticleClick pattern):

```typescript
interface CollapsibleSectionProps {
  title: string;
  icon: IconName;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  disabled?: boolean;
}
```

#### 4.2.4 Component: SectionsList

**File**: `src/components/settings/SectionsList.tsx`

Renders all 16 SDS sections with toggles:

```typescript
interface SectionsListProps {
  sections: boolean[];
  onUpdate: (index: number, value: boolean) => Promise<void>;
  isLoading?: boolean;
}
```

---

### Phase 3: State Management & Queries (Days 3-5)

#### 4.3.1 TanStack Query Setup

**File**: `src/lib/queryClient.ts` (extend existing)

Add query keys:

```typescript
const settingsQueryKeys = {
  all: ['settings'] as const,
  detail: () => [...settingsQueryKeys.all, 'detail'] as const,
  sections: () => [...settingsQueryKeys.all, 'sections'] as const,
  language: () => [...settingsQueryKeys.all, 'language'] as const,
};
```

#### 4.3.2 Query Configuration

```typescript
// Default staleTime: 5 minutes
// Retry: 3 attempts with exponential backoff
// gcTime: 10 minutes
// Pause queries when offline (use NetworkContext)
```

---

### Phase 4: Integration & API Layer (Days 4-6)

#### 4.4.1 Extend safetyDataApiService

**File**: `src/services/safetyDataApiService.ts` (add methods)

```typescript
// Add to existing service:
getSettings(): Promise<AppSettings>
updateSettings(settings: AppSettings): Promise<AppSettings>
updateSetting<K extends keyof AppSettings>(key: K, value: AppSettings[K]): Promise<AppSettings>
```

**API Calls**:

- GET `/api/v1/settings` → fetch all settings
- PUT `/api/v1/settings` → update entire settings
- PATCH `/api/v1/settings/{section}` → update specific section (optional, if backend supports)

#### 4.4.2 Error Handling

```typescript
// Handle:
- Network errors → show toast, retry
- 401/403 → redirect to login
- 400 → validation error display
- 500 → server error message
- Offline → use cached data, queue updates
```

---

### Phase 5: Localization (Days 5-6)

#### 4.5.1 Translation Keys

**File**: Update `src/localization/translations/*.json`

New keys needed:

```json
{
  "settings": {
    "home": "Home Settings",
    "barcodeScanner": "Enable Barcode Scanner",
    "articleDetails": "Article Details",
    "safetyDataSheet": "Safety Data Sheet",
    "ehs": "EHS Information",
    "transportInformation": "Transport Information",
    "dataPrivacy": "Data & Privacy",
    "favourites": "Favourites",
    "customerData": "Customer Data",
    "sdsSections": "Safety Data Sections",
    "languageSettings": "Safety Language & Location",
    "country": "Country",
    "language": "Language",
    "askLocationAgain": "Ask for Location Permission Again",
    "autoUpdateLocation": "Auto-Update Location",
    "locationError": "Location Error",
    "userData": "User Data & Account",
    "deleteAccount": "Delete Account",
    "clearLocalData": "Clear Local Data",
    "rateApp": "Rate Application",
    "version": "Version"
  }
}
```

---

### Phase 6: Testing & Validation (Days 6-7)

#### 4.6.1 Unit Tests

**Files**: `__tests__/services/settingsService.test.ts`, `__tests__/hooks/useSettings.test.ts`

Test scenarios:

- API fetch success/failure
- Update scenarios (toggle, section update)
- Caching behavior
- Offline mode
- Retry logic

#### 4.6.2 Integration Tests

**File**: `__tests__/screens/SettingsScreen.test.tsx`

Test scenarios:

- Component renders correctly
- All sections visible & expandable
- Toggles trigger updates
- Loading states shown
- Error messages displayed
- Optimistic updates work

#### 4.6.3 UI/UX Testing Checklist

- [ ] All 16 sections visible when expanded
- [ ] Toggles update immediately (optimistic)
- [ ] API call happens in background
- [ ] Toasts show success/error
- [ ] Dark mode colors correct
- [ ] RTL support (Arabic) works
- [ ] Loading spinner on updates
- [ ] Offline data preserved & synced

---

## 5. File Structure

```
src/
├── services/
│   ├── settingsService.ts          # NEW: Settings API layer
│   └── safetyDataApiService.ts     # EXTEND: Add settings methods
│
├── hooks/
│   └── useSettings.ts              # NEW: Settings state hook
│
├── screens/
│   ├── SettingsScreen.tsx          # REFACTOR: Main settings screen
│   └── SettingsScreenTabbed.tsx    # KEEP: May deprecate
│
├── components/
│   └── settings/                   # NEW: Settings-specific components
│       ├── SettingsSectionToggle.tsx
│       ├── CollapsibleSection.tsx
│       ├── SectionsList.tsx
│       ├── LanguageSelector.tsx
│       ├── CountrySelector.tsx
│       └── index.ts
│
├── types/
│   └── settings.ts                 # NEW: Settings TypeScript interfaces
│
├── localization/
│   ├── translations/
│   │   ├── en.json                 # EXTEND: Add settings keys
│   │   ├── fr.json                 # EXTEND: Add settings keys
│   │   └── ar.json                 # EXTEND: Add settings keys
│   └── i18n.ts                     # EXISTING: May add settings namespace
│
└── lib/
    └── queryClient.ts              # EXTEND: Add settings query keys
```

---

## 6. API Contract

### 6.1 GET /api/v1/settings

**Purpose**: Fetch current user settings

**Request**:

```
GET /api/v1/settings
Authorization: Bearer {token}
```

**Response** (200 OK):

```json
{
    "home": {"barcodeScanner": true},
    "articleDetails": {
        "safetyDataSheet": true,
        "ehs": true,
        "transportInformation": true
    },
    "dataPrivacy": {
        "favourites": true,
        "customerData": true
    },
    "sections": [true, true, ..., false],
    "location": {
        "askLocationAgain": false,
        "locationUpdate": true,
        "error": 0,
        "countryCode": "US",
        "city": "CA",
        "long": -122,
        "lat": 37
    },
    "validityAreaLanguage": {
        "rating": "PUBLIC",
        "validityArea": "GB",
        "language": "EN"
    },
    "appLanguage": "en"
}
```

**Errors**:

- 401 Unauthorized → Redirect to login
- 403 Forbidden → Show error toast
- 500 Server Error → Retry with exponential backoff

### 6.2 PUT /api/v1/settings (or PATCH)

**Purpose**: Update entire or partial settings

**Request**:

```
PUT /api/v1/settings
Authorization: Bearer {token}
Content-Type: application/json

{
    "home": {"barcodeScanner": false},
    "appLanguage": "fr"
    // ... other fields to update
}
```

**Response** (200 OK):

```json
{
  // Full updated settings
}
```

---

## 7. Key Implementation Decisions

### 7.1 Comparison with Ionic Pattern

| Pattern               | Ionic                         | React Native                      | Decision                                  |
| --------------------- | ----------------------------- | --------------------------------- | ----------------------------------------- |
| **Section Expansion** | AccordionClick (toggle state) | Collapsible component state       | Use local state for UX, API updates async |
| **Data Sync**         | RxJS settings.subscribe       | TanStack Query + useSettings hook | More performant, easier offline handling  |
| **Toggles**           | Two-way binding (ngModel)     | Controlled component + onChange   | Optimistic update pattern                 |
| **Validation**        | Backend API only              | Validate before send              | Simple validation on client side          |
| **Caching**           | localStorage + subscription   | TanStack Query (5 min stale)      | Better cache control                      |

### 7.2 Optimization Strategies

1. **Debounce Updates**: 500ms debounce on toggle changes to batch multiple rapid changes
2. **Optimistic Updates**: Update UI immediately, sync in background
3. **Query Stale Time**: 5 minutes before re-fetch from server
4. **Background Sync**: When coming online, sync any queued changes
5. **Lazy Sections**: Sections expanded on demand (don't load all 16 until needed)

### 7.3 Offline Support

- Cache settings on first fetch (TanStack Query default)
- Queue updates when offline
- Show "sync pending" indicator
- Auto-sync when connection restored
- Use `NetworkContext` for connectivity detection

---

## 8. Migration Checklist

### Pre-Implementation

- [ ] Verify API endpoint is stable
- [ ] Confirm API response format with backend team
- [ ] Review Ionic settings flow with product
- [ ] Design UI mockups (desktop vs mobile layout)
- [ ] Review dark mode colors for settings

### Implementation Phases

- [ ] Phase 1: Create settings service + hook
- [ ] Phase 1: Create TypeScript interfaces
- [ ] Phase 2: Build UI components (section by section)
- [ ] Phase 3: Integrate TanStack Query
- [ ] Phase 4: Wire API calls
- [ ] Phase 4: Add error handling & toasts
- [ ] Phase 5: Add localization keys
- [ ] Phase 6: Unit tests (80%+ coverage)
- [ ] Phase 6: Integration tests
- [ ] Phase 7: Manual QA testing
- [ ] Phase 7: Dark mode verification
- [ ] Phase 7: RTL testing (Arabic)
- [ ] Phase 7: Offline mode testing

### Post-Implementation

- [ ] Performance audit (Lighthouse)
- [ ] Accessibility audit (a11y)
- [ ] Compare with Ionic flow (feature parity)
- [ ] Document settings features in README
- [ ] Update navigation if needed (add settings link to header per user instructions)

---

## 9. Development Notes

### 9.1 Known Patterns to Follow

- Use `useTheme()` hook for colors (dark/light mode)
- Use `useTranslation()` for i18n
- Use absolute imports (e.g., `@services/settingsService`)
- Follow CustomText pattern (BodyText, CaptionText, etc.)
- Use existing Icon component for icons
- Use existing Switch component for toggles
- Follow existing toast pattern (showSuccess, showError)

### 9.2 Important Constraints

- All imports MUST be absolute paths (no `../`)
- RTL support for Arabic required
- Dark mode support required
- Offline-first pattern (cache available)
- No external UI libraries beyond what's used (RN core only)

### 9.3 Performance Targets

- Settings screen load: < 1000ms
- Toggle update (optimistic): < 100ms
- API sync: < 3000ms with retry
- List rendering: 60 FPS (use React.memo for section items)

---

## 10. Risk Assessment & Mitigation

| Risk                   | Impact | Mitigation                               |
| ---------------------- | ------ | ---------------------------------------- |
| API schema changes     | High   | Document API contract, version endpoint  |
| Large settings object  | Medium | Lazy load sections, pagination if needed |
| Offline sync conflicts | Medium | Always prefer server state on reconnect  |
| RTL layout issues      | Medium | Test with Arabic locale early            |
| Performance regression | Medium | Profile with React Profiler, use memo    |

---

## 11. Timeline

**Total Estimated Duration**: 6-7 days

- **Days 1-2**: Foundation (service, hook, types) → PR
- **Days 2-4**: UI Components (refactor screen, create sections) → PR
- **Days 4-6**: API Integration (connect to TanStack Query, error handling) → PR
- **Day 6-7**: Localization, testing, QA → PR

**Parallel work**: Localization keys can be added once API contract is finalized.

---

## 12. Success Criteria

- [ ] All settings from API rendered in UI
- [ ] All toggles update backend successfully
- [ ] Offline mode preserves local changes
- [ ] Dark mode colors correct throughout
- [ ] RTL layout works for Arabic
- [ ] All 16 SDS sections visible & toggleable
- [ ] No console errors/warnings
- [ ] Network requests follow optimistic pattern
- [ ] Performance meets targets
- [ ] Test coverage > 80%
- [ ] Feature parity with Ionic app

---

## Appendix A: API Response Explanation

| Field                  | Purpose                                | Use Case                                    |
| ---------------------- | -------------------------------------- | ------------------------------------------- |
| `home.barcodeScanner`  | Show/hide barcode scanner feature      | Home screen visibility toggle               |
| `articleDetails.*`     | Which article sections to display      | Article view filtering                      |
| `dataPrivacy.*`        | Data privacy feature toggles           | Data privacy controls                       |
| `sections[0-15]`       | Enable/disable each of 16 SDS sections | Article details section visibility          |
| `location.*`           | Location data & preferences            | Auto-location, GPS tracking settings        |
| `validityAreaLanguage` | Current region & safety language       | Region-specific content, language selection |
| `appLanguage`          | App UI language                        | Interface language (en, fr, ar)             |

---

**End of Plan**
