# Terms and Privacy Policy Feature

## Overview

This feature provides a comprehensive, production-ready implementation of a Privacy Policy and Terms of Service agreement popup for signup/signin flows. The implementation includes full localization, RTL support, theme integration, and feature flag control.

## Features

✅ **Full-screen responsive modal** with smooth animations
✅ **Scrollable tabbed content** (Privacy Policy & Terms of Service)
✅ **Acceptance checkbox** with validation
✅ **Continue button** (disabled until accepted)
✅ **Close icon** at top right corner
✅ **Dark/Light theme** support
✅ **RTL (Right-to-Left)** support for Arabic
✅ **Full localization** (English, French, Arabic)
✅ **Feature flag** integration for easy enable/disable
✅ **Persistence** of acceptance state
✅ **Custom hooks** for easy integration
✅ **Accessible** and keyboard-friendly

## Components

### 1. TermsAndPrivacyModal

**Location:** `src/components/common/TermsAndPrivacyModal.tsx`

Main modal component that displays the privacy policy and terms of service.

**Props:**

- `visible: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `onAccept: () => void` - Callback when user accepts and continues
- `requireAcceptance?: boolean` - If true, user must check the box to continue (default: true)

**Usage:**

```tsx
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';

<TermsAndPrivacyModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onAccept={handleAccept}
  requireAcceptance={true}
/>;
```

### 2. useTermsAndPrivacy Hook

**Location:** `src/hooks/useTermsAndPrivacy.ts`

Custom hook for managing Terms and Privacy acceptance state with persistence.

**Returns:**

- `isModalVisible: boolean` - Current modal visibility state
- `hasAccepted: boolean` - Whether user has accepted terms
- `isFeatureEnabled: boolean` - Whether feature flag is enabled
- `showModal: () => void` - Show the modal
- `hideModal: () => void` - Hide the modal
- `handleAccept: () => Promise<void>` - Accept and persist state
- `handleDecline: () => void` - Decline terms
- `checkAcceptance: () => Promise<boolean>` - Check if previously accepted
- `clearAcceptance: () => Promise<void>` - Clear acceptance state

**Usage:**

```tsx
import { useTermsAndPrivacy } from '@hooks/useTermsAndPrivacy';

const {
  isModalVisible,
  hasAccepted,
  isFeatureEnabled,
  showModal,
  hideModal,
  handleAccept,
  checkAcceptance,
} = useTermsAndPrivacy();

// Check on mount if user has previously accepted
useEffect(() => {
  checkAcceptance();
}, [checkAcceptance]);

// Show modal if feature enabled and not accepted
useEffect(() => {
  if (isFeatureEnabled && !hasAccepted) {
    showModal();
  }
}, [isFeatureEnabled, hasAccepted]);
```

## Icons

Three new icons were created for this feature:

1. **ShieldCheckIcon** (`shield-check`) - Privacy/Security icon
2. **FileTextIcon** (`file-text`) - Document/Terms icon
3. **CheckSquareIcon/SquareIcon** (`check-square`, `square`) - Checkbox icons

**Location:** `src/components/icons/components/`

## Localization

All text is fully localized in three languages:

### Languages Supported:

- **English** (`en.json`)
- **French** (`fr.json`)
- **Arabic** (`ar.json`)

### Translation Keys:

All keys are under the `legal` namespace:

```json
{
  "legal": {
    "headerTitle": "Legal Information",
    "lastUpdated": "Last Updated",
    "tabs": {
      "privacy": "Privacy Policy",
      "terms": "Terms of Service"
    },
    "acceptanceText": "I have read and agree to...",
    "continueButton": "Continue",
    "privacyPolicy": {
      "title": "Privacy Policy",
      "lastUpdatedDate": "February 28, 2026",
      "sections": {
        "introduction": { "title": "...", "content": "..." }
        // ... more sections
      }
    },
    "termsOfService": {
      "title": "Terms of Service",
      "lastUpdatedDate": "February 28, 2026",
      "sections": {
        "agreementToTerms": { "title": "...", "content": "..." }
        // ... more sections
      }
    }
  }
}
```

### Content Sections:

**Privacy Policy:**

1. Introduction
2. Information We Collect
3. How We Use Your Data
4. Data Security
5. Third-Party Services
6. Your Rights
7. Contact Us

**Terms of Service:**

1. Agreement to Terms
2. User Accounts
3. Acceptable Use
4. Intellectual Property
5. Limitation of Liability
6. Termination
7. Changes to Terms

## Feature Flag

**Flag Name:** `ENABLE_TERMS_AND_PRIVACY_POPUP`

**Location:** `src/config/featureFlagsConfig.json`

```json
{
  "features": {
    "ENABLE_TERMS_AND_PRIVACY_POPUP": {
      "enabled": true,
      "description": "Show privacy policy and terms of service agreement popup during signup/signin",
      "rolloutPercentage": 100,
      "environments": ["development", "staging", "production"],
      "config": {
        "requireAcceptance": true,
        "showOnSignup": true,
        "showOnSignin": false
      }
    }
  }
}
```

### Using the Feature Flag:

```tsx
import { FeatureFlag } from '@components/common/FeatureFlag';

