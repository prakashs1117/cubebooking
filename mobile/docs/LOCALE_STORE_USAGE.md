# Locale Store Usage Guide

## Overview

The locale store uses **Zustand + AsyncStorage** to persist device locale settings including language, calendar type, and timezone. This provides both fast in-memory access and persistence across app restarts.

## What's Stored

- **language**: Language code (e.g., "en", "fr", "ar")
- **countryCode**: Country code (e.g., "US", "FR", "SA")
- **languageTag**: Full locale tag (e.g., "en-US", "fr-FR", "ar-SA")
- **isRTL**: Boolean indicating if language is right-to-left
- **calendarType**: Calendar system (e.g., "gregorian", "japanese", "buddhist")
- **timezone**: Device timezone (e.g., "America/New_York", "Europe/Paris")

## Initialization

The locale store is automatically initialized in `App.tsx` on app startup:

```typescript
// In App.tsx
useEffect(() => {
  const { initializeLocale } = useLocaleStore.getState();
  initializeLocale();
  console.log('✅ Locale store initialized on app startup');
}, []);
```

## Usage Examples

### 1. Using the Store Directly

```typescript
import { useLocaleStore } from '@stores/localeStore';

function MyComponent() {
  const { language, timezone, calendarType, isRTL } = useLocaleStore();

  return (
    <View>
      <Text>Language: {language}</Text>
      <Text>Timezone: {timezone}</Text>
      <Text>Calendar: {calendarType}</Text>
      <Text>RTL: {isRTL ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

### 2. Using the useLocale Hook (Recommended)

```typescript
import { useLocale } from '@hooks/useLocale';

function MyComponent() {
  const {
    language,
    timezone,
    calendarType,
    isRTL,
    isArabic,
    isFrench,
    fullLocale,
  } = useLocale();

  return (
    <View>
      <Text>Full Locale: {fullLocale}</Text>
      <Text>Is Arabic: {isArabic ? 'Yes' : 'No'}</Text>
    </View>
  );
}
```

### 3. Updating Locale Settings

```typescript
import { useLocale } from '@hooks/useLocale';

function LanguageSettings() {
  const { language, setLanguage, refreshLocale } = useLocale();

  const changeToFrench = () => {
    setLanguage('fr');
  };

  const syncWithDevice = () => {
    refreshLocale(); // Re-fetch from device
  };

  return (
    <View>
      <Text>Current: {language}</Text>
      <Button title="Switch to French" onPress={changeToFrench} />
      <Button title="Sync with Device" onPress={syncWithDevice} />
    </View>
  );
}
```

### 4. In FirstLaunchCarousel (Current Implementation)

```typescript
const { language, isRTL, calendarType, timezone, initializeLocale } =
  useLocaleStore();

useEffect(() => {
  if (visible) {
    initializeLocale();
  }
}, [visible]);

const currentLang = useMemo(() => {
  const lang = language || 'en';
  return ['en', 'fr', 'ar'].includes(lang) ? lang : 'en';
}, [language]);
```

### 5. Conditional Rendering Based on Language

```typescript
import { useLocale } from '@hooks/useLocale';

function MyComponent() {
  const { language, isArabic } = useLocale();

  if (isArabic) {
    return <ArabicSpecificComponent />;
  }

  return <DefaultComponent />;
}
```

### 6. Timezone-Aware Date Formatting

```typescript
import { useLocale } from '@hooks/useLocale';

function EventTime({ timestamp }: { timestamp: number }) {
  const { timezone, languageTag } = useLocale();

  const formattedDate = new Date(timestamp).toLocaleString(languageTag, {
    timeZone: timezone,
  });

  return <Text>{formattedDate}</Text>;
}
```

### 7. Calendar-Aware Date Display

```typescript
import { useLocale } from '@hooks/useLocale';

function DateDisplay() {
  const { calendarType, languageTag } = useLocale();

  const options = {
    calendar: calendarType,
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const formattedDate = new Date().toLocaleDateString(languageTag, options);

  return <Text>{formattedDate}</Text>;
}
```

## Store Actions

### initializeLocale()

Reads device locale settings and stores them. Called automatically on app startup.

```typescript
const { initializeLocale } = useLocaleStore();
initializeLocale();
```

### setLanguage(language: string)

Manually set the app language.

```typescript
const { setLanguage } = useLocaleStore();
setLanguage('fr'); // Switch to French
```

### setTimezone(timezone: string)

Manually set the timezone.

```typescript
const { setTimezone } = useLocaleStore();
setTimezone('America/New_York');
```

### setCalendarType(calendarType: string)

Manually set the calendar system.

```typescript
const { setCalendarType } = useLocaleStore();
setCalendarType('gregorian');
```

### refreshLocale()

Re-sync with device settings (useful if user changes device language while app is running).

```typescript
const { refreshLocale } = useLocaleStore();
refreshLocale();
```

## Persistence

All locale data is automatically persisted to AsyncStorage under the key `locale-storage`. Data persists across:

- App restarts
- App updates
- Device reboots

## Benefits of Zustand + AsyncStorage

1. **Fast Access**: In-memory state for instant reads
2. **Persistence**: AsyncStorage for data that survives restarts
3. **Automatic Sync**: Changes automatically save to AsyncStorage
4. **Type Safety**: Full TypeScript support
5. **Simple API**: No complex setup or boilerplate
6. **Selective Updates**: Components only re-render when their used values change

## Debugging

The store logs helpful information:

```
📱 Device Locale Info: { language: 'fr', country: 'FR', ... }
✅ Locale initialized: { language: 'fr', ... }
🌐 Language updated: fr
🕐 Timezone updated: Europe/Paris
📅 Calendar type updated: gregorian
🔄 Locale refreshed from device: { ... }
```

## Migration from react-native-localize

If you were using `react-native-localize` directly before:

**Before:**

```typescript
import { getLocales } from 'react-native-localize';
const locales = getLocales();
const language = locales[0].languageCode;
```

**After:**

```typescript
import { useLocale } from '@hooks/useLocale';
const { language } = useLocale();
```

Much cleaner! And the data persists automatically. 🎉
