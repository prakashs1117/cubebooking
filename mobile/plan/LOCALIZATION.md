# Localization Setup

This TodoApp includes comprehensive localization support for **English**, **French**, and **Arabic** languages with RTL (Right-to-Left) support for Arabic.

## 📁 Project Structure

```
src/
├── localization/
│   ├── i18n.ts                 # i18next configuration
│   └── translations/
│       ├── en.json             # English translations
│       ├── fr.json             # French translations
│       └── ar.json             # Arabic translations
└── components/
    └── LocalizationDemo.tsx    # Demo component showing localization features
```

## 🔑 Translation Key Structure

Translation keys follow a structured prefix pattern for easy identification and searching:

```json
{
  "common": {
    "submit": "Submit",
    "cancel": "Cancel"
  },
  "navigation": {
    "home": "Home",
    "settings": "Settings"
  },
  "auth": {
    "login": "Login",
    "register": "Register"
  },
  "home": {
    "welcome": "Welcome to TodoApp"
  },
  "settings": {
    "title": "Settings"
  }
}
```

### Key Prefixes:

- `common.*` - Common actions and buttons (submit, cancel, save, etc.)
- `navigation.*` - Navigation items and menu labels
- `auth.*` - Authentication related text
- `home.*` - Home screen content
- `settings.*` - Settings screen content

## 🌐 Supported Languages

| Language | Code | RTL Support | Status      |
| -------- | ---- | ----------- | ----------- |
| English  | `en` | No          | ✅ Complete |
| French   | `fr` | No          | ✅ Complete |
| Arabic   | `ar` | Yes         | ✅ Complete |

## 🛠 Dependencies

```json
{
  "react-native-localize": "^3.6.1",
  "i18next": "^23.x.x",
  "react-i18next": "^14.x.x"
}
```

## 🚀 Usage Examples

### Basic Translation

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();

  return (
    <Text>{t('common.submit')}</Text> // "Submit" | "Soumettre" | "إرسال"
  );
};
```

### Language Switching

```typescript
const { i18n } = useTranslation();

const changeLanguage = (language: string) => {
  i18n.changeLanguage(language); // 'en' | 'fr' | 'ar'
};
```

### RTL Support for Arabic

```typescript
import { I18nManager } from 'react-native';

const handleArabic = () => {
  i18n.changeLanguage('ar');
  I18nManager.allowRTL(true);
  I18nManager.forceRTL(true);
  // In production, restart the app for RTL to take full effect
};
```

## 🎯 Features

- **Automatic Language Detection**: Uses device locale as default
- **RTL Layout Support**: Proper Arabic text rendering and layout
- **Structured Keys**: Easy to search and maintain translation keys
- **Fallback Support**: Falls back to English if translation missing
- **Type Safety**: Full TypeScript support
- **Live Switching**: Change languages without app restart (except RTL)

## 📝 Adding New Translations

1. Add new keys to all translation files:

   ```json
   // en.json
   {
     "newSection": {
       "newKey": "English Text"
     }
   }

   // fr.json
   {
     "newSection": {
       "newKey": "Texte Français"
     }
   }

   // ar.json
   {
     "newSection": {
       "newKey": "نص عربي"
     }
   }
   ```

2. Use in components:
   ```typescript
   const text = t('newSection.newKey');
   ```

## 🧪 Demo Component

The `LocalizationDemo` component showcases:

- Language switching interface
- RTL text alignment for Arabic
- All translation categories
- Interactive buttons with localized text
- Current language display

Run the app to see the localization demo in action!

## 🔧 Configuration

The i18n configuration is in `src/localization/i18n.ts`:

- Automatic device language detection
- English fallback language
- React Suspense disabled for React Native compatibility
- JSON v4 compatibility mode

## 📱 Testing

1. **Run the app**: `npm run ios` or `npm run android`
2. **Switch languages**: Use the language buttons in the demo
3. **Test RTL**: Switch to Arabic to see RTL layout
4. **Lint check**: `npm run lint`
5. **Type check**: `npx tsc --noEmit`
