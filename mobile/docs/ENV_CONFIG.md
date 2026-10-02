# Environment Configuration Guide

## Overview

All API configuration is now centralized using environment variables via `.env` file. This ensures consistent API endpoints across all services.

## Environment Variables

### Setup

1. **Copy the example file**:

   ```bash
   cp .env.example .env
   ```

2. **Update with your values**:
   ```bash
   # Edit .env file
   API_BASE_URL=https://your-api-url.com
   API_TIMEOUT=30000
   NODE_ENV=development
   ```

### Available Variables

| Variable       | Description                     | Default                             |
| -------------- | ------------------------------- | ----------------------------------- |
| `API_BASE_URL` | Base URL for all API calls      | `https://event-poc-self.vercel.app` |
| `API_TIMEOUT`  | Request timeout in milliseconds | `30000` (30 seconds)                |
| `NODE_ENV`     | Environment mode                | `development`                       |

## Usage in Code

### Method 1: Direct Import (Recommended)

```typescript
import { API_BASE_URL, API_TIMEOUT } from '@env';

const BASE_URL = API_BASE_URL || 'fallback-url';
const TIMEOUT = parseInt(API_TIMEOUT || '30000', 10);
```

### Method 2: Centralized Config (Best for App Settings)

```typescript
import config from '@config/index';

// Access API config
const apiUrl = config.api.baseUrl;
const timeout = config.api.timeout;

// Access environment info
const isDev = config.env.isDevelopment;
```

## Files Using Environment Variables

All API services now use `.env` configuration:

1. **`src/services/api.ts`** - Main API service
2. **`src/services/api/events.service.ts`** - Events API service
3. **`src/services/api/client.ts`** - Authenticated API client (with token management)
4. **`src/config/index.ts`** - Centralized config export

## Configuration Priority

```
.env variables → config/index.ts → appConfig.json
```

1. **Environment variables** (`.env`) - Highest priority
2. **Centralized config** (`src/config/index.ts`) - Merges env vars with app settings
3. **App config JSON** (`src/config/appConfig.json`) - Static app settings

## Important Notes

### ⚠️ After Changing .env

When you modify `.env` file, you **MUST** restart Metro bundler:

```bash
# Stop Metro (Ctrl+C), then:
npm start -- --reset-cache

# Or in separate terminal:
npm run android
# or
npm run ios
```

### 🔒 Security

- **NEVER** commit `.env` to version control
- `.env` is in `.gitignore` by default
- Use `.env.example` as a template for team members
- For sensitive keys, use different `.env` files per environment:
  - `.env.development`
  - `.env.staging`
  - `.env.production`

### 📝 TypeScript Support

Type definitions are in `src/types/env.d.ts`. Add new variables there:

```typescript
declare module '@env' {
  export const API_BASE_URL: string;
  export const API_TIMEOUT: string;
  export const NODE_ENV: string;
  // Add new variables here
  export const NEW_VARIABLE: string;
}
```

## Troubleshooting

### "Cannot find module '@env'"

1. Check `babel.config.js` includes `react-native-dotenv` plugin
2. Restart Metro bundler with cache clear:
   ```bash
   npm start -- --reset-cache
   ```

### Environment variable not updating

1. Clear Metro cache:

   ```bash
   npm start -- --reset-cache
   ```

2. For Android, also clear build cache:

   ```bash
   npm run android-cache-clear
   cd android && ./gradlew clean && cd ..
   ```

3. For iOS:
   ```bash
   cd ios && rm -rf build && cd ..
   ```

### Using different URLs for different environments

Create multiple `.env` files:

```bash
.env                  # Default (development)
.env.staging          # Staging environment
.env.production       # Production environment
```

Update `babel.config.js` to switch based on environment:

```javascript
const envFile =
  process.env.NODE_ENV === 'production' ? '.env.production' : '.env';

// In plugins array:
[
  'module:react-native-dotenv',
  {
    moduleName: '@env',
    path: envFile,
    safe: false,
    allowUndefined: true,
  },
];
```

## Migration Checklist

✅ All services now use `.env` for API configuration
✅ Removed hardcoded URLs from service files
✅ Created centralized `config/index.ts`
✅ Updated type definitions in `env.d.ts`
✅ Updated `.env` and `.env.example` with correct values
✅ Documented configuration in this guide

## Examples

### Events Service

**Before:**

```typescript
import appConfig from '@config/appConfig.json';
const API_BASE_URL = appConfig.api.baseUrl;
```

**After:**

```typescript
import { API_BASE_URL } from '@env';
const BASE_URL = API_BASE_URL || 'fallback-url';
```

### Authenticated API Client

**Before:**

```typescript
let API_BASE_URL = 'http://localhost:3000/api/v1';
try {
  const env = require('@env');
  API_BASE_URL = env.API_BASE_URL || API_BASE_URL;
} catch {
  console.warn('Could not load environment variables');
}
```

**After:**

```typescript
import { API_BASE_URL, API_TIMEOUT } from '@env';
const BASE_URL = API_BASE_URL || 'https://event-poc-self.vercel.app';
const TIMEOUT = parseInt(API_TIMEOUT || '30000', 10);
```

## Best Practices

1. ✅ **Always provide fallback values** for environment variables
2. ✅ **Use centralized config** (`@config/index`) for app-wide settings
3. ✅ **Document new variables** in `.env.example` and this guide
4. ✅ **Restart Metro** after changing `.env`
5. ✅ **Never commit** `.env` file to git
6. ✅ **Use TypeScript types** from `env.d.ts` for type safety
