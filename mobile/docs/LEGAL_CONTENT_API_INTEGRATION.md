# Legal Content API Integration Guide

## Overview

The Terms and Privacy content system now supports **dynamic content loading** from JSON files or API endpoints. This allows you to update legal content without rebuilding the app.

## 📁 Architecture

```
src/
├── data/legal/                  # JSON data files
│   ├── privacyPolicy.json      # Privacy Policy content
│   └── termsOfService.json     # Terms of Service content
│
├── types/
│   └── legal.types.ts          # TypeScript types
│
├── services/
│   └── legalContentService.ts  # Content loading service
│
├── hooks/
│   └── useLegalContent.ts      # React hooks
│
└── components/common/
    ├── TermsAndPrivacyModal.tsx        # Static (from localization)
    └── TermsAndPrivacyModalDynamic.tsx # Dynamic (from JSON/API)
```

## 🔄 Data Flow

```
┌──────────────────────────────────────────────────────────┐
│                    Component Layer                        │
│                                                           │
│  TermsAndPrivacyModalDynamic                            │
│          │                                                │
│          ▼                                                │
│  useLegalContent() Hook                                  │
└──────────────────┬────────────────────────────────────────┘
                   │
                   ▼
┌──────────────────────────────────────────────────────────┐
│                   Service Layer                           │
│                                                           │
│  legalContentService                                      │
│          │                                                │
│          ├─────► Cache (AsyncStorage)                    │
│          │         ├─ Check cache                        │
│          │         └─ If valid, return cached            │
│          │                                                │
│          ├─────► JSON Files (current)                    │
│          │         ├─ privacyPolicy.json                 │
│          │         └─ termsOfService.json                │
│          │                                                │
│          └─────► API Endpoint (future)                   │
│                    └─ GET /legal/{type}                  │
└──────────────────────────────────────────────────────────┘
```

## 📄 JSON Structure

### Privacy Policy / Terms of Service Format

```json
{
  "version": "1.0",
  "lastUpdated": "2026-02-28",
  "languages": {
    "en": {
      "title": "Privacy Policy",
      "lastUpdatedLabel": "Last Updated",
      "lastUpdatedDate": "February 28, 2026",
      "sections": [
        {
          "id": "introduction",
          "order": 1,
          "title": "1. Introduction",
          "content": "Content text here...",
          "icon": "shield-check"
        }
      ]
    },
    "fr": {
      /* French content */
    },
    "ar": {
      /* Arabic content */
    }
  }
}
```

### Field Descriptions

| Field                               | Type                | Required | Description                           |
| ----------------------------------- | ------------------- | -------- | ------------------------------------- |
| `version`                           | string              | Yes      | Document version for tracking updates |
| `lastUpdated`                       | string (YYYY-MM-DD) | Yes      | Date of last update                   |
| `languages`                         | object              | Yes      | Content for each language             |
| `languages.{lang}.title`            | string              | Yes      | Document title                        |
| `languages.{lang}.lastUpdatedLabel` | string              | Yes      | Label for "Last Updated"              |
| `languages.{lang}.lastUpdatedDate`  | string              | Yes      | Formatted date string                 |
| `languages.{lang}.sections`         | array               | Yes      | Array of content sections             |
| `section.id`                        | string              | Yes      | Unique section identifier             |
| `section.order`                     | number              | Yes      | Display order (1, 2, 3...)            |
| `section.title`                     | string              | Yes      | Section heading                       |
| `section.content`                   | string              | Yes      | Section content (can include \n)      |
| `section.icon`                      | string              | No       | Icon name from icon system            |

## 🔌 API Integration

### Step 1: API Endpoint Setup

Create endpoints for your backend:

```
GET /api/legal/privacy_policy
GET /api/legal/terms_of_service
```

### Step 2: API Response Format

Your API should return:

```json
{
  "success": true,
  "data": [
    {
      "document_type": "privacy_policy",
      "document_version": "1.0",
      "last_updated": "2026-02-28",
      "language": "en",
      "title": "Privacy Policy",
      "last_updated_label": "Last Updated",
      "last_updated_date": "February 28, 2026",
      "sections": [
        {
          "section_id": "introduction",
          "section_order": 1,
          "section_title": "1. Introduction",
          "section_content": "Content text...",
          "section_icon": "shield-check"
        }
      ]
    },
    {
      "document_type": "privacy_policy",
      "document_version": "1.0",
      "last_updated": "2026-02-28",
      "language": "fr",
      "title": "Politique de confidentialité",
      ...
    },
    {
      "document_type": "privacy_policy",
      "document_version": "1.0",
      "last_updated": "2026-02-28",
      "language": "ar",
      "title": "سياسة الخصوصية",
      ...
    }
  ],
  "timestamp": "2026-02-28T12:00:00Z"
}
```

### Step 3: Configure Service

Update `src/services/legalContentService.ts`:

```typescript
const defaultConfig: LegalContentConfig = {
  useApi: true, // ✅ Enable API
  apiEndpoint: 'https://api.yourapp.com/api', // ✅ Set your API URL
  cacheEnabled: true,
  cacheExpiryMs: 24 * 60 * 60 * 1000, // 24 hours
};
```

