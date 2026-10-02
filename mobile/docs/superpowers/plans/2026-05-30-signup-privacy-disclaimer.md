# Signup: Privacy Policy & Disclaimer Acceptance Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add mandatory Privacy Policy and Disclaimer acceptance during signup via scroll-to-unlock modal, blocking form submission until the user has read and accepted the legal documents.

**Architecture:** Wire the existing `TermsAndPrivacyModal` component into the signup flow by adding scroll-detection logic to unlock acceptance, add an agreement row to `SignUpScreen` with tappable links, and extend form validation to require acceptance before submission.

**Tech Stack:** React Native, TypeScript, i18next (localization), React Navigation, TanStack React Query

---

## File Structure

| File | Responsibility |
|---|---|
| `src/components/common/TermsAndPrivacyModal.tsx` | Scroll detection state + logic; reset on tab change |
| `src/components/legal/LegalModalFooter.tsx` | Accept `canAccept` prop; disable checkbox UI when false; show scroll hint |
| `src/screens/SignUpScreen.tsx` (phone) | Agreement row state + UI; modal wiring; form validation extended |
| `src/screens/SignUpScreen.tablet.tsx` | Mirror phone agreement row + modal wiring |
| `src/assets/i18n/en.json` | Add 5 auth translation keys |
| `src/assets/i18n/fr.json` | Add 5 auth translation keys (French) |
| `src/assets/i18n/ar.json` | Add 5 auth translation keys (Arabic) |

---

## Task 1: Add scroll detection to `TermsAndPrivacyModal`

**Files:**
- Modify: `src/components/common/TermsAndPrivacyModal.tsx`

- [ ] **Step 1: Add `hasScrolledToBottom` state and tab-change reset**

Inside the component (after the animation hook), add:

```ts
const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);

// Reset scroll position when active tab changes
useEffect(() => {
  setHasScrolledToBottom(false);
}, [activeTab]);
```

- [ ] **Step 2: Add scroll detection handler**

Before the `handleAccept` function, add:

```ts
const handleScroll = (e: any) => {
  const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
  if (
    contentOffset.y + layoutMeasurement.height >=
    contentSize.height - 20
  ) {
    setHasScrolledToBottom(true);
  }
};
```

- [ ] **Step 3: Update ScrollView with scroll handlers**

Find the `<ScrollView>` in the JSX (line 219–242). Update it to:

```tsx
<ScrollView
  style={styles.scrollView}
  contentContainerStyle={styles.scrollContent}
  showsVerticalScrollIndicator={true}
  bounces={true}
  onScroll={handleScroll}
  scrollEventThrottle={16}
>
```

- [ ] **Step 4: Pass `canAccept` prop to `LegalModalFooter`**

Find the `<LegalModalFooter>` component (line 245–253). Update it to:

```tsx
<LegalModalFooter
  isAccepted={isAccepted}
  onToggleAcceptance={toggleAcceptance}
  onContinue={handleAccept}
  requireAcceptance={requireAcceptance}
  acceptanceText={t('legal.acceptanceText')}
  continueButtonText={t('legal.continueButton')}
  isRTL={isRTL}
  canAccept={hasScrolledToBottom}
/>
```

- [ ] **Step 5: Test scroll detection locally**

Run: `npm start` (start the dev server)