<FeatureFlag
  flag="ENABLE_TERMS_AND_PRIVACY_POPUP"
  fallback={<AlternativeComponent />}
>
  <TermsAndPrivacyModal {...props} />
</FeatureFlag>;
```

## Integration Examples

### Example 1: Simple Integration

```tsx
import React, { useState } from 'react';
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';
import CustomButton from '@components/common/CustomButton';

const SignupScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    setAccepted(true);
    setModalVisible(false);
    // Proceed with signup
  };

  return (
    <>
      <CustomButton title="Sign Up" onPress={() => setModalVisible(true)} />

      <TermsAndPrivacyModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onAccept={handleAccept}
      />
    </>
  );
};
```

### Example 2: Using the Custom Hook

```tsx
import React, { useEffect } from 'react';
import { useTermsAndPrivacy } from '@hooks/useTermsAndPrivacy';
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';
import CustomButton from '@components/common/CustomButton';

const SignupScreen = () => {
  const {
    isModalVisible,
    hasAccepted,
    isFeatureEnabled,
    showModal,
    hideModal,
    handleAccept,
    checkAcceptance,
  } = useTermsAndPrivacy();

  // Check if user has previously accepted
  useEffect(() => {
    checkAcceptance();
  }, [checkAcceptance]);

  const handleSignup = () => {
    if (isFeatureEnabled && !hasAccepted) {
      showModal();
      return;
    }

    // Proceed with signup
    console.log('Signing up...');
  };

  return (
    <>
      <CustomButton title="Sign Up" onPress={handleSignup} />

      {isFeatureEnabled && (
        <TermsAndPrivacyModal
          visible={isModalVisible}
          onClose={hideModal}
          onAccept={handleAccept}
        />
      )}
    </>
  );
};
```

### Example 3: With Feature Flag

```tsx
import React from 'react';
import { useTermsAndPrivacy } from '@hooks/useTermsAndPrivacy';
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';
import { FeatureFlag } from '@components/common/FeatureFlag';
import CustomButton from '@components/common/CustomButton';

const SignupScreen = () => {
  const { isModalVisible, hasAccepted, showModal, hideModal, handleAccept } =
    useTermsAndPrivacy();

  const handleSignup = () => {
    // Check if accepted before proceeding
    if (!hasAccepted) {
      showModal();
      return;
    }

    // Proceed with signup
  };

  return (
    <>
      <CustomButton title="Sign Up" onPress={handleSignup} />

      <FeatureFlag flag="ENABLE_TERMS_AND_PRIVACY_POPUP">
        <TermsAndPrivacyModal
          visible={isModalVisible}
          onClose={hideModal}
          onAccept={handleAccept}
        />
      </FeatureFlag>
    </>
  );
};
```

## Demo Screen

A comprehensive demo screen is available at:

**Location:** `src/screens/TermsPrivacyDemoScreen.tsx`

This screen demonstrates:

- Modal integration
- Feature flag usage
- Acceptance state management
- Integration instructions
- Feature list

## Theme Support

The component automatically adapts to the app's theme (light/dark mode):

```tsx
const { theme } = useTheme();

