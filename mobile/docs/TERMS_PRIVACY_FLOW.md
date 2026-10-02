# Terms & Privacy - User Flow Diagram

## 📱 Complete User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        USER OPENS APP                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     NAVIGATES TO SIGN UP                         │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SIGNUP FORM SCREEN                          │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Create Account                                           │  │
│  │                                                           │  │
│  │  [Username Input]                                        │  │
│  │  [Email Input]                                           │  │
│  │  [Password Input]                                        │  │
│  │  [Confirm Password Input]                                │  │
│  │                                                           │  │
│  │  [ Sign Up Button ]                                      │  │
│  │                                                           │  │
│  │  ─────────── or continue with ───────────               │  │
│  │                                                           │  │
│  │  [Google] [Apple]                                        │  │
│  │                                                           │  │
│  │  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━      │  │
│  │  By signing up, you agree to our                         │  │
│  │  Terms of Service and Privacy Policy  [Links]           │  │
│  │                                                           │  │
│  │  Already have an account? Sign In                        │  │
│  └───────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    User clicks "Sign Up"
                             │
                             ▼
                    ┌────────────────┐
                    │ Feature Flag   │
                    │ Enabled?       │
                    └────┬────────┬──┘
                         │        │
                    No   │        │  Yes
                    ─────┘        └─────┐
                    │                   │
                    ▼                   ▼
           ┌────────────────┐   ┌──────────────┐
           │ Proceed with   │   │ Has User     │
           │ Signup         │   │ Accepted?    │
           └────────────────┘   └───┬────────┬─┘
                                    │        │
                               Yes  │        │  No
                               ─────┘        └──────┐
                               │                    │
                               ▼                    ▼
                      ┌────────────────┐   ┌────────────────────────────┐
                      │ Proceed with   │   │   SHOW MODAL               │
                      │ Signup         │   │                            │
                      └────────────────┘   └────────┬───────────────────┘
                                                    │
                                                    ▼
┌───────────────────────────────────────────────────────────────────────────────┐
│                        TERMS & PRIVACY MODAL                                  │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │  Legal Information                                      [X Close]        │ │
│  │  ─────────────────────────────────────────────────────────────────────  │ │
│  │  [ Privacy Policy ]  [ Terms of Service ]                ← Tabs         │ │
│  │  ═════════════════════════════════════════════════════════════════════  │ │
│  │                                                                         │ │
│  │  🛡️  Privacy Policy                                                     │ │
│  │                                                                         │ │
│  │  Last Updated: February 28, 2026                                       │ │
│  │                                                                         │ │
│  │  1. Introduction                                                       │ │
│  │  We respect your privacy and are committed to protecting              │ │
│  │  your personal data...                                                │ │
│  │                                                                         │ │
│  │  2. Information We Collect                                             │ │
│  │  We may collect, use, store and transfer different kinds...           │ │
│  │                                                                         │ │
│  │  [Scrollable Content - 7 Sections]                                    │ │
│  │  ...                                                                   │ │
│  │  ...                                                                   │ │
│  │                                                                         │ │
│  │  ═════════════════════════════════════════════════════════════════════  │ │
│  │                                                                         │ │
│  │  ☐ I have read and agree to the Privacy Policy and Terms              │ │
│  │     of Service                                                         │ │
│  │                                                                         │ │
│  │  [ Continue ]  ← Disabled until checkbox is checked                   │ │
│  │                                                                         │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────┬──────────────────────────────────────────┘
                                     │
                           User Actions:
                                     │
        ┌────────────────────────────┼────────────────────────────┐
        │                            │                            │
        ▼                            ▼                            ▼
   Clicks [X]                  Clicks outside              Checks box & Clicks Continue
        │                            │                            │
        ▼                            ▼                            ▼
  Modal closes            Modal closes                  ✅ Acceptance saved
  No signup              No signup                        │
                                                         ▼
                                                   Modal closes
                                                         │
                                                         ▼
                                              ┌──────────────────┐
                                              │  Proceed with    │
                                              │  Signup API      │
                                              └────────┬─────────┘
                                                       │
                                                       ▼
                                              ┌──────────────────┐
                                              │ OTP Verification │
                                              │ Screen           │
                                              └──────────────────┘