Or set environment variable:

```bash
# .env
LEGAL_CONTENT_API_URL=https://api.yourapp.com/api
```

### Step 4: Test API Integration

```typescript
import { getLegalContent } from '@services/legalContentService';

// Test privacy policy
const response = await getLegalContent('privacy', {
  useApi: true,
  apiEndpoint: 'https://api.yourapp.com/api',
});

console.log(response.source); // Should be 'api'
console.log(response.data); // Your content
```

## 🔧 Service Configuration

### Configuration Options

```typescript
interface LegalContentConfig {
  useApi: boolean; // Use API instead of JSON
  apiEndpoint?: string; // API base URL
  cacheEnabled: boolean; // Enable caching
  cacheExpiryMs: number; // Cache lifetime (ms)
}
```

### Configuration Examples

**Development (JSON files):**

```typescript
{
  useApi: false,
  cacheEnabled: true,
  cacheExpiryMs: 60 * 60 * 1000, // 1 hour
}
```

**Production (API):**

```typescript
{
  useApi: true,
  apiEndpoint: 'https://api.yourapp.com/api',
  cacheEnabled: true,
  cacheExpiryMs: 24 * 60 * 60 * 1000, // 24 hours
}
```

**No Cache (Development):**

```typescript
{
  useApi: false,
  cacheEnabled: false,
  cacheExpiryMs: 0,
}
```

## 📦 Caching System

### How Caching Works

1. **First Load**: Fetches from API/JSON → Saves to AsyncStorage
2. **Subsequent Loads**: Reads from cache if not expired
3. **Expired Cache**: Fetches fresh data → Updates cache
4. **Manual Refresh**: Clears cache → Fetches fresh data

### Cache Management

```typescript
import { clearLegalCache } from '@services/legalContentService';

// Clear specific document
await clearLegalCache('privacy');
await clearLegalCache('terms');

// Clear all legal content cache
await clearLegalCache();
```

### Cache Keys

- Privacy Policy: `@legal_content_privacy`
- Terms of Service: `@legal_content_terms`

### Cache Data Structure

```typescript
{
  data: LegalDocument,
  timestamp: 1709125200000
}
```

## 🎣 Using the Hooks

### useLegalContent Hook

Load both Privacy and Terms:

```typescript
import { useLegalContent } from '@hooks/useLegalContent';

const MyComponent = () => {
  const {
    privacyPolicy, // Privacy content
    termsOfService, // Terms content
    isLoading, // Loading state
    error, // Error message
    source, // 'json' | 'api' | 'cache'
    refresh, // Refresh content
    clearCache, // Clear cache
  } = useLegalContent();

  if (isLoading) return <Loading />;
  if (error) return <Error message={error} />;

  return (
    <View>
      <Text>{privacyPolicy?.title}</Text>
      {privacyPolicy?.sections.map(section => (
        <Section key={section.id} {...section} />
      ))}
    </View>
  );
};
```

### usePrivacyPolicy Hook

Load only Privacy Policy:

```typescript
import { usePrivacyPolicy } from '@hooks/useLegalContent';

const PrivacyScreen = () => {
  const {
    content, // Privacy policy content
    isLoading,
    error,
    source,
    reload, // Reload function
  } = usePrivacyPolicy();

  return (
    <ScrollView>
      <Text>{content?.title}</Text>
      {content?.sections.map(section => (
        <Section key={section.id} {...section} />
      ))}
    </ScrollView>
  );
};
```

### useTermsOfService Hook

Load only Terms of Service:

```typescript
import { useTermsOfService } from '@hooks/useLegalContent';

const TermsScreen = () => {
  const { content, isLoading, error, source, reload } = useTermsOfService();

  // Same usage as usePrivacyPolicy
};
```

## 🔄 Updating Content

### Via JSON Files (Current)

1. Edit the JSON files:

   - `src/data/legal/privacyPolicy.json`
   - `src/data/legal/termsOfService.json`

2. Update version and lastUpdated:

   ```json
   {
     "version": "1.1",
     "lastUpdated": "2026-03-15",
     ...
   }
   ```

3. Rebuild the app or use hot reload

### Via API (Future)

1. Update content in your CMS or admin panel
2. API automatically serves new content
3. App fetches updated content on next load
4. No app rebuild required! ✨

## 🌐 Adding New Languages

### JSON Files

Add a new language to the JSON:

```json
{
  "version": "1.0",
  "lastUpdated": "2026-02-28",
  "languages": {
    "en": { /* English */ },
    "fr": { /* French */ },
    "ar": { /* Arabic */ },
    "es": {  // ← New Spanish content
      "title": "Política de Privacidad",
      "lastUpdatedLabel": "Última actualización",
      "lastUpdatedDate": "28 de febrero de 2026",
      "sections": [...]
    }
  }
}
```

### API Response

Return additional language in API response:

```json
{
  "success": true,
  "data": [
    { "language": "en", ... },
    { "language": "fr", ... },
    { "language": "ar", ... },
    { "language": "es", ... }  // ← New
  ]
}
```

