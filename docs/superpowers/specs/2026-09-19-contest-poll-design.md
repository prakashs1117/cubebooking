# Contest Poll — Design Spec
**Date:** 2026-09-19  
**Project:** Toaster (Dhwani Toastmasters app)

---

## Overview

A standalone contest voting poll attached to a meeting roster. Runs independently of the regular awards poll. Admin creates the contest, adds contestants (from member list or by name), shares a link, and later closes voting and declares a winner. Members and guests can both vote.

---

## User Flows

### Admin flow
1. Open any meeting roster (`/roster/:rosterId`) as admin.
2. A new **"Contest Poll"** section appears in the admin panel (alongside existing controls/roles tabs).
3. Admin clicks **"Create Contest Poll"**, picks a contest type from a dropdown:
   - Humorous Speech Contest
   - Table Topics Contest
   - Evaluation Contest
   - International Speech Contest
4. Admin adds contestants using **Option C**:
   - **Member picker** — search attending members by name, click to add
   - **Free-text input** — type any name and press Add (for guests / non-members)
5. Admin can remove any contestant before voting opens.
6. Admin copies the shareable link: `/roster/:rosterId/contest` and shares it.
7. When ready to close: admin clicks **"Close Voting"** → voting freezes.
8. Admin sees vote counts per contestant and clicks **"Declare Winner"** on one.
9. Winner is saved; ContestBanner on the feed shows the result.

### Member / Guest voter flow
1. Visit `/roster/:rosterId/contest` — **no login required**.
2. Guests see a name-entry prompt (same `GuestNamePrompt` pattern as VotingPage).
3. Voter sees the contest title and a card for each contestant.
4. Tap one card to select → tap **"Submit Vote"** → confirmation dialog → locked.
5. After submission, voter sees a receipt showing their pick.
6. When voting is closed + winner declared, everyone on the page sees the winner highlighted.

---

## Data Model (Firestore)

```
meetings/{rosterId}/contest          ← single doc per meeting
  title: string                      // e.g. "Humorous Speech Contest"
  contestants: string[]              // ordered list of names
  frozen: boolean                    // admin closes voting
  winner: string | null              // declared winner name
  createdAt: Timestamp
  updatedAt: Timestamp

meetings/{rosterId}/contestVotes/{voterId}
  vote: string                       // contestant name
  displayName: string | null
  isGuest: boolean
  submittedAt: Timestamp
```

`voterId` = `user.uid` for members, `guest_<slugified-name>` for guests (same pattern as VotingPage).

One contest doc per meeting (one contest at a time). Overwriting the doc resets contestants; votes are separate and persist independently.

---

## Components

### New files

| File | Purpose |
|---|---|
| `src/components/roster/ContestPollPage.tsx` | Full voting UI at `/roster/:rosterId/contest` |
| `src/components/roster/ContestBanner.tsx` | Feed banner — shown on contest meeting day |
| `src/components/roster/AdminContestPanel.tsx` | Admin: create contest, manage contestants, close voting, declare winner |

### Modified files

| File | Change |
|---|---|
| `src/App.tsx` | Add public route `/roster/:rosterId/contest` → `ContestPollPage` |
| `src/components/roster/MeetingPosterPage.tsx` | Add "Contest Poll" tab/section in admin panel; render `AdminContestPanel` |
| `src/components/blog/CommunityFeedPage.tsx` | Render `ContestBanner` below `VotingBanner` |

---

## ContestPollPage (`/roster/:rosterId/contest`)

**Public route — no auth required.**

Reads:
- `meetings/{rosterId}` — meeting title/date for the header
- `meetings/{rosterId}/contest` — title, contestants, frozen, winner
- `meetings/{rosterId}/contestVotes/{voterId}` — this voter's existing vote

Displays:
- `AppHeader` with back → roster, title = contest title, subtitle = meeting no + date
- If no contest doc exists: "No contest poll has been set up for this meeting yet."
- If frozen + winner declared: winner highlighted with 🏅, vote counts shown to all
- If frozen + no winner yet: "Voting is closed. Results coming soon."
- If open + not voted: contestant cards (same `NomineeCard` style as VotingPage), single select, Submit button
- If open + already voted (submittedAt set): vote receipt
- Guest name prompt before showing cards (same as VotingPage)

Vote counts visible to admin at all times; visible to everyone once voting is frozen.

---

## AdminContestPanel

Shown only to admin, inside `MeetingPosterPage` as a new tab or section.

States:
- **No contest yet:** "Create Contest Poll" button + contest type selector
- **Contest exists, open:** contestant list with remove buttons; member picker + free-text add; "Close Voting" button; copy link button; live vote count (admin only)
- **Contest frozen, no winner:** vote counts per contestant; "Declare Winner" button per contestant; "Re-open Voting" button
- **Contest frozen, winner declared:** winner shown with 🏅; option to change winner

Contestant add — Option C:
- `AttendeeSelector` component (already exists) to pick from attending members
- Free-text input + Add button for guests/non-members
- Duplicates silently ignored

---

## ContestBanner (Community Feed)

Mirrors `VotingBanner` structure. Shown on the feed only on meeting day (same `isMeetingDay` logic).

States:
- **No contest for today's meeting:** render nothing
- **Contest open:** green banner, "Vote now" CTA → `/roster/:rosterId/contest`
- **Contest frozen, no winner:** grey banner, "View results" CTA
- **Contest frozen + winner declared:** amber banner with winner name, "View results" CTA

Shown below the existing `VotingBanner`.

---

## Constraints & Rules

- One vote per person, locked on `submittedAt`. Cannot change after submission.
- Admin can add/remove contestants only while voting is open (not frozen).
- Removing a contestant does NOT delete existing votes for that name.
- `frozen: true` blocks new votes from being saved server-side (checked in `ContestPollPage` before write).
- No time-lock on contest polls (unlike regular awards which unlock 45 min into meeting). Admin controls open/close manually.
- Guest voterId: `guest_<slugified-name>` — if two guests enter the same name they share a slot (acceptable, same behaviour as existing VotingPage).
- Winner declaration writes the winner name to the contest doc and does **not** award a badge (contests are separate from the awards badge system).

---

## Out of Scope

- Multiple contests per meeting
- Contest-specific badges / `awardBadges` integration
- Contestant speech order or timing
- Historical contest archive page