```

## 🔄 Return User Flow

```
┌─────────────────────────────────────────────────────────────────┐
│              RETURNING USER (Already Accepted)                   │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
┌─────────────────────────────────────────────────────────────────┐
│                     FILLS SIGNUP FORM                            │
└────────────────────────────┬────────────────────────────────────┘
                             │
                    Clicks "Sign Up"
                             │
                             ▼
                    ┌────────────────┐
                    │ Check if       │
                    │ Previously     │
                    │ Accepted       │
                    └────┬───────────┘
                         │
                    ✅ Found in
                    AsyncStorage
                         │
                         ▼
                ┌────────────────────┐
                │ No Modal Shown     │
                │ Direct Signup      │
                └────────┬───────────┘
                         │
                         ▼
                ┌────────────────────┐
                │ OTP Verification   │
                │ Screen             │
                └────────────────────┘

   Smooth experience! No interruption! 🎉
```

## 🎭 Social Login Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   USER CLICKS "GOOGLE" BUTTON                    │
└────────────────────────────┬────────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │ Terms          │
                    │ Accepted?      │
                    └────┬────────┬──┘
                         │        │
                    Yes  │        │  No
                    ─────┘        └─────┐
                    │                   │
                    ▼                   ▼
           ┌────────────────┐   ┌──────────────┐
           │ Google OAuth   │   │ Show Terms   │
           │ Flow           │   │ Modal        │
           └────────────────┘   └──────┬───────┘
                                       │
                              User Accepts
                                       │
                                       ▼
                              ┌────────────────┐
                              │ Google OAuth   │
                              │ Flow           │
                              └────────────────┘
```

## 📊 State Diagram

```
┌──────────────────────────────────────────────────────────┐
│                   Application State                       │
└──────────────────────────────────────────────────────────┘

State 1: Not Accepted + Feature Enabled
├─ Signup Button → Shows Modal
├─ Social Login → Shows Modal
└─ Modal visible = true

State 2: Accepted + Feature Enabled
├─ Signup Button → Direct signup
├─ Social Login → Direct flow
└─ Modal visible = false

State 3: Feature Disabled
├─ Signup Button → Direct signup
├─ Social Login → Direct flow
└─ Modal never shows

State 4: Signin (showOnSignin = false, default)
├─ Signin Button → Direct signin
├─ Social Login → Direct flow
└─ Modal never shows

State 5: Signin (showOnSignin = true, custom config)
├─ Follows same logic as signup
└─ Modal shows if not accepted
```

## 💾 Data Flow

```
┌──────────────────────────────────────────────────────────┐
│              Data Persistence Flow                        │
└──────────────────────────────────────────────────────────┘

User Accepts Terms
       │
       ▼
useTermsAndPrivacy.handleAccept()
       │
       ▼
AsyncStorage.setItem()
       │
       ├─ Key: '@terms_privacy_acceptance'
       │
       └─ Value: {
            "accepted": true,
            "timestamp": "2026-02-28T12:00:00.000Z",
            "version": "1.0"
          }
       │
       ▼
State Updated: hasAccepted = true
       │
       ▼
Modal closes
       │
       ▼
Signup proceeds

─────────────────────────────────

On Next App Launch
       │
       ▼
useEffect(() => checkAcceptance())
       │
       ▼
AsyncStorage.getItem()
       │
       ▼
Parse JSON
       │
       ├─ If found → hasAccepted = true
       └─ If not found → hasAccepted = false
       │
       ▼
App renders with correct state
```

## 🌐 Multi-Language Flow

