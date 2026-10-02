# InfoPopup Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a reusable `InfoPopup` center-screen modal component with smooth scale+fade animation, usable anywhere via an `info` icon or any trigger, with a test button wired into `HomeScreen.phone.tsx`.

**Architecture:** A pure, self-contained `InfoPopup` component uses React Native's built-in `Modal` + `Animated` API (same pattern as `QuickRatePopup`) — no third-party deps needed. It accepts `title`, `message`, `visible`, and `onClose` props with an optional `actions` array for buttons. The home screen gets a small floating test button that opens a demo instance.

**Tech Stack:** React Native `Modal`, `Animated` (spring + timing), `useTheme`, `CustomText`, `Icon`, `TouchableOpacity`, `StyleSheet`

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `src/components/modals/InfoPopup.tsx` | Pure reusable center-modal component |
| Modify | `src/components/modals/index.ts` | Export `InfoPopup` and its types |
| Modify | `src/screens/HomeScreen/HomeScreen.phone.tsx` | Add test button + demo `InfoPopup` instance |

---

### Task 1: Create the `InfoPopup` component

**Files:**
- Create: `src/components/modals/InfoPopup.tsx`

- [ ] **Step 1: Create the file with full implementation**

```tsx
// src/components/modals/InfoPopup.tsx
import React, { useCallback, useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTheme } from '@theme/index';
import { CustomText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { BaseColors } from '@theme/colors';

export interface InfoPopupAction {
  label: string;
  onPress: () => void;
  /** Defaults to 'primary'. Use 'secondary' for outlined/cancel style. */
  style?: 'primary' | 'secondary';
}

export interface InfoPopupProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  message: string;
  /** Optional icon name from the Icon set. Defaults to 'info-circle'. */
  iconName?: string;
  /** Optional icon color. Defaults to BaseColors.merckPurple. */
  iconColor?: string;
  /** Optional action buttons. If empty, a single 'Got it' button is shown. */
  actions?: InfoPopupAction[];
}

export default function InfoPopup({
  visible,
  onClose,
  title,
  message,
  iconName = 'info-circle',
  iconColor = BaseColors.merckPurple,
  actions,
}: InfoPopupProps) {
  const { theme } = useTheme();

  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const cardScale = useRef(new Animated.Value(0.85)).current;
  const cardOpacity = useRef(new Animated.Value(0)).current;

  const animateIn = useCallback(() => {
    Animated.parallel([
      Animated.timing(backdropOpacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.spring(cardScale, {
        toValue: 1,
        tension: 140,
        friction: 9,
        useNativeDriver: true,
      }),
      Animated.timing(cardOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, [backdropOpacity, cardScale, cardOpacity]);

  const animateOut = useCallback(
    (cb?: () => void) => {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(cardScale, {
          toValue: 0.88,
          duration: 160,
          useNativeDriver: true,
        }),
        Animated.timing(cardOpacity, {
          toValue: 0,
          duration: 160,
          useNativeDriver: true,
        }),
      ]).start(() => cb?.());
    },
    [backdropOpacity, cardScale, cardOpacity],
  );

  useEffect(() => {
    if (visible) {
      // Reset before animating in
      backdropOpacity.setValue(0);
      cardScale.setValue(0.85);
      cardOpacity.setValue(0);
      animateIn();
    }
  }, [visible, animateIn, backdropOpacity, cardScale, cardOpacity]);

  const handleClose = useCallback(() => {
    animateOut(onClose);
  }, [animateOut, onClose]);

  const resolvedActions: InfoPopupAction[] = actions?.length
    ? actions
    : [{ label: 'Got it', onPress: handleClose, style: 'primary' }];

  const styles = getStyles(theme);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={handleClose} />
      </Animated.View>

      {/* Card */}
      <View style={styles.centeredContainer} pointerEvents="box-none">
        <Animated.View
          style={[
            styles.card,
            { opacity: cardOpacity, transform: [{ scale: cardScale }] },
          ]}
        >
          {/* Close X */}
          <TouchableOpacity
            style={styles.closeBtn}
            onPress={handleClose}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            activeOpacity={0.7}
          >
            <Icon name="close" size={18} color={theme.text.secondary} />
          </TouchableOpacity>

          {/* Icon badge */}
          <View style={[styles.iconBadge, { backgroundColor: `${iconColor}18` }]}>
            <Icon name={iconName} size={32} color={iconColor} />
          </View>

          {/* Title */}
          <CustomText
            variant="h3"
            style={[styles.title, { color: theme.text.primary }]}
          >
            {title}
          </CustomText>

          {/* Message */}
          <CustomText
            variant="bodyMedium"
            style={[styles.message, { color: theme.text.secondary }]}
          >
            {message}
          </CustomText>

          {/* Actions */}
          <View style={styles.actions}>
            {resolvedActions.map((action, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.actionBtn,
                  action.style === 'secondary'
                    ? [styles.actionBtnSecondary, { borderColor: theme.border.primary }]
                    : [styles.actionBtnPrimary, { backgroundColor: iconColor }],
                ]}
                onPress={() => {
                  if (action.style !== 'secondary') {
                    animateOut(() => {
                      onClose();
                      action.onPress();
                    });
                  } else {
                    action.onPress();
                  }
                }}
                activeOpacity={0.8}
              >
                <CustomText
                  variant="buttonMedium"
                  style={
                    action.style === 'secondary'
                      ? { color: theme.text.secondary }
                      : { color: '#FFFFFF' }
                  }
                >
                  {action.label}
                </CustomText>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
}

const getStyles = (theme: any) =>
  StyleSheet.create({
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.52)',
    },
    centeredContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    card: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.background.modal,
      borderRadius: 24,
      paddingHorizontal: 24,
      paddingTop: 28,
      paddingBottom: 24,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.18,
      shadowRadius: 24,
      elevation: 12,
    },
    closeBtn: {
      position: 'absolute',
      top: 14,
      right: 14,
      width: 30,
      height: 30,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconBadge: {
      width: 68,
      height: 68,
      borderRadius: 34,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
    },
    title: {
      textAlign: 'center',
      fontWeight: '700',
      marginBottom: 10,
    },
    message: {
      textAlign: 'center',
      lineHeight: 22,
      marginBottom: 26,
      paddingHorizontal: 4,
    },
    actions: {
      width: '100%',
      gap: 10,
    },
    actionBtn: {
      height: 50,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
    },
    actionBtnPrimary: {},
    actionBtnSecondary: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
    },
  });
```

