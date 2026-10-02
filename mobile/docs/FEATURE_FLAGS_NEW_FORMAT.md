# Feature Flags - New Format

## Overview

The feature flags configuration has been restructured to a **flat, array-based format** that's optimized for:

- ✅ Backend API integration
- ✅ Admin screen management
- ✅ Database storage (SQL/NoSQL)
- ✅ Better querying and filtering
- ✅ Industry best practices

---

## New Structure

### File: `src/data/featureFlagsConfig.json`

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-01T00:00:00Z",
  "flags": [
    {
      "id": "home-carousel",
      "key": "ENABLE_HOME_CAROUSEL",
      "name": "Home Carousel",
      "description": "Show image carousel on home screen",
      "category": "ui",
      "type": "boolean",
      "enabled": true,
      "defaultValue": true,
      "targeting": {
        "rolloutPercentage": 100,
        "environments": ["development", "staging", "production"],
        "userSegments": []
      },
      "config": {},
      "metadata": {
        "tags": ["ui", "home", "carousel"],
        "owner": "product-team",
        "priority": "high"
      }
    }
  ]
}
```

---

## Key Improvements

### 1. **Flat Array Structure**

**Before (Nested):**

```json
{
  "featureFlags": {
    "ui": {
      "ENABLE_HOME_CAROUSEL": { ... }
    }
  }
}
```

**After (Flat):**

```json
{
  "flags": [
    { "id": "home-carousel", "key": "ENABLE_HOME_CAROUSEL", ... }
  ]
}
```

**Benefits:**

- ✅ Direct array mapping for database storage
- ✅ Easy to query with SQL/NoSQL
- ✅ Simple pagination support
- ✅ Better for REST API endpoints

---

### 2. **Rich Metadata**

Each flag now includes:

| Field          | Type    | Purpose                      | Example                    |
| -------------- | ------- | ---------------------------- | -------------------------- |
| `id`           | string  | Unique identifier (URL-safe) | `"home-carousel"`          |
| `key`          | string  | Code reference key           | `"ENABLE_HOME_CAROUSEL"`   |
| `name`         | string  | Display name for admin UI    | `"Home Carousel"`          |
| `description`  | string  | Human-readable description   | `"Show image carousel..."` |
| `category`     | enum    | Feature category             | `"ui"`                     |
| `type`         | enum    | Value type                   | `"boolean"`                |
| `enabled`      | boolean | Current state                | `true`                     |
| `defaultValue` | any     | Fallback value               | `true`                     |

**Benefits:**

- ✅ Admin screens can display `name` instead of technical `key`
- ✅ Easy to categorize and filter
- ✅ Type-safe value handling

---

### 3. **Separate Targeting Rules**

```json
"targeting": {
  "rolloutPercentage": 100,
  "environments": ["development", "staging", "production"],
  "userSegments": []
}
```

**Benefits:**

- ✅ Clear separation of concerns
- ✅ Easy to add new targeting rules (A/B testing, user segments)
- ✅ Backend can evaluate complex targeting logic

---

### 4. **Optional Config Object**

```json
"config": {
  "showOnFirstLaunchOnly": true,
  "skipEnabled": true,
  "autoPlayEnabled": false
}
```

**Benefits:**

- ✅ Feature-specific configuration
- ✅ No need for separate config files
- ✅ Type-safe with TypeScript

---

### 5. **Admin-Friendly Metadata**

```json
"metadata": {
  "tags": ["ui", "home", "carousel"],
  "owner": "product-team",
  "priority": "high"
}
```

**Benefits:**

- ✅ Tags for search and filtering
- ✅ Owner for accountability
- ✅ Priority for UI sorting

---

## Categories

| Category       | Purpose                    | Examples                          |
| -------------- | -------------------------- | --------------------------------- |
| `ui`           | User interface toggles     | Navigation, themes, layouts       |
| `feature`      | Core feature flags         | Onboarding, notifications, auth   |
| `social`       | Social integrations        | Google, Apple, Facebook login     |
| `analytics`    | Tracking & monitoring      | Analytics, performance monitoring |
| `experimental` | Beta/experimental features | New UI, AI features, real-time    |
| `debug`        | Development tools          | Debug info, feature flags screen  |

---

## Type System

```typescript
export interface FeatureFlag {
  id: string;                           // Unique ID (kebab-case)
  key: string;                          // Code key (SCREAMING_SNAKE_CASE)
  name: string;                         // Display name
  description: string;                  // Description
  category: 'ui' | 'feature' | ...;    // Category
  type: 'boolean' | 'string' | ...;    // Value type
  enabled: boolean;                     // Current state
  defaultValue: any;                    // Fallback value
  targeting: FeatureFlagTargeting;      // Targeting rules
  config?: Record<string, any>;         // Optional config
  metadata: FeatureFlagMetadata;        // Admin metadata
}
```

---

## API Integration

### Backend Endpoint Structure

**GET `/api/v1/feature-flags`**

```json
{
  "version": "1.0.0",
  "lastUpdated": "2025-01-01T00:00:00Z",
  "flags": [...]
}
```

**GET `/api/v1/feature-flags/:id`**

```json
{
  "id": "home-carousel",
  "key": "ENABLE_HOME_CAROUSEL",
  ...
}
```

**PUT `/api/v1/feature-flags/:id`**

```json
{
  "enabled": true,
  "targeting": {
    "rolloutPercentage": 50
  }
}
```

**Query Params:**

- `?category=ui` - Filter by category
- `?enabled=true` - Filter by state
- `?tags=home,ui` - Filter by tags
- `?search=carousel` - Search by name/description

---

## Admin Screen UI

### List View

```
┌─────────────────────────────────────────────────┐
│ Feature Flags                    [+ New Flag]   │
├─────────────────────────────────────────────────┤
│ Filter: [All ▼] [ui ▼] [enabled ▼]             │
├─────────────────────────────────────────────────┤
│ ● Home Carousel                          [ON]   │
│   Show image carousel on home screen            │
│   ui • product-team • high priority             │
├─────────────────────────────────────────────────┤
│ ● Drawer Navigation                      [ON]   │
│   Enable drawer navigation menu                 │
│   ui • product-team • high priority             │
└─────────────────────────────────────────────────┘
```

### Edit View

```
┌─────────────────────────────────────────────────┐
│ Edit Feature Flag                               │
├─────────────────────────────────────────────────┤
│ Name: [Home Carousel                        ]   │
│ Key:  [ENABLE_HOME_CAROUSEL                 ]   │
│ Description:                                    │
│ [Show image carousel on home screen         ]   │
│                                                 │
│ Category: [ui ▼]                                │
│ Status:   [● Enabled]                           │
│                                                 │
│ Targeting:                                      │
│ • Rollout: [████████████████░░] 100%            │
│ • Environments: [✓] Dev [✓] Staging [✓] Prod   │
│                                                 │
│ Metadata:                                       │
│ • Owner: [product-team]                         │
│ • Priority: [high ▼]                            │
│ • Tags: [ui] [home] [carousel]                  │
│                                                 │
│          [Cancel]  [Save Changes]               │
└─────────────────────────────────────────────────┘
```

---

## Database Schema

### SQL Example (PostgreSQL)

```sql
CREATE TABLE feature_flags (
  id VARCHAR(255) PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL,
  type VARCHAR(20) NOT NULL,
  enabled BOOLEAN DEFAULT false,
  default_value JSONB,
  targeting JSONB NOT NULL,
  config JSONB,
  metadata JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_category ON feature_flags(category);
CREATE INDEX idx_enabled ON feature_flags(enabled);
CREATE INDEX idx_key ON feature_flags(key);
```

### NoSQL Example (MongoDB)

```javascript
{
  _id: "home-carousel",
  key: "ENABLE_HOME_CAROUSEL",
  name: "Home Carousel",
  description: "Show image carousel on home screen",
  category: "ui",
  type: "boolean",
  enabled: true,
  defaultValue: true,
  targeting: {
    rolloutPercentage: 100,
    environments: ["development", "staging", "production"]
  },
  metadata: {
    tags: ["ui", "home", "carousel"],
    owner: "product-team",
    priority: "high"
  },
  createdAt: ISODate("2025-01-01"),
  updatedAt: ISODate("2025-01-01")
}
```

---

## Migration Guide

### Old Format → New Format

**Old:**

```json
{
  "featureFlags": {
    "ui": {
      "ENABLE_HOME_CAROUSEL": {
        "enabled": true,
        "description": "...",
        "rolloutPercentage": 100,
        "environments": ["development"]
      }
    }
  }
}
```

**New:**

```json
{
  "flags": [
    {
      "id": "home-carousel",
      "key": "ENABLE_HOME_CAROUSEL",
      "name": "Home Carousel",
      "description": "...",
      "category": "ui",
      "type": "boolean",
      "enabled": true,
      "defaultValue": true,
      "targeting": {
        "rolloutPercentage": 100,
        "environments": ["development"]
      },
      "metadata": {
        "tags": ["ui"],
        "owner": "product-team",
        "priority": "medium"
      }
    }
  ]
}
```

---

## Usage Examples

### In Code (Same as before)

```typescript
import { useFeatureFlagsStore } from '@stores/featureFlagsStore';

// Check if feature is enabled
const showCarousel = useFeatureFlagsStore(state =>
  state.isFeatureEnabled('ENABLE_HOME_CAROUSEL'),
);

// Get full feature flag details
const flag = useFeatureFlagsStore(state =>
  state.getFeatureFlag('ENABLE_HOME_CAROUSEL'),
);

// Get flags by category
const uiFlags = useFeatureFlagsStore(state =>
  state.getFeatureFlagsByCategory('ui'),
);
```

---

## Benefits Summary

| Aspect              | Old Format        | New Format        |
| ------------------- | ----------------- | ----------------- |
| Structure           | Nested objects    | Flat array        |
| Backend Integration | Complex           | Simple            |
| Admin UI            | Hard to build     | Easy to build     |
| Filtering           | Manual iteration  | Array methods     |
| Database            | Complex mapping   | Direct mapping    |
| API Design          | Complex endpoints | RESTful endpoints |
| Scalability         | Limited           | Excellent         |
| Query Performance   | Slower            | Faster            |
| Maintenance         | Harder            | Easier            |

---

## Next Steps

1. **Backend Implementation**

   - Create REST API endpoints
   - Add database migrations
   - Implement CRUD operations

2. **Admin Screen**

   - Build feature flag management UI
   - Add filtering and search
   - Implement bulk operations

3. **Enhanced Features**

   - Add user segment targeting
   - Implement A/B testing support
   - Add flag dependencies
   - Add audit logging

4. **Documentation**
   - API documentation
   - Admin screen user guide
   - Developer onboarding docs
