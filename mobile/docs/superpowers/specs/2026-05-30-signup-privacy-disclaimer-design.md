# Signup: Privacy Policy & Disclaimer Acceptance

**Date:** 2026-05-30  
**Status:** Approved

---

## Context

Users can currently complete registration without ever reading or acknowledging the Privacy Policy or Terms of Service. Legal/compliance requires explicit, informed consent before account creation. The existing `TermsAndPrivacyModal` component is fully built (full-screen, tabs for Privacy Policy + Terms of Service, scrollable content, checkbox, Continue button) but is not wired into the signup flow. This spec closes that gap with a scroll-to-unlock acceptance UX.

---

## Goals

- Block signup unless the user has explicitly accepted the Privacy Policy / Disclaimer
- User must scroll to the bottom of the active tab before the acceptance checkbox unlocks
- The `agreement: true` field already sent in the `register()` API call becomes meaningful

---

## User Flow

1. User fills in the signup form (name, email, password, captcha)
2. Below the captcha, they see: `[ ] I agree to the [Privacy Policy] and [Disclaimer]`
3. "Create Account" button is disabled until this checkbox is checked
4. User taps "Privacy Policy" or "Disclaimer" — full-screen `TermsAndPrivacyModal` opens
5. Inside the modal: checkbox in the footer is **greyed out and not tappable** initially
6. User scrolls to the bottom of the active tab → checkbox becomes tappable
7. User taps checkbox → "Continue" button activates
8. User taps "Continue" → modal closes, inline checkbox on signup form becomes checked
9. "Create Account" button activates — registration proceeds normally

---

## Architecture

### Scroll-to-unlock detection (`TermsAndPrivacyModal`)

The `ScrollView` gets:
- `onContentSizeChange={(_w, h) => setContentHeight(h)}` — stores total scrollable height
- `onScroll={handleScroll}` — checks if bottom is reached (threshold: 20px)
- `scrollEventThrottle={16}`

```ts
const handleScroll = (e: NativeScrollEvent) => {
  const { contentOffset, layoutMeasurement, contentSize } = e.nativeEvent;
  if (contentOffset.y + layoutMeasurement.height >= contentSize.height - 20) {
    setHasScrolledToBottom(true);
  }
};
```

`hasScrolledToBottom` lives in `TermsAndPrivacyModal` component state (not in the hook — it's a UI concern). When `activeTab` changes, reset `hasScrolledToBottom` to `false`.

### `LegalModalFooter` changes

New prop: `canAccept: boolean`  
When `canAccept` is `false`: checkbox has `opacity: 0.4`, `pointerEvents: 'none'`, and a hint label below it: `"Scroll to the bottom to accept"`.

### `SignUpScreen` changes

New state:
```ts
const [agreementAccepted, setAgreementAccepted] = useState(false);
const [showLegalModal, setShowLegalModal] = useState(false);
const [agreementError, setAgreementError] = useState('');
```

Updated `isFormValid`:
```ts
const isFormValid =
  name.trim().length > 0 &&
  email.trim().length > 0 &&
  password.trim().length > 0 &&
  confirmPassword.trim().length > 0 &&
  captchaAnswer.trim().length > 0 &&
  agreementAccepted;
```

Updated `handleSignUp` — add guard at top:
```ts
if (!agreementAccepted) {
  setAgreementError(t('auth.agreementRequired', { defaultValue: 'You must accept the Privacy Policy to continue' }));
  return;
}
```

New UI row (above the "Create Account" button):
```tsx
<View style={styles.agreementRow}>
  <TouchableOpacity
    onPress={() => setShowLegalModal(true)}
    style={styles.agreementCheckbox}
    activeOpacity={0.7}
  >
    <Icon
      name={agreementAccepted ? 'checkbox-checked' : 'checkbox-unchecked'}
      size={20}
      color={agreementAccepted ? BaseColors.merckPurple : theme.border.primary}
    />
  </TouchableOpacity>
  <Text style={styles.agreementText}>
    {t('auth.iAgreeTo', { defaultValue: 'I agree to the ' })}
    <Text style={styles.agreementLink} onPress={() => setShowLegalModal(true)}>
      {t('auth.privacyPolicy', { defaultValue: 'Privacy Policy' })}
    </Text>
    {t('auth.and', { defaultValue: ' and ' })}
    <Text style={styles.agreementLink} onPress={() => setShowLegalModal(true)}>
      {t('auth.disclaimer', { defaultValue: 'Disclaimer' })}
    </Text>
  </Text>
</View>
{agreementError ? <Text style={styles.errorText}>{agreementError}</Text> : null}
```

Modal wiring:
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

---

## Files to Modify

| File | Change |
|---|---|
| `src/screens/SignUpScreen.tsx` | Add `agreementAccepted` state, agreement row UI, `showLegalModal` state, extend `isFormValid`, `handleSignUp` guard, `TermsAndPrivacyModal` wiring |
| `src/screens/SignUpScreen.tablet.tsx` | Mirror the same agreement row and modal changes |
| `src/components/common/TermsAndPrivacyModal.tsx` | Add `hasScrolledToBottom` state, scroll detection on `ScrollView`, reset on tab change, pass `canAccept` to footer |
| `src/components/legal/LegalModalFooter.tsx` | Accept `canAccept: boolean` prop; visually disable + show hint when false |

---

## Translation Keys to Add

```
auth.iAgreeTo
auth.privacyPolicy
auth.and
auth.disclaimer
auth.agreementRequired
```

Add to all locale files: `en.json`, `fr.json`, `ar.json`.

---

## Verification Checklist

- [ ] Fill form fully → "Create Account" disabled (agreement unchecked)
- [ ] Tap "Privacy Policy" link → modal opens
- [ ] Modal footer checkbox is greyed out, shows hint "Scroll to the bottom to accept"
- [ ] Partially scroll → checkbox still disabled
- [ ] Scroll to the very bottom → checkbox becomes tappable
- [ ] Tap checkbox → Continue button activates
- [ ] Tap Continue → modal closes, inline checkbox becomes checked
- [ ] "Create Account" now active → can submit form
- [ ] Try submitting without accepting (if checkbox manually unchecked via state) → inline error shown
- [ ] Switch tabs in modal → `hasScrolledToBottom` resets, must scroll new tab
- [ ] Dark mode → agreement row, checkbox, link text all render correctly
- [ ] Tablet screen → same agreement row and modal behavior
- [ ] Arabic RTL → agreement row wraps correctly

---

## Out of Scope

- Backend changes: `agreement: true` is already sent in `register()` call
- Storing the acceptance timestamp (not required for this iteration)
- Forcing re-acceptance on policy updates (future iteration)