```
┌──────────────────────────────────────────────────────────┐
│                Language Detection                         │
└──────────────────────────────────────────────────────────┘

App loads
    │
    ▼
i18n detects language
    │
    ├─ English (en) → LTR layout
    ├─ French (fr)  → LTR layout
    └─ Arabic (ar)  → RTL layout ◀──┐
                                    │
                                    ├─ Close icon: Left side
                                    ├─ Text: Right-aligned
                                    ├─ Checkbox: Right side
                                    └─ All layout reversed
    │
    ▼
Modal renders with correct:
    ├─ Language strings
    ├─ Layout direction
    └─ Icon positions
```

## 🎨 Theme Flow

```
┌──────────────────────────────────────────────────────────┐
│                   Theme Detection                         │
└──────────────────────────────────────────────────────────┘

App loads
    │
    ▼
useTheme() hook
    │
    ├─ Light Mode
    │   ├─ Background: White
    │   ├─ Text: Dark
    │   └─ Borders: Light gray
    │
    └─ Dark Mode
        ├─ Background: Dark gray
        ├─ Text: White
        └─ Borders: Medium gray
    │
    ▼
Modal applies theme colors dynamically
    │
    ├─ theme.background.primary
    ├─ theme.text.primary
    ├─ theme.border.secondary
    └─ theme.text.link
    │
    ▼
Looks great in both themes! ✨
```

## 🚦 Feature Flag Flow

```
┌──────────────────────────────────────────────────────────┐
│              Feature Flag Evaluation                      │
└──────────────────────────────────────────────────────────┘

Component renders
    │
    ▼
useFeatureFlag('ENABLE_TERMS_AND_PRIVACY_POPUP')
    │
    ▼
Check featureFlagsConfig.json
    │
    ├─ enabled: true
    │   ├─ Check environment
    │   ├─ Check rollout %
    │   └─ Return: true
    │
    └─ enabled: false
        └─ Return: false
    │
    ▼
<FeatureFlag flag="...">
    │
    ├─ If true → Render modal
    └─ If false → Render nothing (or fallback)
```

## 📈 Complete Integration Map

```
┌─────────────────────────────────────────────────────────────────┐
│                    Component Architecture                        │
└─────────────────────────────────────────────────────────────────┘

SignUpScreen.tsx
├─ useTermsAndPrivacy() hook
│  ├─ isModalVisible
│  ├─ hasAccepted
│  ├─ showModal()
│  └─ handleAccept()
│
├─ <FeatureFlag> wrapper
│  └─ Checks: ENABLE_TERMS_AND_PRIVACY_POPUP
│
├─ Terms link (bottom of form)
│  └─ onClick → showModal()
│
├─ Signup button
│  └─ onClick → Check acceptance → Show modal or proceed
│
├─ Social buttons
│  └─ onClick → Check acceptance → Show modal or proceed
│
└─ <TermsAndPrivacyModal>
   ├─ visible={isModalVisible}
   ├─ onClose={hideModal}
   └─ onAccept={handleTermsAccept}
      └─ Saves to AsyncStorage
      └─ Proceeds with signup

SignInScreen.tsx
├─ Same structure
├─ Additional: showOnSignin config check
└─ Only shows if config.showOnSignin = true
```

---

## 🎯 Key Points

1. **Non-intrusive**: Only shows once per user
2. **Configurable**: Feature flag + config options
3. **Persistent**: Acceptance saved across sessions
4. **Accessible**: Can preview before signup
5. **Professional**: Full legal content
6. **Localized**: 3 languages with RTL
7. **Themed**: Light/dark mode support
8. **Smooth**: Natural integration into auth flow

## 🔐 Privacy & Compliance

✅ Explicit user consent required
✅ Timestamp recorded
✅ Version tracked
✅ Can audit who accepted when
✅ Users can review anytime via link
✅ GDPR/CCPA friendly approach

---

**Visual Guide Version:** 1.0.0
**Last Updated:** February 28, 2026