Navigate to SignUp screen, open the modal manually (if there's a test link), and verify:
- Checkbox is greyed out initially
- Scroll to the very bottom → checkbox becomes active
- Switch tabs → checkbox goes back to greyed out

- [ ] **Step 6: Commit**

```bash
git add src/components/common/TermsAndPrivacyModal.tsx
git commit -m "feat: add scroll-to-bottom detection in TermsAndPrivacyModal"
```

---

## Task 2: Update `LegalModalFooter` to support `canAccept` prop

**Files:**
- Modify: `src/components/legal/LegalModalFooter.tsx`

- [ ] **Step 1: Read the current file to understand its structure**

Run: `cat src/components/legal/LegalModalFooter.tsx | head -80`

(You need to see the current checkbox and button implementation to adjust it properly.)

- [ ] **Step 2: Add `canAccept` prop to the interface**

At the top of the file, find the interface definition. Add the new prop:

```ts
interface LegalModalFooterProps {
  isAccepted: boolean;
  onToggleAcceptance: () => void;
  onContinue: () => void;
  requireAcceptance?: boolean;
  acceptanceText: string;
  continueButtonText: string;
  isRTL: boolean;
  canAccept: boolean; // NEW
}
```

- [ ] **Step 3: Update checkbox disable logic**

Find where the checkbox (or acceptance toggle) is rendered. Wrap it with:

```tsx
<TouchableOpacity
  onPress={() => {
    if (canAccept) {
      onToggleAcceptance();
    }
  }}
  disabled={!canAccept}
  style={[
    styles.checkboxContainer,
    !canAccept && styles.checkboxDisabled,
  ]}
  activeOpacity={canAccept ? 0.7 : 1}
>
  {/* Existing checkbox icon/content */}
</TouchableOpacity>
```

- [ ] **Step 4: Add visual feedback when checkbox is disabled**

In the `StyleSheet.create` block, add or update:

```ts
checkboxDisabled: {
  opacity: 0.4,
  pointerEvents: 'none',
},
```

- [ ] **Step 5: Add scroll hint text below checkbox**

After the checkbox container, add:

```tsx
{!canAccept && (
  <Text style={styles.scrollHint}>
    {t('legal.scrollToAccept', {
      defaultValue: 'Scroll to the bottom to accept',
    })}
  </Text>
)}
```

And add style:

```ts
scrollHint: {
  fontSize: 12,
  color: theme.text.secondary,
  marginTop: 8,
  fontStyle: 'italic',
},
```

- [ ] **Step 6: Test the footer locally**

Run: `npm start` and manually navigate to the modal to verify the checkbox is greyed out and the hint appears. (Requires manual testing or a test component.)

- [ ] **Step 7: Commit**

```bash
git add src/components/legal/LegalModalFooter.tsx
git commit -m "feat: add canAccept prop to disable checkbox until scroll-to-bottom"
```

---

## Task 3: Add translation keys for agreement acceptance

**Files:**
- Modify: `src/assets/i18n/en.json`
- Modify: `src/assets/i18n/fr.json`
- Modify: `src/assets/i18n/ar.json`

- [ ] **Step 1: Add English keys**

Open `src/assets/i18n/en.json` and locate the `auth` section. Add these keys:

```json
"auth": {
  ...existing keys...
  "iAgreeTo": "I agree to the ",
  "privacyPolicy": "Privacy Policy",
  "and": " and ",
  "disclaimer": "Disclaimer",
  "agreementRequired": "You must accept the Privacy Policy to continue"
}
```

- [ ] **Step 2: Add French keys**

Open `src/assets/i18n/fr.json` and locate the `auth` section. Add:

```json
"auth": {
  ...existing keys...
  "iAgreeTo": "Je suis d'accord avec ",
  "privacyPolicy": "Politique de Confidentialité",
  "and": " et ",
  "disclaimer": "Avertissement",
  "agreementRequired": "Vous devez accepter la Politique de Confidentialité pour continuer"
}
```

- [ ] **Step 3: Add Arabic keys**

Open `src/assets/i18n/ar.json` and locate the `auth` section. Add:

```json
"auth": {
  ...existing keys...
  "iAgreeTo": "أوافق على ",
  "privacyPolicy": "سياسة الخصوصية",
  "and": " و ",
  "disclaimer": "إخلاء المسؤولية",
  "agreementRequired": "يجب عليك قبول سياسة الخصوصية للمتابعة"
}
```

Also add to the `legal` section in `ar.json` (if it doesn't exist already):

```json
"legal": {
  ...existing keys...
  "scrollToAccept": "قم بالتمرير إلى الأسفل للقبول"
}
```

- [ ] **Step 4: Verify keys are valid JSON**

Run: `npm run lint` (or similar linting command for i18n JSON files)

Expected: No JSON syntax errors.

- [ ] **Step 5: Commit**

```bash
git add src/assets/i18n/en.json src/assets/i18n/fr.json src/assets/i18n/ar.json
git commit -m "i18n: add privacy policy acceptance keys (en, fr, ar)"
```

---

## Task 4: Add agreement row and modal state to `SignUpScreenPhone`

**Files:**
- Modify: `src/screens/SignUpScreen.tsx` (phone component)

- [ ] **Step 1: Add new state variables**

After the existing state declarations (around line 67), add:

```ts
const [agreementAccepted, setAgreementAccepted] = useState(false);
const [showLegalModal, setShowLegalModal] = useState(false);
const [agreementError, setAgreementError] = useState('');
```

- [ ] **Step 2: Update `isFormValid` guard**

Find the `isFormValid` variable (line 92–97). Replace it with:

```ts
const isFormValid =
  name.trim().length > 0 &&
  email.trim().length > 0 &&
  password.trim().length > 0 &&
  confirmPassword.trim().length > 0 &&
  captchaAnswer.trim().length > 0 &&
  agreementAccepted;
```

- [ ] **Step 3: Add agreement check to `handleSignUp`**

At the very top of the `handleSignUp` function (after the opening brace, line 99), add:

```ts
if (!agreementAccepted) {
  setAgreementError(
    t('auth.agreementRequired', {
      defaultValue: 'You must accept the Privacy Policy to continue',
    }),
  );
  return;
}
```

Then add these lines before the existing error clearing:

```ts
setAgreementError('');
```

So the start of `handleSignUp` becomes:

```ts
const handleSignUp = async () => {
  if (!agreementAccepted) {
    setAgreementError(
      t('auth.agreementRequired', {
        defaultValue: 'You must accept the Privacy Policy to continue',
      }),
    );
    return;
  }

  setNameError('');
  setEmailError('');
  setPasswordError('');
  setConfirmPasswordError('');
  setCaptchaError('');
  setAgreementError('');
  
  // ... rest of the function
};
```

- [ ] **Step 4: Add agreement row UI before the Sign Up button**

Find the Sign Up button (line 393–409). **Before** it, insert:

```tsx
{/* Agreement Row */}
<View style={styles.agreementRow}>
  <TouchableOpacity
    onPress={() => setAgreementAccepted(!agreementAccepted)}
    style={styles.agreementCheckbox}
    activeOpacity={0.7}
  >
    <Icon
      name={agreementAccepted ? 'check-square' : 'square'}
      size={20}
      color={
        agreementAccepted
          ? BaseColors.merckPurple
          : theme.border.primary
      }
    />
  </TouchableOpacity>
  <View style={styles.agreementTextContainer}>
    <Text style={styles.agreementText}>
      {t('auth.iAgreeTo', { defaultValue: 'I agree to the ' })}
      <Text
        style={styles.agreementLink}
        onPress={() => setShowLegalModal(true)}
      >
        {t('auth.privacyPolicy', {
          defaultValue: 'Privacy Policy',
        })}
      </Text>
      {t('auth.and', { defaultValue: ' and ' })}
      <Text
        style={styles.agreementLink}
        onPress={() => setShowLegalModal(true)}
      >
        {t('auth.disclaimer', {
          defaultValue: 'Disclaimer',
        })}
      </Text>
    </Text>
  </View>
</View>
{agreementError ? (
  <Text style={styles.errorText}>{agreementError}</Text>
) : null}
```

- [ ] **Step 5: Add styles for agreement row**

In the `getStyles` function, add to the `StyleSheet.create` block (around line 569):

```ts
agreementRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginTop: 16,
  marginBottom: agreementError ? 4 : 12,
  gap: 10,
},
agreementCheckbox: {
  width: 24,
  height: 24,
  marginTop: 2,
  justifyContent: 'center',
  alignItems: 'center',
},
agreementTextContainer: {
  flex: 1,
},
agreementText: {
  fontFamily: getFontStyle('body').fontFamily,
  fontSize: 13,
  color: theme.text.primary,
  lineHeight: 18,
},
agreementLink: {
  fontWeight: '700',
  color: isDark ? '#FFFFFF' : BaseColors.merckPurple,
  textDecorationLine: 'underline',
},
```

- [ ] **Step 6: Add `TermsAndPrivacyModal` to the JSX**

Before the closing `</SafeAreaView>` tag (after the `AppModal` and before the closing of `OTPBottomSheet`), add:

```tsx
<TermsAndPrivacyModal
  visible={showLegalModal}
  onClose={() => setShowLegalModal(false)}
  onAccept={() => {
    setAgreementAccepted(true);
    setAgreementError('');
    setShowLegalModal(false);
  }}
  requireAcceptance={true}
/>
```

- [ ] **Step 7: Import `TermsAndPrivacyModal` if not already imported**

At the top of the file, check if `TermsAndPrivacyModal` is imported. If not, add:

```ts
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';
```

(Verify it's not already there with a search: `grep -n "TermsAndPrivacyModal" src/screens/SignUpScreen.tsx`)

- [ ] **Step 8: Test the phone screen**

Run: `npm start`

Navigate to the SignUp screen:
- Fill in all form fields
- Verify "Create Account" button is disabled
- Tap the checkbox or "Privacy Policy" link
- Modal should open
- Verify checkbox in modal is greyed out
- Scroll to the bottom
- Checkbox should become active
- Tap it, then tap Continue
- Modal closes, inline checkbox becomes checked
- "Create Account" button should now be active

- [ ] **Step 9: Commit**

```bash
git add src/screens/SignUpScreen.tsx
git commit -m "feat: add agreement acceptance row to SignUpScreen (phone)"
```

---

## Task 5: Add agreement row and modal state to `SignUpScreenTablet`

**Files:**
- Modify: `src/screens/SignUpScreen.tablet.tsx`

- [ ] **Step 1: Add new state variables**

Add the same three state variables as in the phone component:

```ts
const [agreementAccepted, setAgreementAccepted] = useState(false);
const [showLegalModal, setShowLegalModal] = useState(false);
const [agreementError, setAgreementError] = useState('');
```

- [ ] **Step 2: Update `isFormValid` guard**

Replace the existing `isFormValid` with:

```ts
const isFormValid =
  name.trim().length > 0 &&
  email.trim().length > 0 &&
  password.trim().length > 0 &&
  confirmPassword.trim().length > 0 &&
  captchaAnswer.trim().length > 0 &&
  agreementAccepted;
```

- [ ] **Step 3: Add agreement check to `handleSignUp`**

At the very top of `handleSignUp`, add the same check:

```ts
if (!agreementAccepted) {
  setAgreementError(
    t('auth.agreementRequired', {
      defaultValue: 'You must accept the Privacy Policy to continue',
    }),
  );
  return;
}
setAgreementError('');
```

- [ ] **Step 4: Find the Sign Up button and add agreement row before it**

Locate the Sign Up button in the tablet component. Add the same agreement row UI **before** it:

```tsx
{/* Agreement Row */}
<View style={styles.agreementRow}>
  <TouchableOpacity
    onPress={() => setAgreementAccepted(!agreementAccepted)}
    style={styles.agreementCheckbox}
    activeOpacity={0.7}
  >
    <Icon
      name={agreementAccepted ? 'check-square' : 'square'}
      size={20}
      color={
        agreementAccepted
          ? BaseColors.merckPurple
          : theme.border.primary
      }
    />
  </TouchableOpacity>
  <View style={styles.agreementTextContainer}>
    <Text style={styles.agreementText}>
      {t('auth.iAgreeTo', { defaultValue: 'I agree to the ' })}
      <Text
        style={styles.agreementLink}
        onPress={() => setShowLegalModal(true)}
      >
        {t('auth.privacyPolicy', {
          defaultValue: 'Privacy Policy',
        })}
      </Text>
      {t('auth.and', { defaultValue: ' and ' })}
      <Text
        style={styles.agreementLink}
        onPress={() => setShowLegalModal(true)}
      >
        {t('auth.disclaimer', {
          defaultValue: 'Disclaimer',
        })}
      </Text>
    </Text>
  </View>
</View>
{agreementError ? (
  <Text style={styles.errorText}>{agreementError}</Text>
) : null}
```

- [ ] **Step 5: Add the same styles**

In the tablet component's `StyleSheet.create` block, add:

```ts
agreementRow: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  marginTop: 16,
  marginBottom: agreementError ? 4 : 12,
  gap: 10,
},
agreementCheckbox: {
  width: 24,
  height: 24,
  marginTop: 2,
  justifyContent: 'center',
  alignItems: 'center',
},
agreementTextContainer: {
  flex: 1,
},
agreementText: {
  fontFamily: getFontStyle('body').fontFamily,
  fontSize: 13,
  color: theme.text.primary,
  lineHeight: 18,
},
agreementLink: {
  fontWeight: '700',
  color: isDark ? '#FFFFFF' : BaseColors.merckPurple,
  textDecorationLine: 'underline',
},
```

- [ ] **Step 6: Add `TermsAndPrivacyModal` to the tablet JSX**

Before the closing tag (after any modals), add:

```tsx
<TermsAndPrivacyModal
  visible={showLegalModal}
  onClose={() => setShowLegalModal(false)}
  onAccept={() => {
    setAgreementAccepted(true);
    setAgreementError('');
    setShowLegalModal(false);
  }}
  requireAcceptance={true}
/>
```

- [ ] **Step 7: Import `TermsAndPrivacyModal` if not already imported**

Add to imports:

```ts
import TermsAndPrivacyModal from '@components/common/TermsAndPrivacyModal';
```

- [ ] **Step 8: Test the tablet screen**

Run: `npm start` and test with a tablet-sized viewport (or use DevTools):

- Fill form, verify "Create Account" disabled
- Tap checkbox or links, modal opens
- Scroll and accept
- Modal closes, checkbox checks, button activates

- [ ] **Step 9: Commit**

```bash
git add src/screens/SignUpScreen.tablet.tsx
git commit -m "feat: add agreement acceptance row to SignUpScreen (tablet)"
```

---

## Task 6: Verify all changes and run full test suite

**Files:**
- Read: All modified files
- Run: Lint, type check, tests

- [ ] **Step 1: Run linting**

Run: `npm run lint`

Expected: No errors. (Warnings are OK, but aim for clean output.)

- [ ] **Step 2: Run type check**

Run: `npm run type-check` (or `tsc --noEmit` if no script exists)

Expected: No TypeScript errors.

- [ ] **Step 3: Run unit tests**

Run: `npm test -- --testPathPattern="(SignUp|Legal)" --passWithNoTests`

Expected: All tests pass. (If there are no tests, the `--passWithNoTests` flag will skip with a clean exit.)

- [ ] **Step 4: Manual E2E verification on phone screen**

Run: `npm start`

Follow the user flow from the spec:

1. Navigate to SignUp
2. Verify "Create Account" button is disabled with empty form
3. Fill all fields (name, email, password, confirm, captcha)
4. Verify "Create Account" is still disabled (no agreement)
5. Tap "Privacy Policy" link → modal opens
6. Verify modal checkbox is greyed out + hint text visible
7. Scroll halfway → checkbox still greyed
8. Scroll to bottom → checkbox becomes active
9. Tap checkbox → checkbox checks, "Continue" activates
10. Tap "Continue" → modal closes, inline checkbox is checked
11. "Create Account" button is now active
12. Tap it → registration flow proceeds (or shows OTP screen as normal)

- [ ] **Step 5: Manual E2E verification on tablet screen**

Resize viewport to tablet size (or use iPad simulator):

Same flow as above. Verify agreement row layout adapts to tablet width.

- [ ] **Step 6: Verify dark mode**

Toggle dark mode in the app settings:

- Agreement row text and checkbox colors update
- Modal opens, scroll behavior unchanged
- Checkbox color transitions from border gray to Merck purple on accept

- [ ] **Step 7: Test RTL (Arabic)**

Change language to Arabic in app settings:

- Agreement row wraps correctly (RTL layout)
- Checkbox positions correctly on the right
- Links are underlined and have correct colors
- Modal tab structure is RTL-aware (should already be from the existing modal)

- [ ] **Step 8: Commit verification (if no issues found)**

If all tests pass and manual testing is clean:

```bash
git add .
git commit -m "test: verify privacy policy acceptance feature end-to-end"
```

---

## Task 7: Final smoke test and documentation

**Files:**
- Read: Implementation plan checklist
- Document: Known limitations or edge cases

- [ ] **Step 1: Cross-check spec vs. implementation**

Re-read the spec requirements and verify each is met:

- [ ] Scroll detection disables checkbox initially? **YES** (Task 1, 2)
- [ ] Checkbox unlocks after scroll to bottom? **YES** (Task 1, 2)
- [ ] Tab change resets scroll state? **YES** (Task 1, useEffect on activeTab)
- [ ] Agreement row on SignUp (phone + tablet)? **YES** (Task 4, 5)
- [ ] "Create Account" disabled until accepted? **YES** (Task 4, 5, isFormValid guard)
- [ ] Modal wired to open on link tap? **YES** (Task 4, 5, onPress)
- [ ] Modal closes on "Continue" after accept? **YES** (Task 4, 5, onAccept callback)
- [ ] Translation keys in all 3 locales? **YES** (Task 3)
- [ ] All validation guards in place? **YES** (Task 4, 5, handleSignUp guard)

- [ ] **Step 2: Edge case testing**

Run the following edge cases:

1. **Uncheck and recheck**: In the modal, check the checkbox, then uncheck it. Verify "Continue" button disables.
2. **Multiple tab switches**: Open modal, scroll Privacy tab, switch to Terms, verify Terms is un-scrolled, scroll to bottom, accept.
3. **Close modal without accepting**: Open modal, scroll, but don't check — close with the X button. Verify inline checkbox is still unchecked.
4. **Keyboard open/close**: On phone, open modal and toggle keyboard. Verify scroll detection still works.
5. **Very short policy content**: (Unlikely scenario — if content is < viewport height, scroll-to-bottom should trigger immediately.) Test if this edge case is handled.

- [ ] **Step 3: Document known limitations (if any)**

If you encounter any issues during edge case testing, document them:

- If scroll detection doesn't trigger on very short content, consider using a `onContentSizeChange` check.
- If the modal doesn't properly reset on tab change in certain scenarios, verify the `useEffect` dependency array.

No issues? Leave this step as "No limitations found."

- [ ] **Step 4: Final commit**

If everything passes:

```bash
git add .
git commit -m "feat: complete privacy policy acceptance feature with scroll-to-unlock UX"
```

- [ ] **Step 5: Summary of implementation**

Generate a summary for the PR/code review:

```
# Privacy Policy & Disclaimer Acceptance Feature

## Changes
- Added scroll-to-bottom detection to TermsAndPrivacyModal
- Extended LegalModalFooter to disable checkbox until scroll complete
- Added agreement row to SignUp screen (phone + tablet)
- Form validation extended to require agreement acceptance
- Added 5 translation keys (EN, FR, AR)

## Testing
- Manual E2E verification: scroll → accept → submit
- Dark mode: checkbox colors transition correctly
- RTL (Arabic): agreement row layout correct
- All linting and type checks pass

## Files Modified
- src/components/common/TermsAndPrivacyModal.tsx
- src/components/legal/LegalModalFooter.tsx
- src/screens/SignUpScreen.tsx
- src/screens/SignUpScreen.tablet.tsx
- src/assets/i18n/{en,fr,ar}.json
```

---

## Verification Checklist (From Spec)

- [ ] Fill form fully → "Create Account" disabled (agreement unchecked)
- [ ] Tap "Privacy Policy" link → modal opens
- [ ] Modal footer checkbox is greyed out, shows hint "Scroll to the bottom to accept"
- [ ] Partially scroll → checkbox still disabled
- [ ] Scroll to the very bottom → checkbox becomes tappable
- [ ] Tap checkbox → Continue button activates
- [ ] Tap Continue → modal closes, inline checkbox becomes checked
- [ ] "Create Account" now active → can submit form
- [ ] Try submitting without accepting → inline error shown
- [ ] Switch tabs in modal → `hasScrolledToBottom` resets, must scroll new tab
- [ ] Dark mode → agreement row, checkbox, link text all render correctly
- [ ] Tablet screen → same agreement row and modal behavior
- [ ] Arabic RTL → agreement row wraps correctly

---

## Success Criteria

**Feature is complete when:**
1. All tasks pass (linting, type-check, manual E2E)
2. Agreement row appears on SignUp, both phone and tablet
3. Checkbox is disabled until user scrolls to bottom of modal
4. Form submission is blocked without acceptance
5. All 3 locales have proper translations
6. Dark mode and RTL behave correctly
