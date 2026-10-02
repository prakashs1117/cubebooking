# Legal Components

Reusable, clean, and maintainable components for displaying legal documents (Privacy Policy and Terms of Service).

## Architecture

The legal components follow a **composition-based architecture** with clear separation of concerns:

```
┌─────────────────────────────────────────┐
│  TermsAndPrivacyModal (Static)          │
│  TermsAndPrivacyModalDynamic (Dynamic)  │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  LegalModalHeader              │   │
│  │  - Title                       │   │
│  │  - Close button                │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  LegalModalTabs                │   │
│  │  - Privacy / Terms tabs        │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  LegalDocumentView             │   │
│  │  ┌──────────────────────────┐ │   │
│  │  │ LegalContentSection       │ │   │
│  │  │ - Title, Content, Icon    │ │   │
│  │  └──────────────────────────┘ │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  LegalModalFooter              │   │
│  │  - Acceptance checkbox         │   │
│  │  - Continue button             │   │
│  └────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Components

### LegalModalHeader

Header component with centered title and close button.

**Props:**

- `title: string` - Modal title
- `onClose: () => void` - Close handler
- `isRTL: boolean` - Right-to-left layout

**Example:**

```tsx
<LegalModalHeader
  title={t('legal.headerTitle')}
  onClose={handleClose}
  isRTL={false}
/>
```

---

### LegalModalTabs

Tab navigation for switching between Privacy and Terms.

**Props:**

- `activeTab: LegalTab` - Currently active tab ('privacy' | 'terms')
- `onTabChange: (tab: LegalTab) => void` - Tab change handler
- `tabs: TabConfig[]` - Tab configuration array
- `isRTL: boolean` - Right-to-left layout

**Example:**

```tsx
const tabs = [
  { key: 'privacy', label: 'Privacy Policy', icon: 'shield-check' },
  { key: 'terms', label: 'Terms of Service', icon: 'file-text' },
];

<LegalModalTabs
  activeTab={activeTab}
  onTabChange={setActiveTab}
  tabs={tabs}
  isRTL={false}
/>;
```

---

### LegalModalFooter

Footer with acceptance checkbox and continue button.

**Props:**

- `isAccepted: boolean` - Acceptance state
- `onToggleAcceptance: () => void` - Toggle handler
- `onContinue: () => void` - Continue handler
- `requireAcceptance: boolean` - Whether acceptance is required
- `acceptanceText: string` - Checkbox label text
- `continueButtonText: string` - Button text
- `isRTL: boolean` - Right-to-left layout

**Example:**

```tsx
<LegalModalFooter
  isAccepted={isAccepted}
  onToggleAcceptance={toggleAcceptance}
  onContinue={handleContinue}
  requireAcceptance={true}
  acceptanceText="I accept the terms and privacy policy"
  continueButtonText="Continue"
  isRTL={false}
/>
```

---

### LegalContentSection

Renders a single section of a legal document.

**Props:**

- `section: LegalSection` - Section data (id, title, content, icon, order)
- `showIcon?: boolean` - Whether to show the section icon

**Example:**

```tsx
const section = {
  id: 'introduction',
  order: 1,
  title: 'Introduction',
  content: 'This is the introduction...',
  icon: 'shield-check',
};

<LegalContentSection section={section} showIcon={true} />;
```

---

### LegalDocumentView

Complete view for displaying a legal document with header and sections.

**Props:**

- `title: string` - Document title
- `lastUpdatedLabel: string` - "Last Updated" label
- `lastUpdatedDate: string` - Last updated date
- `sections: LegalSection[]` - Array of sections
- `headerIcon: IconName` - Icon to display in header
- `showSectionIcons?: boolean` - Whether to show icons for each section

**Example:**

```tsx
<LegalDocumentView
  title="Privacy Policy"
  lastUpdatedLabel="Last Updated"
  lastUpdatedDate="February 28, 2026"
  sections={privacySections}
  headerIcon="shield-check"
  showSectionIcons={false}
/>
```

---

## Hooks

### useLegalModalAnimation

Manages modal entrance/exit animations.

**Parameters:**

- `visible: boolean` - Modal visibility

**Returns:**

- `fadeAnim: Animated.Value` - Fade animation value
- `slideAnim: Animated.Value` - Slide animation value

**Example:**

```tsx
const { fadeAnim, slideAnim } = useLegalModalAnimation(visible);

<Animated.View
  style={{
    opacity: fadeAnim,
    transform: [{ translateY: slideAnim }],
  }}
>
  {/* Content */}
</Animated.View>;
```

---

### useLegalModalState

Manages modal state (acceptance and active tab).

**Parameters:**

- `visible: boolean` - Modal visibility (resets state when shown)
- `initialTab?: LegalTab` - Initial tab to show (default: 'privacy')

**Returns:**

- `isAccepted: boolean` - Acceptance state
- `activeTab: LegalTab` - Active tab
- `setActiveTab: (tab: LegalTab) => void` - Set active tab
- `toggleAcceptance: () => void` - Toggle acceptance
- `resetState: () => void` - Reset to initial state

**Example:**

```tsx
const { isAccepted, activeTab, setActiveTab, toggleAcceptance } =
  useLegalModalState(visible, 'privacy');
