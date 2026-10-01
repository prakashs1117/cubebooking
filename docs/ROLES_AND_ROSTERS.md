# Roles & Rosters — How It Works

This document explains how user roles are structured and enforced, and how meeting rosters are created and managed.

---

## User Roles

### The Role Ladder

There are five roles, ordered from least to most access:

```
👁 Guest  →  👤 Member  →  📋 Club Member  →  👑 Admin  →  ⚡ Super Admin
```

| Role | Who gets it | What they can do |
|---|---|---|
| **Guest** `guest` | Anyone who signs up via the website | View their own profile only. No roster access. |
| **Member** `member` | Guests promoted by an admin | View and join meeting rosters, claim roles |
| **Club Member** `club member` | Same access as Member — legacy tier | View and join meeting rosters, claim roles |
| **Admin** `admin` | Assigned by a Super Admin | Everything above + manage Members panel, view submissions, edit club details, create rosters |
| **Super Admin** `super admin` | Highest authority | Everything above + assign all roles including Admin and Super Admin |

> **Note:** `member` and `club member` have identical access. The `club member` tier is kept for backward compatibility with existing accounts.

---

### How Roles Are Stored

Each user has a document in the Firestore `users/{uid}` collection. The `role` field holds their current role as a plain string:

```
users/
  <uid>/
    uid: "abc123"
    email: "user@example.com"
    role: "guest"          ← controlled by admins only
    displayName: "Jane"
    ...
```

The `role` field is **protected** — regular users cannot write it through their own profile edits. Only admin actions in the Members panel call `updateDoc` on another user's document to change their role.

---

### How Roles Are Assigned

#### New signups
When a user creates an account (email/password or Google), their Firestore document is created automatically with `role: "guest"`. They stay as Guest until an admin promotes them.

#### Admin login path (`/admin-login`)
The admin login page is a separate entry point. After signing in, the app reads the user's Firestore profile — if `role` is `admin` or `super admin`, they are redirected to the `/management` dashboard.

#### Promoting users (Admin dashboard → Roles/Members tab)
Admins and Super Admins visit `/management` and open the **Roles** (Super Admin) or **Members** (Admin) tab.

Each user card shows a **Role Ladder** — a horizontal stepper of all five tiers:

```
[👁 Guest] › [👤 Member] › [📋 Club Member] › [👑 Admin] › [⚡ Super Admin]
```

- The user's **current role** is highlighted.
- Clicking any other step immediately writes the new role to Firestore.
- Regular Admins can only assign `guest`, `member`, `club member` — the `admin` and `super admin` steps appear grayed-out.
- Super Admins can assign any role to anyone except themselves.
- A stat overview at the top of the tab shows a count of users at each tier.

#### Quick filter
The filter chip row (`All / Guest / Member / Club Member / Admin / Super Admin`) lets admins narrow the list to a specific tier — useful for bulk-reviewing new Guest signups waiting for promotion.

---

### Role Checks in the App

| Where | What it checks |
|---|---|
| `/management` route | `isAdmin` (role is `admin` or `super admin`) |
| `/roster` and `/roster/:id` routes | Role is **not** `guest` (any other role gets in) |
| Bottom tab bar | Guests: Home + Profile. Members/Club Members: + Roster. Admins: + Dashboard. |
| App header roster link | Hidden from Guests |
| Role Ladder picker | Super Admin: all steps active. Admin: only guest/member/club member active. |
| Profile page | Guests see a "You're a Guest — Request Access" banner |

---

## Meeting Rosters

### What Is a Roster?

A **roster** represents a single Toastmasters meeting. It holds the meeting details (date, theme, WOD, POD, location) and a set of **role slots** that club members sign up for.

Rosters are stored in Firestore under `meetings/{rosterId}` with a subcollection `meetings/{rosterId}/roleSlots/`.

---

### Creating a Roster

Only **Admins** and **Super Admins** can create rosters.

1. Go to `/roster`.
2. Click **+ Create** (top right — only visible to admins).
3. Fill in the **Create New Roster** modal:

| Field | Notes |
|---|---|
| Club name | Auto-filled from `club-details` collection — read-only |
| Area / Division / District | Auto-filled from `club-details` — read-only |
| Meeting number | e.g. `574` — required |
| Date | Date picker |
| Timing | Start–end time picker |
| Location | Venue name |
| Theme | Optional meeting theme |
| WOD | Word of the Day |
| POD | Phrase of the Day |
| Speaker count | Choose **3** or **5** speaker+evaluator pairs |

4. Click **Create Roster**.

The modal writes to `meetings/` and then creates the default role slots in a batch write.

---

### Default Role Slots

Every roster is created with a fixed set of role slots grouped into four categories:

| Group | Abbreviation | Full name |
|---|---|---|
| **Role Takers** | SAA | Sergeant at Arms |
| | PO | Presiding Officer |
| | TMOD | Toastmaster of the Day |
| | TTM | Table Topics Master |
| | GE | General Evaluator |
| **TAG L** | TIMER | Timer |
| | AHC | Ah-Counter |
| | GRAM | Grammarian |
| | LISTEN | Listening Post |
| **Speakers** | SPKR | Speaker (×3 or ×5) |
| **Evaluators** | EVAL | Evaluator (×3 or ×5) |

Speaker and Evaluator counts match the number chosen in the modal (3 or 5 pairs).

---

### Viewing a Roster

Navigate to `/roster` to see all meetings listed newest-first. Click **Open →** (desktop) or tap the row (mobile) to open a meeting poster at `/roster/:rosterId`.

The poster page shows:
- Meeting details (number, date, timing, location, theme, WOD, POD)
- The full role board with all slots and who has claimed each one
- Unclaimed slots are shown as empty and clickable

---

### Claiming a Role

Any user with `member`, `club member`, `admin`, or `super admin` role can claim an open role slot.

1. Open a roster at `/roster/:rosterId`.
2. Tap an empty slot on the role board.
3. The **Role Picker** panel slides in — confirm your name.
4. The slot is written to Firestore: `{ uid, name, claimedAt }`.
5. A `roleClaimEvent` is also written for the activity log.

Releasing a role works the same way — tap your own claimed slot to release it.

Admins can see and manage all claims. Non-admins can only claim/release their own slot.

---

### Sharing a Roster

Each roster has a public share URL: `/poster/:rosterId`

This page renders a shareable meeting poster (image-style layout) with all the details and role assignments. It does **not** require login — anyone with the link can view it.

Admins can also download the poster as an image from the roster page.

---

### Role Activity Log

The **Activity** tab in the admin dashboard (`/management` → Activity) shows a chronological log of every role claim and release event across all meetings. Each entry records:

- Who claimed or released the role
- Which role and which meeting
- The timestamp

This data comes from the `meetings/{rosterId}/roleClaimEvents/` subcollection.

---

## Firestore Collections at a Glance

| Collection | Purpose |
|---|---|
| `users/{uid}` | User profiles including the `role` field |
| `meetings/{rosterId}` | Meeting roster metadata |
| `meetings/{rosterId}/roleSlots/{slotId}` | Individual role slots (claimed/unclaimed) |
| `meetings/{rosterId}/roleClaimEvents/{id}` | Audit log of claim/release actions |
| `club-details/{id}` | Club info (name, number, district, meeting time/location) — used to pre-fill new rosters |
| `toastmaster-onboarding/{id}` | Interest form submissions visible in the Submissions tab |
