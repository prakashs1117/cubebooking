# Toastmasters Meeting Roles — Feature Spec

Reference document for building role management in a React app. Covers every standard club meeting role, what it does, and the data/behaviour each role needs in the product.

---

## 1. Role Catalogue

### Officer roles (club leadership, elected — 6 or 12 month terms)

| Code   | Role                | Responsibility                                                                  |
| ------ | ------------------- | ------------------------------------------------------------------------------- |
| `PRES` | President           | Chairs the club, presides over exec committee, club vision and health           |
| `VPE`  | VP Education        | Builds the meeting agenda, assigns speeches and roles, tracks Pathways progress |
| `VPM`  | VP Membership       | Guest handling, onboarding, membership drives, retention                        |
| `VPPR` | VP Public Relations | Social media, website, external promotion, press                                |
| `SEC`  | Secretary           | Minutes, club records, correspondence, member roster                            |
| `TRES` | Treasurer           | Dues collection, budget, financial reporting                                    |
| `SAA`  | Sergeant at Arms    | Venue/room setup, equipment, banner, timing devices, refreshments, attendance   |

### Meeting roles (rotated every meeting)

| Code     | Role                            | Responsibility                                                            |
| -------- | ------------------------------- | ------------------------------------------------------------------------- |
| `PO`     | Presiding Officer               | Opens and closes the meeting, hands control to the Toastmaster of the Day |
| `TMOD`   | Toastmaster of the Day          | Master of ceremonies; runs the agenda, introduces every segment           |
| `TTM`    | Table Topics Master             | Runs the impromptu speaking segment, prepares prompts                     |
| `GE`     | General Evaluator               | Evaluates the meeting itself, leads the evaluation segment                |
| `SPKR`   | Speaker                         | Delivers a prepared Pathways speech                                       |
| `EVAL`   | Evaluator                       | Gives verbal + written feedback on one prepared speech                    |
| `TIMER`  | Timer                           | Times every segment, signals green/amber/red, reports times               |
| `AHC`    | Ah-Counter                      | Counts filler words, crutch sounds, repetitions                           |
| `GRAM`   | Grammarian                      | Word of the day, notes good/poor language use                             |
| `TAGL`   | Timer + Ah-Counter + Grammarian | Combined role when the club is small (common in India)                    |
| `JOKE`   | Jokemaster                      | Opening humour segment                                                    |
| `GUEST`  | Guest Master / Greeter          | Welcomes guests, hands out guest cards                                    |
| `LISTEN` | Listening Post                  | Quiz on meeting details to test audience attention                        |
| `HARK`   | Hark Master                     | Recaps the previous meeting                                               |
| `BALLOT` | Ballot Counter                  | Collects and tallies award votes                                          |
| `VOTE`   | Vote Counter                    | Same as ballot counter in some clubs                                      |
| `INV`    | Invocator / Thought of the Day  | Opening reflection                                                        |
| `PLEDGE` | Pledge Leader                   | Leads pledge / club creed (region dependent)                              |

### Contest-only roles

`CHAIR` Contest Chair · `CHIEF` Chief Judge · `JUDGE` Judge · `TIEBREAK` Tiebreaker Judge · `CTIMER` Contest Timer · `COUNTER` Ballot Counter · `SGT` Contest Sergeant at Arms

---

## 2. Role Data Model

```ts
type RoleCode =
  | "PRES"
  | "VPE"
  | "VPM"
  | "VPPR"
  | "SEC"
  | "TRES"
  | "SAA"
  | "PO"
  | "TMOD"
  | "TTM"
  | "GE"
  | "SPKR"
  | "EVAL"
  | "TIMER"
  | "AHC"
  | "GRAM"
  | "TAGL"
  | "JOKE"
  | "GUEST"
  | "LISTEN"
  | "HARK"
  | "BALLOT"
  | "INV"
  | "PLEDGE";

interface Role {
  code: RoleCode;
  name: string;
  category: "officer" | "meeting" | "contest";
  description: string;
  duties: string[]; // checklist shown to the assignee
  scriptTemplate?: string; // fill-in-the-blank intro script
  defaultDurationSec?: number; // agenda block length
  timed: boolean; // does the Timer track this role
  greenSec?: number; // timing signals
  amberSec?: number;
  redSec?: number;
  maxPerMeeting: number; // 1 for TMOD, 3+ for SPKR
  minPerMeeting: number;
  pairsWith?: RoleCode[]; // EVAL pairs with SPKR
  conflictsWith?: RoleCode[]; // can't hold both in one meeting
  eligibility?: {
    minMeetingsAttended?: number;
    requiresLevel?: number; // Pathways level
    officersOnly?: boolean;
  };
  countsTowardPathways: boolean;
}
```

### Standard timing presets

| Role                           | Green | Amber | Red   | Hard stop |
| ------------------------------ | ----- | ----- | ----- | --------- |
| Table Topics response          | 1:00  | 1:30  | 2:00  | 2:30      |
| Ice Breaker speech             | 4:00  | 5:00  | 6:00  | 7:00      |
| Standard speech                | 5:00  | 6:00  | 7:00  | 7:30      |
| Long speech                    | 8:00  | 9:00  | 10:00 | 10:30     |
| Evaluation                     | 2:00  | 2:30  | 3:00  | 3:30      |
| General Evaluator report       | 5:00  | 6:00  | 7:00  | 7:30      |
| Grammarian / Ah-Counter report | 1:00  | 1:30  | 2:00  | 2:30      |

Timing tolerance for award eligibility: ±30 seconds of the qualifying window.

---

## 3. Features to Build

### 3.1 Role Directory

