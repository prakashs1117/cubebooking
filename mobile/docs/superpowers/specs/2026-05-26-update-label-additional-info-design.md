# Update Label — Additional Information Field

**Date:** 2026-05-26
**Feature:** Add "Additional Information" text area to the Update Label bottom sheet
**Scope:** Minimal — 3 file changes only

---

## Context

The `SafetyLabelScreen` allows users to customise a chemical safety label via a `PrintDetailsModal` bottom sheet. The sheet currently has Template, Amount, and Unit fields. The `LabelPreview` component already has an `extraText` prop that renders a small italic line on the label body, but there is no UI to populate it. This spec adds that missing input.

---

## Changes

### 1. `PrintDetails` interface (`PrintDetailsModal.tsx`)

Add `extraText: string` to the exported `PrintDetails` interface:

```ts
export interface PrintDetails {
  template: string;
  amount: string;
  unit: string;
  extraText: string;   // ← new
}
```

### 2. `PrintDetailsModal` component (`PrintDetailsModal.tsx`)

- Add `initialExtraText?: string` prop (default `''`)
- Add `extraText` state initialised from `initialExtraText`
- Reset `extraText` to `initialExtraText` inside `open()` in `useImperativeHandle`
- Render a multiline `TextInput` below the Unit section:
  - Label: "Additional Information"
  - Placeholder: "Enter additional info (optional)"
  - `multiline={true}`, `maxLength={200}`
  - Character counter below (`x / 200`)
  - Same styling as the Amount input
- Include `extraText` in `handleUpdate`'s `onUpdate({ template, amount, unit, extraText })`

### 3. `SafetyLabelScreen.tsx`

- Rename `_setPreviewExtra` → `setPreviewExtra` (remove unused-variable prefix)
- Pass `initialExtraText={previewExtra}` to `PrintDetailsModal`
- In `handlePrintDetailsUpdate`, add `setPreviewExtra(details.extraText)`

No changes needed to `LabelPreview` or `LabelInspectModal` — `extraText` already flows through both.

---

## Data Flow

```
User types in TextInput
  → extraText state in PrintDetailsModal
  → onUpdate({ ..., extraText }) on Update press
  → handlePrintDetailsUpdate sets previewExtra
  → LabelPreview receives extraText={previewExtra}
  → renders italic line on label body
  → LabelInspectModal also receives previewExtra (already wired)
```

---

## Constraints

- `extraText` is display-only on the label — not sent to any API
- Max 200 characters (enforced by `maxLength` and the counter)
- No validation required — field is optional
- Character counter shown below the input, right-aligned
