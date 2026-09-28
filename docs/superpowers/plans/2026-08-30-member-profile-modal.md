# Member Profile Modal Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add click-to-view modal for member profiles in MembersPage, showing profile details with phone/email hidden.

**Architecture:** Create a new `MemberProfileModal` component that wraps `ProfileView`, reusing existing profile display logic. Add `hideContactDetails` prop to `ProfileView` to conditionally render contact info. Wire modal state in `MembersPage` and make `MemberCard` clickable.

**Tech Stack:** React, TypeScript, Lucide icons, inline CSS styling (consistent with existing components)

---

## File Structure

```
Modified:
  src/components/ProfileView.tsx          (add hideContactDetails prop)
  src/components/MembersPage.tsx          (add modal state, render modal, make card clickable)

Created:
  src/components/MemberProfileModal.tsx   (new modal component)
```

---

## Task 1: Add hideContactDetails Prop to ProfileView

**Files:**
- Modify: `src/components/ProfileView.tsx:167-177`

**Context:** ProfileView is a read-only profile display component used in ProfilePage. We'll add an optional prop to hide email/phone for viewing other members' profiles.

- [ ] **Step 1: Update ProfileView function signature**

In `src/components/ProfileView.tsx`, find the function definition (line 167) and add the new prop:

```typescript
function ProfileView({
  profile,
  email,
  onEdit,
  onSignOut,
  hideContactDetails = false,
}: {
  profile: UserProfile | null
  email: string | null | undefined
  onEdit: () => void
  onSignOut: () => void
  hideContactDetails?: boolean
}) {
```

- [ ] **Step 2: Update Contact section rendering**

Find the "Contact & location" section (around line 405-432) and replace it with:

```typescript
{/* ── Contact & location ── */}
{(profile?.city || (!hideContactDetails && email) || formatDobNoYear(profile?.dateOfBirth)) && (
  <div style={{ background: '#fff', border: '1px solid #E6E2DE', borderRadius: 16, padding: '16px 18px', marginBottom: 12 }}>
    <div style={{ fontSize: 11, fontWeight: 800, color: '#A29BA6', textTransform: 'uppercase', letterSpacing: 0.8, marginBottom: 10 }}>
      Contact
    </div>
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {!hideContactDetails && email && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
          <Mail size={14} color="#772432" style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>{email}</span>
        </div>
      )}
      {profile?.city && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
          <MapPin size={14} color="#772432" style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 500 }}>{profile.city}</span>
        </div>
      )}
      {formatDobNoYear(profile?.dateOfBirth) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
          <span style={{ width: 14, textAlign: 'center', flexShrink: 0 }}>🎂</span>
          <span style={{ fontWeight: 500 }}>{formatDobNoYear(profile?.dateOfBirth)}</span>
        </div>
      )}
    </div>
  </div>
)}
```

- [ ] **Step 3: Verify ProfileView still works in ProfilePage**

The change is backward-compatible (default `false` maintains existing behavior). ProfileView in ProfilePage will show all contact details as before.

- [ ] **Step 4: Commit**

```bash
git add src/components/ProfileView.tsx
git commit -m "feat: add hideContactDetails prop to ProfileView"
```

---

## Task 2: Create MemberProfileModal Component

**Files:**
- Create: `src/components/MemberProfileModal.tsx`

**Context:** New modal component that displays a member's profile in a centered overlay with backdrop. Handles close interactions and doesn't show edit/signout buttons.

- [ ] **Step 1: Create the modal file with imports**

Create `src/components/MemberProfileModal.tsx`:

```typescript
import { X } from 'lucide-react'
import type { UserProfile } from '../types'
import ProfileView from './ProfileView'

interface MemberProfileModalProps {
  profile: UserProfile | null
  isOpen: boolean
  onClose: () => void
}

export default function MemberProfileModal({
  profile,
  isOpen,
  onClose,
}: MemberProfileModalProps) {
  if (!isOpen || !profile) return null

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0, 0, 0, 0.4)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
        padding: '16px',
      }}
      onClick={handleBackdropClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
    >
      <div
        style={{
          background: '#F4F3F1',
          borderRadius: '20px',
          boxShadow: '0 10px 40px rgba(119,36,50,0.2)',
          maxWidth: '520px',
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
        }}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          style={{
            position: 'sticky',
            top: 0,
            right: 0,
            zIndex: 10,
            float: 'right',
            background: 'rgba(255, 255, 255, 0.9)',
            border: '1px solid #E6E2DE',
            borderRadius: '10px',
            padding: '8px',
            cursor: 'pointer',
            margin: '12px 12px 0 0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.borderColor = '#772432'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.9)'
            e.currentTarget.style.borderColor = '#E6E2DE'
          }}
          aria-label="Close profile modal"
        >
          <X size={16} color="#6B7280" />
        </button>

        {/* Profile content */}
        <div style={{ padding: '0 12px 24px', clear: 'both' }}>
          <ProfileView
            profile={profile}
            email={undefined}
            onEdit={() => {}}
            onSignOut={() => {}}
            hideContactDetails={true}
          />
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify file structure and TypeScript**

The component should have no TypeScript errors and properly type all props.

- [ ] **Step 3: Commit**

```bash
git add src/components/MemberProfileModal.tsx
git commit -m "feat: create MemberProfileModal component"
```

---

## Task 3: Update MembersPage to Add Modal State

**Files:**
- Modify: `src/components/MembersPage.tsx:133-165`

**Context:** Add state to track which member is selected, and add handlers to open/close modal.

- [ ] **Step 1: Add modal state and helper function**

In `src/components/MembersPage.tsx`, find the `MembersPage` function (line 133) and add state after the existing state declarations (after line 137):

```typescript
export default function MembersPage() {
  const { isAdmin } = useAuthContext()
  const [members, setMembers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null)

  // Find selected member profile
  const selectedMember = selectedMemberId 
    ? members.find(m => m.uid === selectedMemberId) || null 
    : null
```

- [ ] **Step 2: Verify state is added correctly**

Check that the new state variables are in the component and the derived value `selectedMember` is computed.

- [ ] **Step 3: Commit**

```bash
git add src/components/MembersPage.tsx
git commit -m "feat: add selectedMemberId state to MembersPage"
```

---

## Task 4: Make MemberCard Clickable

**Files:**
- Modify: `src/components/MembersPage.tsx:63-131` (MemberCard component)

**Context:** Add onClick prop to MemberCard and add cursor pointer + hover styling.

- [ ] **Step 1: Update MemberCard function signature**

Find the `MemberCard` component function definition (line 63) and add onClick prop:

```typescript
function MemberCard({ 
  profile, 
  isAdmin, 
  onClick,
}: { 
  profile: UserProfile
  isAdmin: boolean
  onClick?: () => void
}) {
```

- [ ] **Step 2: Update card div with click handler and hover styling**

Find the card's outer div (line 70-76) and update it:

```typescript
return (
  <div
    onClick={onClick}
    style={{
      background: '#fff',
      border: `1.5px solid ${birthdayToday ? '#fcd34d' : '#E6E2DE'}`,
      borderRadius: 16, 
      padding: '14px 16px',
      display: 'flex', 
      alignItems: 'center', 
      gap: 12,
      cursor: onClick ? 'pointer' : 'default',
      transition: 'all 0.15s',
      ...(birthdayToday ? { boxShadow: '0 2px 10px rgba(252,211,77,0.35)' } : {}),
    }}
    onMouseEnter={(e) => {
      if (onClick) {
        e.currentTarget.style.background = '#f9f8f7'
        e.currentTarget.style.borderColor = '#d6d1cc'
      }
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = '#fff'
      e.currentTarget.style.borderColor = birthdayToday ? '#fcd34d' : '#E6E2DE'
    }}
  >
```

- [ ] **Step 3: Commit**

```bash
git add src/components/MembersPage.tsx
git commit -m "feat: make MemberCard clickable with hover styling"
```

---

## Task 5: Update MembersPage to Pass onClick to MemberCard

**Files:**
- Modify: `src/components/MembersPage.tsx:216` (MemberCard render)

**Context:** Wire the click handler to each MemberCard.

- [ ] **Step 1: Update MemberCard render call**

Find where MemberCard is rendered in the map (line 216), around the end of the `filtered.map()`:

```typescript
{filtered.map(m => (
  <MemberCard 
    key={m.uid} 
    profile={m} 
    isAdmin={isAdmin}
    onClick={() => setSelectedMemberId(m.uid)}
  />
))}
```

- [ ] **Step 2: Verify pass-through is correct**

The onClick prop should trigger `setSelectedMemberId` with the member's UID.

- [ ] **Step 3: Commit**

```bash
git add src/components/MembersPage.tsx
git commit -m "feat: wire click handler to MemberCard"
```

---

## Task 6: Render MemberProfileModal in MembersPage

**Files:**
- Modify: `src/components/MembersPage.tsx` (add import and modal render)

**Context:** Import the new MemberProfileModal component and render it with the selected member.

- [ ] **Step 1: Add import at top of file**

At the top of `src/components/MembersPage.tsx`, add the import (after existing imports, around line 12):

```typescript
import MemberProfileModal from './MemberProfileModal'
```

- [ ] **Step 2: Render modal before closing div**

Find the end of the MembersPage component (before the final closing `</div>`, around line 221) and add the modal right before the last closing div:

```typescript
      </div>

      <MemberProfileModal
        profile={selectedMember}
        isOpen={selectedMemberId !== null}
        onClose={() => setSelectedMemberId(null)}
      />
    </div>
  )
}
```

- [ ] **Step 3: Verify imports and structure**

Check that MemberProfileModal is imported and renders at the component level (not inside a conditional).

- [ ] **Step 4: Commit**

```bash
git add src/components/MembersPage.tsx
git commit -m "feat: render MemberProfileModal in MembersPage"
```

---

## Task 7: Manual Testing - Happy Path

**Context:** Test the feature end-to-end in the browser.

- [ ] **Step 1: Start the dev server**

```bash
npm run dev
```

Expected: Server starts on `http://localhost:5173`

- [ ] **Step 2: Navigate to Members page**

Go to `http://localhost:5173/members` in your browser.

Expected: See list of member cards.

- [ ] **Step 3: Click a member card**

Click any member card.

Expected: Modal opens showing their profile, with:
- Avatar, name, roles visible
- **Email NOT visible** in Contact section
- **Phone NOT visible** 
- City, birthday, bio, note, social links visible
- Close (X) button in top-right
- No "Edit Profile" button
- No "Sign Out" button
- No "My Posts" section

- [ ] **Step 4: Test close button**

Click the X button in the modal.

Expected: Modal closes, member list is visible again.

- [ ] **Step 5: Click member again and test backdrop click**

Click another member card to open modal.

Expected: Modal opens.

Click on the dark area outside the modal (backdrop).

Expected: Modal closes.

- [ ] **Step 6: Test keyboard close**

Click a member card to open modal.

Expected: Modal opens.

Press Escape key.

Expected: Modal closes.

- [ ] **Step 7: Test switching members**

Click one member card (modal opens).

Click another member's card.

Expected: Modal stays open, shows new member's profile (profile data updates, name/avatar change).

- [ ] **Step 8: Test birthday highlight**

Find a member with birthday today (if available) or check in the code that birthday styling persists.

Expected: Member card with birthday still has yellow border in list and modal.

---

## Task 8: Verify No Regression in ProfilePage

**Files:**
- Test: `src/components/ProfilePage.tsx` (manual test)

**Context:** Ensure changes to ProfileView didn't break the existing Profile page.

- [ ] **Step 1: Navigate to your profile page**

Go to `http://localhost:5173/profile` in your browser.

Expected: Profile page loads normally.

- [ ] **Step 2: Verify contact details are visible**

Check that your email is shown in the "Contact" section.

Expected: Email and (if filled in) phone are visible in your own profile.

- [ ] **Step 3: Verify edit mode still works**

Click "Edit Profile" button.

Expected: Edit form loads normally with no errors.

- [ ] **Step 4: Cancel and return**

Click "Cancel" to close edit mode.

Expected: Returns to view mode, profile displays correctly.

---

## Task 9: Final Verification and Commit

**Context:** Final check that everything is working and commit any outstanding changes.

- [ ] **Step 1: Check for console errors**

Open browser DevTools (F12) and check the Console tab.

Expected: No errors related to MemberProfileModal or ProfileView.

- [ ] **Step 2: Check TypeScript compilation**

Run type check:

```bash
npx tsc --noEmit
```

Expected: No TypeScript errors.

- [ ] **Step 3: Review modified files**

```bash
git status
```

Expected: Only the following files should be modified:
- `src/components/ProfileView.tsx`
- `src/components/MembersPage.tsx`
- `src/components/MemberProfileModal.tsx` (new)

- [ ] **Step 4: Create final summary commit if needed**

If any uncommitted changes remain:

```bash
git add src/components/
git commit -m "feat: complete member profile modal feature

- Add hideContactDetails prop to ProfileView
- Create MemberProfileModal component with centered overlay
- Wire modal state in MembersPage
- Make MemberCard clickable
- Hide email/phone when viewing other members"
```

---

## Summary

**Spec Coverage:**
✅ Modal overlay on member card click  
✅ Centered modal with backdrop  
✅ Close button and Esc key handling  
✅ Email/phone hidden from other members  
✅ Reused ProfileView component  
✅ No "My Posts", "Edit", or "Sign Out" in modal  
✅ Birthday highlight persists  
✅ Smooth interactions and hover states  

**No Placeholders:** All steps include exact code, file paths, and test expectations.

**Type Consistency:** All component props consistently named and typed.