- [ ] **Step 2: Verify the file was created**

```bash
ls src/components/modals/InfoPopup.tsx
```
Expected: file listed, no error.

---

### Task 2: Export `InfoPopup` from the modals index

**Files:**
- Modify: `src/components/modals/index.ts`

- [ ] **Step 1: Add the export lines**

Open `src/components/modals/index.ts`. The current content is:
```ts
export { default as AppModal } from './AppModal';
export type { ModalConfig, ModalVariant } from './AppModal';

export { default as LanguageSelectorModal } from './LanguageSelectorModal';
export type { Language } from './LanguageSelectorModal';
```

Add after the last line:
```ts
export { default as InfoPopup } from './InfoPopup';
export type { InfoPopupProps, InfoPopupAction } from './InfoPopup';
```

- [ ] **Step 2: Verify no TypeScript errors**

```bash
cd react-native-mobileapp && npx tsc --noEmit 2>&1 | grep InfoPopup
```
Expected: no output (no errors).

- [ ] **Step 3: Commit**

```bash
git add src/components/modals/InfoPopup.tsx src/components/modals/index.ts
git commit -m "feat: add reusable InfoPopup center modal with spring animation"
```

---

### Task 3: Add test button and demo instance to `HomeScreen.phone.tsx`

**Files:**
- Modify: `src/screens/HomeScreen/HomeScreen.phone.tsx`

