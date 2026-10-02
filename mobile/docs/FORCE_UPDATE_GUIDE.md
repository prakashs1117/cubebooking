# Force Update — Backend Integration Guide

This document describes the API contract for the app's force update mechanism.
When the backend returns a `minimumVersion` higher than the user's installed version,
the app blocks all access and shows a mandatory "Update Now" screen.

---

## How It Works

1. On every app launch, the app calls `GET /app-version`
2. The response is compared against the app's current version (stored in `appConfig.json`)
3. If `currentVersion < minimumVersion` → force update modal is shown, app is blocked
4. The user taps **Update on App Store / Play Store** → redirected to the store listing
5. If the API call fails for any reason (no network, 5xx, timeout) → user is let in (**fail open**)

---

## API Endpoint

```
GET /api/v1/app-version
```

No authentication required. This endpoint must be publicly accessible — it is called
before the user logs in.

### Response — `200 OK`

```json
{
  "minimumVersion": "1.2.0",
  "latestVersion": "1.3.0",
  "iosStoreUrl": "https://apps.apple.com/app/id123456789",
  "androidStoreUrl": "https://play.google.com/store/apps/details?id=com.pharmaconnect"
}
```

| Field             | Type            | Required | Description                                                                              |
| ----------------- | --------------- | -------- | ---------------------------------------------------------------------------------------- |
| `minimumVersion`  | string (semver) | **Yes**  | Oldest version allowed to run the app. Any version below this is force-updated.          |
| `latestVersion`   | string (semver) | **Yes**  | The latest published version. Shown in the modal UI ("Version X.X.X is now available").  |
| `iosStoreUrl`     | string (URL)    | No       | Deep link to the iOS App Store listing. Falls back to `appConfig.json` value if omitted. |
| `androidStoreUrl` | string (URL)    | No       | Deep link to the Google Play listing. Falls back to `appConfig.json` value if omitted.   |

---

## Version Comparison Logic

The app uses standard **semver** comparison (`MAJOR.MINOR.PATCH`):

| Current version | Minimum version | Result          |
| --------------- | --------------- | --------------- |
| `1.0.0`         | `1.0.0`         | ✅ Allowed      |
| `1.2.0`         | `1.0.0`         | ✅ Allowed      |
| `1.2.3`         | `1.2.3`         | ✅ Allowed      |
| `1.1.0`         | `1.2.0`         | ❌ Force update |
| `0.9.9`         | `1.0.0`         | ❌ Force update |
| `2.0.0`         | `1.9.9`         | ✅ Allowed      |

Comparison order: **MAJOR → MINOR → PATCH**. The first differing component decides the result.

---

## How to Trigger a Force Update

To force all users below a certain version to update, set `minimumVersion` to the
lowest version you still want to support:

```json
{
  "minimumVersion": "1.2.0",
  "latestVersion": "1.2.0"
}
```

All users running `1.0.x`, `1.1.x` will be blocked until they update.
Users already on `1.2.0` or higher are unaffected.

### To release a non-blocking update (no force)

Keep `minimumVersion` at the current minimum and only bump `latestVersion`:

```json
{
  "minimumVersion": "1.0.0",
  "latestVersion": "1.2.0"
}
```

---

## Store URLs

Store URLs can be managed in two places. The API response takes priority:

| Source                                           | Priority   | How to change                           |
| ------------------------------------------------ | ---------- | --------------------------------------- |
| API response (`iosStoreUrl` / `androidStoreUrl`) | **Higher** | Update the backend response             |
| `src/config/appConfig.json` → `app.storeUrls`    | Fallback   | Edit the JSON file and ship a new build |

**Recommendation:** Always include store URLs in the API response so they can be
updated without a new app release (e.g. if the App Store listing ID changes).

### iOS App Store URL format

```
https://apps.apple.com/app/id<APP_ID>
```

### Google Play URL format

```
https://play.google.com/store/apps/details?id=<PACKAGE_NAME>
```

---

## Current App Version

The app's current version string is read from:

```
src/config/appConfig.json → app.version
```

```json
{
  "app": {
    "version": "1.0.0"
  }
}
```

This value must be manually bumped with each release and must match the version
submitted to the App Store / Play Store.

---

## Testing Without a Device Build

### Option A — Dev override flag (no server needed)

In `src/config/appConfig.json`, set:

```json
"devOverrides": {
  "simulateForceUpdate": true
}
```

Restart Metro with cache cleared:

```bash
npm start -- --reset-cache
```

The force update modal will appear immediately on launch.
**This override only works in debug builds (`__DEV__ === true`)** — it is silently
ignored in production builds, so it cannot be accidentally shipped.

Reset to `false` when done testing.

### Option B — Local mock server (tests full API flow)

```bash
node -e "
const http = require('http');
http.createServer((req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({
    minimumVersion: '99.0.0',
    latestVersion: '99.0.0',
    iosStoreUrl: 'https://apps.apple.com',
    androidStoreUrl: 'https://play.google.com/store'
  }));
}).listen(3001, () => console.log('Mock server running on :3001'));
"
```

Then point the app at localhost:

```bash
npm run api:local
```

---

## Error Handling

| Scenario                                          | App behaviour                         |
| ------------------------------------------------- | ------------------------------------- |
| API returns `200` with `minimumVersion` > current | Force update modal shown, app blocked |
| API returns `200` with `minimumVersion` ≤ current | User proceeds normally                |
| Network timeout / no internet                     | User proceeds normally (fail open)    |
| API returns `4xx` / `5xx`                         | User proceeds normally (fail open)    |
| Malformed JSON response                           | User proceeds normally (fail open)    |

---

## Relevant Files

| File                                         | Purpose                                                 |
| -------------------------------------------- | ------------------------------------------------------- |
| `src/services/api/appVersion.service.ts`     | API call, version comparison logic, dev override        |
| `src/services/api/endpoints.ts`              | `ENDPOINTS.VERSION.CHECK` constant (`/app-version`)     |
| `src/components/common/ForceUpdateModal.tsx` | Blocking modal UI                                       |
| `src/config/appConfig.json`                  | Current app version, fallback store URLs, dev overrides |
| `App.tsx`                                    | Calls `checkAppVersion()` on startup, renders modal     |