- Browsable list of all roles, filterable by category.
- Detail view per role: description, duties checklist, timing, script template, "who did this last".
- Search by role name or code.

### 3.2 Role Assignment (agenda builder)

- Drag or tap to assign a member to a role slot for a given meeting.
- Enforce `maxPerMeeting`, `conflictsWith`, and `eligibility` rules; show why an assignment is blocked.
- Auto-suggest based on: roles the member hasn't done recently, Pathways requirements, attendance history.
- Bulk fill: "auto-assign remaining roles" with a fairness weighting.
- Vacancy state — unfilled roles surface in a "needs volunteers" list.

### 3.3 Volunteer / Sign-up Flow

- Members claim open roles themselves; VPE approves or auto-approves.
- Waitlist when a role is already claimed.
- Swap requests between two members, with confirmation from both.

### 3.4 Role Reminders

- Notification at assignment, T-3 days, T-1 day, and 2 hours before the meeting.
- Reminder payload includes the duties checklist and script template.

### 3.5 Role Scripts & Prep Kits

- Fill-in-the-blank intro scripts populated with real names, speech titles, and Pathways project names.
- Printable / shareable prep sheet per role.
- Word of the Day entry field for the Grammarian; broadcast to the club before the meeting.

### 3.6 Live Meeting Mode

- Agenda runs top to bottom with the current segment highlighted.
- Timer role: start/stop/reset per segment, green-amber-red visual, records actual time.
- Ah-Counter role: tap counters per speaker per filler word.
- Grammarian role: log good/poor usage notes tied to a speaker.
- TAGL mode collapses timer + ah-counter + grammarian into one combined screen.
- Presiding Officer / TMOD get an "advance segment" control.

### 3.7 Evaluation Capture

- Evaluator form per speech: commend / recommend / commend structure, free notes, and a delivered-time field.
- Written feedback delivered to the speaker after the meeting.
- General Evaluator form covering each functional role.

### 3.8 Voting & Awards

- Ballots for Best Speaker, Best Evaluator, Best Table Topics, Best Role Player.
- Ballot counter tallies; results revealed by the TMOD.
- Award history per member.

### 3.9 Role History & Fairness

- Per-member ledger: every role held, with date and meeting number.
- "Roles never held" list to encourage variety.
- Fairness view for the VPE: distribution heatmap of roles across members.

### 3.10 Pathways Tracking

- Map role completions to Pathways project requirements.
- Level progress bars; flag members eligible to submit a level completion.

### 3.11 Officer Dashboards

- **VPE:** agenda pipeline for the next 4 meetings, vacancy count, speech slot bookings.
- **VPM:** guest log, new member funnel, membership renewals.
- **SAA:** setup checklist per meeting, equipment inventory, attendance capture.
- **Secretary:** minutes editor tied to the agenda, roster export.
- **Treasurer:** dues status per member, payment reminders.
- **VPPR:** meeting poster generator, social share assets.
- **President:** club health scorecard (attendance, DCP goals, member count).

### 3.12 Distinguished Club Program (DCP)

- Track the 10 DCP goals against real club data.
- Progress readout: Distinguished / Select / President's Distinguished thresholds.

---

## 4. Suggested React Structure

```
src/
  roles/
    roleCatalog.ts          // static role definitions + timing presets
    useRoleAssignment.ts    // assignment rules, conflict + eligibility checks
    RoleDirectory.tsx
    RoleDetail.tsx
    RoleBadge.tsx
  agenda/
    AgendaBuilder.tsx
    AgendaSlot.tsx
    AutoAssignSheet.tsx
    ScriptSheet.tsx
  live/
    LiveMeeting.tsx
    TimerPanel.tsx
    AhCounterPanel.tsx
    GrammarianPanel.tsx
    TaglPanel.tsx
  evaluation/
    EvaluationForm.tsx
    GeneralEvaluatorForm.tsx
  voting/
    BallotSheet.tsx
    ResultsReveal.tsx
  members/
    RoleHistory.tsx
    FairnessHeatmap.tsx
    PathwaysProgress.tsx
  officers/
    VpeDashboard.tsx
    SaaChecklist.tsx
    TreasurerLedger.tsx
    DcpTracker.tsx
```

### Core entities

```ts
Club { id, number, name, area, division, district, charterDate, meetingSchedule, venue }
Member { id, clubId, name, joinDate, pathway, level, officerRole?, status }
Meeting { id, clubId, number, date, theme, status: 'draft'|'published'|'live'|'closed' }
Assignment { id, meetingId, memberId, roleCode, slotIndex, status: 'invited'|'confirmed'|'declined'|'completed' }
Speech { id, meetingId, speakerId, title, project, targetMin, targetMax, actualSec }
TimingRecord { assignmentId, actualSec, signal: 'green'|'amber'|'red'|'over' }
Evaluation { id, speechId, evaluatorId, commend[], recommend[], notes }
Ballot { meetingId, category, voterId, nomineeId }
RoleLedgerEntry { memberId, roleCode, meetingId, date }
```

### State notes

- Role catalogue is static config — ship it in the bundle, no fetch.
- Assignment validation is pure: `validateAssignment(meeting, assignments, memberId, roleCode) → { ok, reason? }`.
- Live meeting timer should tick from a single interval in a context provider, not per-component, so all panels stay in sync.
- Persist live-meeting state locally so a refresh mid-meeting doesn't lose timings.

---

## 5. Build Order

1. Role catalogue + directory (static, no backend).
2. Members and meetings CRUD.
3. Agenda builder with assignment rules.
4. Reminders and volunteer sign-up.
5. Live meeting mode (timer first, then ah-counter/grammarian).
6. Evaluations and voting.
7. Role history, fairness, Pathways.
8. Officer dashboards and DCP.
