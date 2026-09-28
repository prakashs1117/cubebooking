# Member Profile Modal Design

**Date:** 2026-08-30  
**Scope:** Click-to-view member profiles in MembersPage with a modal overlay showing profile details

## Overview

When users click a member card in the MembersPage (`/members`), a modal overlay displays that member's full profile details. The modal reuses the ProfileView component from ProfilePage but hides sensitive contact information (email, phone). This gives members a quick way to learn about each other without navigating away from the members list.

## Architecture

### Component Structure
```
MembersPage (state: selectedMember)
├── MemberCard (onClick → opens modal)
├── MemberProfileModal (new)
│   ├── Backdrop (semi-transparent overlay)
│   └── Modal Card
│       ├── Close button (X icon)
│       └── ProfileView (reused, hideContactDetails=true)
```

### Data Flow
1. User clicks a `MemberCard`
2. `MembersPage` sets `selectedMember` state to that profile's UID
3. Modal renders with `ProfileView` component
4. User clicks close button or backdrop → clears `selectedMember`

## Component Changes

### MembersPage.tsx
- Add state: `const [selectedMember, setSelectedMember] = useState<string | null>(null)`
- Pass click handler to `MemberCard`: `onClick={() => setSelectedMember(m.uid)}`
- Render `MemberProfileModal` at bottom, passing `selectedMember` and callback to close
- Find the selected profile by UID and pass to modal

### MemberCard (within MembersPage)
- Add `onClick` prop to the card container
- Add cursor pointer and subtle hover styling (opacity or background shift)
- Maintain existing card appearance in default state

### ProfileView.tsx (modified)
- Add optional prop: `hideContactDetails?: boolean` (default `false`)
- When `hideContactDetails=true`:
  - Skip rendering email and phone in the "Contact" section
  - Keep city and birthday visible
  - Contact section only renders if city OR birthday is present

### MemberProfileModal.tsx (new component)
**Props:**
- `profile: UserProfile | null`
- `email?: string` (only used if profile is own profile, but we won't show it here)
- `isOpen: boolean`
- `onClose: () => void`

**Rendering:**
- Backdrop: `fixed inset-0` with `background: rgba(0,0,0,0.4)` or similar
- Modal card: `fixed` or `absolute`, centered on screen using flexbox
- Close button (X icon) top-right, consistent with AppHeader styling
- Scrollable content area (`max-height: 90vh`)
- Renders `ProfileView` with `hideContactDetails={true}`
- No "Edit Profile" button (viewing other members, not editable)
- No "Sign Out" button
- No "My Posts" section (hide via ProfileView or skip rendering)

**Interactions:**
- Clicking backdrop closes modal
- Clicking close button closes modal
- Esc key closes modal (standard browser behavior via `onKeyDown`)

## Styling & Layout

**Modal Dimensions:**
- Width: `max-width: 520px` (match ProfilePage)
- Padding: `16px` on mobile, `20px` on desktop
- Border radius: `16px` or `20px` for consistency
- Box shadow: `0 10px 40px rgba(119,36,50,0.2)` (prominent, matches hero card in ProfilePage)

**Backdrop:**
- Covers full viewport: `fixed inset-0`
- Color: `rgba(0, 0, 0, 0.4)` or `rgba(0, 0, 0, 0.35)` (semi-transparent)
- Closes modal on click

**Responsive Behavior:**
- Mobile: centered, takes ~90vw width (with padding)
- Desktop: centered, fixed 520px width
- Always scrollable if content exceeds `90vh`

## Hidden Content for Other Members

When viewing another member via modal:
- ✅ Show: Name, avatar, roles, bio, city, birthday, level, member since, roles held, pathway, note, social links
- ❌ Hide: Email, phone number
- ❌ Hide: "My Posts" section
- ❌ Hide: "Edit Profile" button
- ❌ Hide: "Sign Out" button
- ❌ Hide: "Request Access" (guest CTA)

## Error Handling

- If `selectedMember` UID doesn't match any profile in the list, show empty state or close modal
- If profile data fails to load, show loading state or error message

## Testing

**Happy path:**
1. Load MembersPage with member data
2. Click a member card → modal opens with their profile
3. Verify email/phone are hidden, other details visible
4. Click close button → modal closes
5. Click backdrop → modal closes

**Edge cases:**
1. Click a member, then click another member → new profile loads in same modal
2. Click while data is loading → show loading indicator
3. Member's profile missing some fields → sections don't render (handled by ProfileView)

## Notes

- Reuse `ProfileView` to avoid code duplication
- Use conditional rendering (`hideContactDetails` prop) rather than creating a separate component
- Modal can be further extended for future features (e.g., "Add as friend", "Message", etc.)
- Birthday highlight (yellow border) still applies in modal view