// Colors automatically adjust based on theme
backgroundColor: theme.background.primary;
color: theme.text.primary;
borderColor: theme.border.primary;
```

## RTL Support

The component automatically detects and adapts to RTL languages (Arabic):

```tsx
const { i18n } = useTranslation();
const isRTL = i18n.language === 'ar';

// Layout automatically adjusts
flexDirection: isRTL ? 'row-reverse' : 'row';
```

## Customization

### Updating Legal Content

To update the privacy policy or terms content:

1. Navigate to localization files:

   - `src/localization/translations/en.json`
   - `src/localization/translations/fr.json`
   - `src/localization/translations/ar.json`

2. Update the content under `legal.privacyPolicy.sections` or `legal.termsOfService.sections`

3. Update the `lastUpdatedDate` field

### Adding New Sections

To add a new section to the privacy policy or terms:

1. Add the section to all three language files:

```json
{
  "legal": {
    "privacyPolicy": {
      "sections": {
        "newSection": {
          "title": "New Section Title",
          "content": "New section content..."
        }
      }
    }
  }
}
```

2. Add the rendering logic in `TermsAndPrivacyModal.tsx`:

```tsx
<CustomText style={[styles.sectionHeading, { color: theme.text.primary }]}>
  {t('legal.privacyPolicy.sections.newSection.title')}
</CustomText>
<CustomText style={[styles.paragraph, { color: theme.text.secondary }]}>
  {t('legal.privacyPolicy.sections.newSection.content')}
</CustomText>
```

### Styling

The component uses StyleSheet for styling. To customize:

Edit the styles in `TermsAndPrivacyModal.tsx`:

```tsx
const styles = StyleSheet.create({
  // Customize these styles
  header: { ... },
  contentSection: { ... },
  // ... more styles
});
```

## Testing

### Manual Testing Checklist

- [ ] Modal opens and closes correctly
- [ ] Checkbox can be toggled
- [ ] Continue button is disabled until checkbox is checked
- [ ] Close icon works in both light and dark themes
- [ ] Tabs switch between Privacy and Terms correctly
- [ ] Content scrolls smoothly
- [ ] RTL layout works correctly in Arabic
- [ ] All translations display correctly
- [ ] Feature flag enables/disables the feature
- [ ] Acceptance state persists after app restart
- [ ] Works on both iOS and Android

### Testing with Feature Flag

1. Go to Feature Flags screen (if available in dev mode)
2. Toggle `ENABLE_TERMS_AND_PRIVACY_POPUP`
3. Verify the modal is shown/hidden accordingly

### Testing RTL

1. Change app language to Arabic
2. Open the modal
3. Verify:
   - Close button is on the left
   - Text is right-aligned
   - Checkbox is on the right side
   - Scroll direction is correct

## Best Practices

1. **Always check acceptance state** before proceeding with signup/signin
2. **Use the custom hook** for easier state management
3. **Wrap with FeatureFlag** to respect the feature flag setting
4. **Persist acceptance state** using the provided hook methods
5. **Keep legal content updated** in all three languages
6. **Test thoroughly** in both themes and all languages
7. **Handle edge cases** (network errors, storage failures, etc.)

## Troubleshooting

### Modal not showing

- Check if feature flag is enabled
- Verify `visible` prop is set to `true`
- Check console for any errors

### Translations not working

- Ensure translation keys exist in all language files
- Check if i18next is properly initialized
- Verify the language is set correctly

### Checkbox not working

- Check if `requireAcceptance` prop is set correctly
- Verify state management is working
- Check for any conflicting styles

### Persistence not working

- Verify AsyncStorage permissions
- Check if hook is properly integrated
- Look for console errors related to storage

## Future Enhancements

Potential improvements for future versions:

- [ ] Version tracking for T&C updates
- [ ] Force re-acceptance on T&C version change
- [ ] Analytics tracking for acceptance rates
- [ ] PDF export of T&C for offline viewing
- [ ] Email copy of accepted terms to user
- [ ] Customizable styling via props
- [ ] Support for more languages
- [ ] A/B testing integration

## Support

For issues or questions:

1. Check this documentation
2. Review the demo screen implementation
3. Check console logs for errors
4. Review the component source code
5. Contact the development team

## License

This feature is part of the TodoApp project and follows the same license.

---

**Last Updated:** February 28, 2026
**Version:** 1.0.0
**Author:** Development Team