- [ ] **Step 1: Add import for InfoPopup and TouchableOpacity**

In `HomeScreen.phone.tsx`, the import block currently includes:
```ts
import { View, StyleSheet, StatusBar, Platform, Alert } from 'react-native';
```

Replace it with:
```ts
import { View, StyleSheet, StatusBar, Platform, Alert, TouchableOpacity } from 'react-native';
```

Then add the InfoPopup import after the existing component imports (e.g., after `RecentArticlesStrip`):
```ts
import { InfoPopup } from '@components/modals';
```

- [ ] **Step 2: Add modal state to the component**

Inside `HomeScreenPhone`, after the existing state declarations (`overlayOpen`, `recentArticles`), add:
```ts
const [infoPopupVisible, setInfoPopupVisible] = useState(false);
```

- [ ] **Step 3: Add the test button and InfoPopup inside the JSX**

Inside the `<Animated.ScrollView>`, after the `HomeSearchBar` block and before `{recentArticles.length > 0 && ...}`, add:

```tsx
{/* Info Popup test button */}
<View style={styles.testButtonRow}>
  <TouchableOpacity
    style={[styles.testButton, { backgroundColor: theme.background.card ?? theme.background.secondary }]}
    onPress={() => setInfoPopupVisible(true)}
    activeOpacity={0.8}
  >
    <Icon name="info-circle" size={18} color={BaseColors.merckPurple} />
    <CustomText
      variant="bodyMedium"
      style={{ color: BaseColors.merckPurple, fontWeight: '600' }}
    >
      Show Info Popup
    </CustomText>
  </TouchableOpacity>
</View>
```

After the closing `</Animated.ScrollView>` and before `<HomeSearchOverlay .../>`, add:

```tsx
<InfoPopup
  visible={infoPopupVisible}
  onClose={() => setInfoPopupVisible(false)}
  title="What is this?"
  message="This is a reusable info popup. Tap the info icon anywhere in the app to reveal contextual help like this."
/>
```

- [ ] **Step 4: Add missing imports to HomeScreen.phone.tsx**

Near the top of the file, after the existing imports, add:
```ts
import { BaseColors } from '@theme/colors';
import { CustomText } from '@components/common/CustomText';
```

(Check if `CustomText` is already imported — if it is, skip that line.)

- [ ] **Step 5: Add styles for the test button row**

In the `getStyles` function at the bottom, add inside the `StyleSheet.create({...})` object:

```ts
testButtonRow: {
  marginTop: 20,
  paddingHorizontal: 16,
  alignItems: 'center',
},
testButton: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 8,
  paddingVertical: 12,
  paddingHorizontal: 20,
  borderRadius: 14,
  shadowColor: '#000',
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.07,
  shadowRadius: 6,
  elevation: 3,
},
```

- [ ] **Step 6: Verify no TypeScript errors**

```bash
cd react-native-mobileapp && npx tsc --noEmit 2>&1 | grep -E "HomeScreen|InfoPopup"
```
Expected: no output.

- [ ] **Step 7: Commit**

```bash
git add src/screens/HomeScreen/HomeScreen.phone.tsx
git commit -m "feat: add InfoPopup test button to HomeScreen"
```

---

## Quick Smoke Test (manual)

1. Run the app: `npx react-native start` + press `i` for iOS / `a` for Android
2. Navigate to the **Home** tab
3. You should see a card below the search bar labeled **"Show Info Popup"** with a purple info icon
4. Tap it — the backdrop fades in, the card springs up from slightly smaller scale to full size
5. Tap **"Got it"** — the card shrinks back and fades out, backdrop disappears
6. Tap the backdrop — same dismissal animation plays
7. Tap the **×** button — same dismissal
8. Dark mode: toggle dark mode in Settings — card background, text, and close icon should adapt correctly