## 📊 Monitoring & Analytics

### Track Content Source

```typescript
const { source } = useLegalContent();

// Log to analytics
analytics.track('legal_content_loaded', {
  source: source, // 'json' | 'api' | 'cache'
  timestamp: new Date(),
});
```

### Track Acceptance

```typescript
const handleAccept = async () => {
  await acceptTerms();

  // Log acceptance
  analytics.track('terms_accepted', {
    version: privacyPolicy?.version,
    source: source,
    timestamp: new Date(),
  });
};
```

## 🧪 Testing

### Test JSON Loading

```typescript
import { getLegalContent } from '@services/legalContentService';

describe('Legal Content Service', () => {
  it('should load from JSON', async () => {
    const response = await getLegalContent('privacy', {
      useApi: false,
      cacheEnabled: false,
    });

    expect(response.success).toBe(true);
    expect(response.source).toBe('json');
    expect(response.data).toBeDefined();
  });
});
```

### Test API Loading

```typescript
it('should load from API', async () => {
  const response = await getLegalContent('privacy', {
    useApi: true,
    apiEndpoint: 'https://test-api.com',
    cacheEnabled: false,
  });

  expect(response.success).toBe(true);
  expect(response.source).toBe('api');
});
```

### Test Caching

```typescript
it('should use cache on second load', async () => {
  // First load - should fetch
  const first = await getLegalContent('privacy');
  expect(first.source).toBe('json');

  // Second load - should use cache
  const second = await getLegalContent('privacy');
  expect(second.source).toBe('cache');
});
```

## 🚀 Migration Guide

### From Static to Dynamic

**Before (Static):**

```tsx
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';

<TermsAndPrivacyModal
  visible={visible}
  onClose={onClose}
  onAccept={onAccept}
/>;
```

**After (Dynamic):**

```tsx
import TermsAndPrivacyModalDynamic from '@components/common/TermsAndPrivacyModalDynamic';

<TermsAndPrivacyModalDynamic
  visible={visible}
  onClose={onClose}
  onAccept={onAccept}
/>;
```

That's it! The props are identical.

## 🔐 Security Considerations

### API Authentication

Add authentication headers:

```typescript
const response = await fetch(`${endpoint}/legal/${documentType}`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`, // Add auth
    'X-API-Key': apiKey, // Or API key
  },
});
```

### Content Validation

Validate received content:

```typescript
const validateContent = (data: any): boolean => {
  // Check required fields
  if (!data.version || !data.languages) {
    return false;
  }

  // Check each language has required sections
  for (const lang of Object.values(data.languages)) {
    if (!lang.title || !lang.sections) {
      return false;
    }
  }

  return true;
};
```

### HTTPS Only

Ensure API uses HTTPS:

```typescript
if (!apiEndpoint.startsWith('https://')) {
  console.warn('API endpoint must use HTTPS');
}
```

## 📈 Performance Tips

1. **Prefetch Content**: Load content before needed

   ```typescript
   import { prefetchLegalContent } from '@services/legalContentService';

   // On app startup
   useEffect(() => {
     prefetchLegalContent();
   }, []);
   ```

2. **Enable Caching**: Reduce API calls

   ```typescript
   { cacheEnabled: true, cacheExpiryMs: 86400000 }
   ```

3. **Lazy Load**: Only load when modal opens
   ```typescript
   // Content loads automatically when modal becomes visible
   ```

## 🐛 Troubleshooting

### Content Not Loading

1. Check API endpoint is correct
2. Verify JSON file paths
3. Check network connection
4. Clear cache and retry

### Wrong Language Displayed

1. Verify i18n language setting
2. Check language exists in content
3. Fallback to English if missing

### Cache Not Clearing

```typescript
// Manual cache clear
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.removeItem('@legal_content_privacy');
await AsyncStorage.removeItem('@legal_content_terms');
```

## 📚 API Examples

### Node.js/Express Backend

```javascript
app.get('/api/legal/:type', async (req, res) => {
  const { type } = req.params; // 'privacy_policy' or 'terms_of_service'

  try {
    // Load from database
    const documents = await db.legalDocuments.find({
      document_type: type,
      active: true,
    });

    res.json({
      success: true,
      data: documents,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
});
```

### Database Schema (MongoDB)

```javascript
{
  _id: ObjectId,
  document_type: 'privacy_policy',
  document_version: '1.0',
  last_updated: ISODate('2026-02-28'),
  language: 'en',
  title: 'Privacy Policy',
  last_updated_label: 'Last Updated',
  last_updated_date: 'February 28, 2026',
  sections: [
    {
      section_id: 'introduction',
      section_order: 1,
      section_title: '1. Introduction',
      section_content: 'Content...',
      section_icon: 'shield-check'
    }
  ],
  active: true,
  created_at: ISODate('2026-02-28'),
  updated_at: ISODate('2026-02-28')
}
```

---

**Version:** 1.0.0
**Last Updated:** February 28, 2026
**Status:** ✅ Ready for Production