```

---

## Main Modal Components

### TermsAndPrivacyModal (Static)

Uses static content from localization strings (i18next).

**Props:**

- `visible: boolean` - Controls modal visibility
- `onClose: () => void` - Callback when modal is closed
- `onAccept: () => void` - Callback when user accepts
- `requireAcceptance?: boolean` - If true, user must check the box (default: true)

**Example:**

```tsx
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';

<TermsAndPrivacyModal
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onAccept={handleAccept}
  requireAcceptance={true}
/>;
```

---

### TermsAndPrivacyModalDynamic (Dynamic)

Loads content dynamically from JSON files or API using `useLegalContent` hook.

**Props:** Same as TermsAndPrivacyModal

**Features:**

- Loading states with spinner
- Error handling with retry
- Automatic language switching
- Caching support
- API-ready architecture

**Example:**

```tsx
import TermsAndPrivacyModalDynamic from '@components/common/TermsAndPrivacyModalDynamic';

<TermsAndPrivacyModalDynamic
  visible={modalVisible}
  onClose={() => setModalVisible(false)}
  onAccept={handleAccept}
  requireAcceptance={true}
/>;
```

---

## Data Structure

### LegalSection

```typescript
interface LegalSection {
  id: string; // Unique identifier
  order: number; // Display order
  title: string; // Section title
  content: string; // Section content
  icon?: string; // Optional icon name
}
```

### LegalLanguageContent

```typescript
interface LegalLanguageContent {
  title: string; // Document title
  lastUpdatedLabel: string; // "Last Updated" label
  lastUpdatedDate: string; // Date string
  sections: LegalSection[]; // Array of sections
}
```

---

## Usage Examples

### Basic Implementation

```tsx
import React, { useState } from 'react';
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';

const SignUpScreen = () => {
  const [showModal, setShowModal] = useState(false);

  const handleAccept = () => {
    console.log('User accepted terms');
    setShowModal(false);
    // Proceed with signup...
  };

  return (
    <>
      <Button onPress={() => setShowModal(true)}>Show Terms & Privacy</Button>

      <TermsAndPrivacyModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onAccept={handleAccept}
      />
    </>
  );
};
```

### With Feature Flag

```tsx
import { FeatureFlag } from '@components/common/FeatureFlag';
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';

<FeatureFlag flag="ENABLE_TERMS_AND_PRIVACY_POPUP">
  <TermsAndPrivacyModal
    visible={showModal}
    onClose={handleClose}
    onAccept={handleAccept}
  />
</FeatureFlag>;
```

### Dynamic Content with Error Handling

```tsx
import TermsAndPrivacyModalDynamic from '@components/common/TermsAndPrivacyModalDynamic';

// Content automatically loaded from:
// - src/data/legal/privacyPolicy.json
// - src/data/legal/termsOfService.json
// Or from API if configured

<TermsAndPrivacyModalDynamic
  visible={showModal}
  onClose={handleClose}
  onAccept={handleAccept}
  requireAcceptance={true}
/>;
```

---

## Benefits of This Architecture

### ✅ Reusability

Each component can be used independently in different contexts.

### ✅ Maintainability

Clear separation of concerns makes updates easier.

### ✅ Testability

Small, focused components are easier to unit test.

### ✅ Flexibility

Components can be easily composed in new ways.

### ✅ DRY (Don't Repeat Yourself)

Shared logic extracted into hooks and components.

### ✅ Type Safety

Full TypeScript support with proper interfaces.

### ✅ Accessibility

Built-in accessibility props for better UX.

### ✅ Performance

Optimized with React.memo where appropriate.

---

## Customization

### Custom Styling

Components use theme context but can accept custom styles:

```tsx
import { LegalModalHeader } from '@components/legal';

<LegalModalHeader
  title="Custom Title"
  onClose={handleClose}
  isRTL={false}
  // Override styles by wrapping in a View with custom styles
/>;
```

### Custom Sections

Create custom sections with additional fields:

```tsx
const customSection: LegalSection = {
  id: 'custom',
  order: 8,
  title: 'Custom Section',
  content: 'Custom content here...',
  icon: 'star',
};

const allSections = [...privacySections, customSection];
```

---

## Migration Guide

### From Old Implementation

**Before:**

```tsx
// Monolithic component with 500+ lines
<TermsAndPrivacyModal ... />
```

**After:**

```tsx
// Clean composition with reusable parts
<TermsAndPrivacyModal ... />
// Or dynamic version
<TermsAndPrivacyModalDynamic ... />
```

The API remains the same, so no changes needed in consuming code!

---

## File Structure

```
src/
├── components/
│   ├── legal/
│   │   ├── LegalModalHeader.tsx
│   │   ├── LegalModalTabs.tsx
│   │   ├── LegalModalFooter.tsx
│   │   ├── LegalContentSection.tsx
│   │   ├── LegalDocumentView.tsx
│   │   ├── index.ts
│   │   └── README.md (this file)
│   └── common/
│       ├── TermsAndPrivacyModal.tsx
│       └── TermsAndPrivacyModalDynamic.tsx
├── hooks/
│   ├── useLegalModalAnimation.ts
│   ├── useLegalModalState.ts
│   └── useLegalContent.ts
└── types/
    └── legal.types.ts
```

---

## Support

For issues or questions:

- Check the demo screen: `TermsPrivacyDemoScreen.tsx`
- Review type definitions: `src/types/legal.types.ts`
- Examine hook implementations in `src/hooks/`
