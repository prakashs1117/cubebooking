# Events Screen Error Handling & Retry

## Overview

The Events screen now has comprehensive error handling with multiple ways for users to retry fetching data.

## Features Implemented

### ✅ 1. **Retry Button**

- Large, accessible button in the error state
- Shows loading indicator while retrying
- Disabled during retry to prevent multiple requests
- Themed to match app design

### ✅ 2. **Pull-to-Refresh**

- Works on the error screen
- Native iOS/Android refresh control
- Visual feedback with spinner
- Hint text prompts users to try pull-to-refresh

### ✅ 3. **Enhanced Error UI**

- Visual error icon with subtle background
- Clear error title and message
- Better typography hierarchy
- Centered, card-like layout
- Fully themed (light/dark mode support)

### ✅ 4. **Automatic Retries**

- React Query configured with `retry: 3`
- Exponential backoff between retries
- Works automatically on network failures

### ✅ 5. **Multilingual Support**

All error states and retry buttons are fully localized:

- 🇬🇧 English
- 🇫🇷 French
- 🇸🇦 Arabic (with RTL support)

## User Experience

### Error State Flow

```
Network Error
     ↓
Display Error Screen
     ├─→ Tap "Retry" button → Refetch data
     ├─→ Pull-to-refresh → Refetch data
     └─→ Wait for auto-retry (3 attempts)
```

### Visual Layout

```
┌─────────────────────────────┐
│                             │
│        ⚠️  [Icon]           │
│                             │
│   Failed to load events     │
│                             │
│ Unable to fetch events.     │
│ Please check your           │
│ connection and try again.   │
│                             │
│    ┌─────────────┐         │
│    │   Retry     │         │
│    └─────────────┘         │
│                             │
│  Pull to refresh            │
│                             │
└─────────────────────────────┘
```

## Technical Details

### State Management

- Uses TanStack React Query for data fetching
- `refetch()` function triggered by both retry methods
- `isRefetching` state prevents duplicate requests
- Proper loading states throughout

### Error Detection

- Network errors caught and displayed
- API errors (4xx, 5xx) shown with specific messages
- Timeout errors handled gracefully

### Performance

- React Query caching prevents unnecessary refetches
- 5-minute stale time for successful responses
- Smart retry logic with exponential backoff

## Translation Keys

### English (`en.json`)

```json
"events": {
  "loading": "Loading events...",
  "pullToRefresh": "Pull to refresh",
  "retryButton": "Retry",
  "error": {
    "title": "Failed to load events",
    "message": "Unable to fetch events. Please check your connection and try again."
  }
}
```

### French (`fr.json`)

```json
"events": {
  "loading": "Chargement des événements...",
  "pullToRefresh": "Tirer pour actualiser",
  "retryButton": "Réessayer",
  "error": {
    "title": "Échec du chargement des événements",
    "message": "Impossible de récupérer les événements. Veuillez vérifier votre connexion et réessayer."
  }
}
```

### Arabic (`ar.json`)

```json
"events": {
  "loading": "جاري تحميل الفعاليات...",
  "pullToRefresh": "اسحب للتحديث",
  "retryButton": "إعادة المحاولة",
  "error": {
    "title": "فشل تحميل الفعاليات",
    "message": "تعذر جلب الفعاليات. يرجى التحقق من اتصالك وإعادة المحاولة."
  }
}
```

## Code Changes

### File: `src/screens/EventsScreen.tsx`

**Added:**

- `TouchableOpacity` import for retry button
- Enhanced error state component
- Pull-to-refresh on error screen
- Loading indicator during retry
- Better styling for error state

**Styling Updates:**

- `errorScrollContainer` - Makes error state scrollable
- `errorContainer` - Centers error content
- `errorIconContainer` - Circular icon background
- `errorIcon` - Large warning emoji
- `errorTitle` - Bold error heading
- `errorMessage` - Readable error description
- `retryButton` - Primary action button
- `retryButtonText` - Button label
- `pullToRefreshHint` - Subtle hint text

## Testing Scenarios

### 1. Network Error

**Steps:**

1. Disconnect from internet
2. Open Events screen
3. See error state with retry button

**Expected:**

- Error message displays
- Retry button is enabled
- Pull-to-refresh works

### 2. API Timeout

**Steps:**

1. Set very slow network (throttled)
2. Open Events screen
3. Wait for timeout (30 seconds)

**Expected:**

- Timeout error shows after 30s
- Retry button available
- Can retry immediately

### 3. Successful Retry

**Steps:**

1. See error state
2. Reconnect to internet
3. Tap "Retry" button

**Expected:**

- Button shows loading spinner
- Data fetches successfully
- Screen shows events

### 4. Pull-to-Refresh on Error

**Steps:**

1. See error state
2. Pull down on screen
3. Release to refresh

**Expected:**

- Native refresh indicator
- Data refetches
- Error clears on success

## Best Practices Applied

✅ **Progressive Enhancement** - Multiple retry methods
✅ **User Feedback** - Loading states, error messages
✅ **Accessibility** - Large touch targets, clear labels
✅ **Internationalization** - Full translation support
✅ **Theme Support** - Works in light and dark mode
✅ **Native Patterns** - Platform-specific refresh controls
✅ **Performance** - Smart caching and retry logic

## Future Improvements

- [ ] Add offline queue for when network returns
- [ ] Show cached data while fetching fresh data
- [ ] Add error analytics tracking
- [ ] Implement exponential backoff indicator
- [ ] Add network status banner
