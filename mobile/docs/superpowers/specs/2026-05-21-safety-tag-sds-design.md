# Safety Tag & Full SDS Viewer — Design Spec

**Date:** 2026-05-21  
**Branch:** feature/migration  
**Author:** Claude Code

---

## Overview

Extend `SafetyLabelScreen` with two major capabilities that mirror the Ionic app:

1. **Safety Tag generation** — a barcode-bearing printable tag (DataMatrix + article info + GHS pictograms + hazard text + legal disclaimer footer) with a one-time disclaimer gate.
2. **Full SDS Viewer** — an interactive grid of 16 numbered section tiles that open a scrollable modal displaying the complete Safety Data Sheet data for the selected section, with prev/next navigation between sections.

Additionally, fix the hardcoded `country: 'US'` in `SafetyLabelScreen` to use the real device region from `RegionContext`.

---

## Architecture

### New files to create

```
src/
├── components/
│   ├── modals/
│   │   └── SafetyTagDisclaimerModal.tsx     # One-time disclaimer gate
│   └── sds/
│       ├── SDSSectionGrid.tsx               # 4-column tile grid (16 sections)
│       ├── SDSSectionModal.tsx              # Full-screen modal: dropdown + prev/next + section content
│       └── sections/
│           ├── SDSSection1.tsx              # Product Identification
│           ├── SDSSection2.tsx              # Hazard Identification (already partially in screen)
│           ├── SDSSection3.tsx              # Composition / Info on Ingredients
│           ├── SDSSection4.tsx              # First Aid Measures
│           ├── SDSSection5.tsx              # Fire-Fighting Measures
│           ├── SDSSection6.tsx              # Accidental Release Measures
│           ├── SDSSection7.tsx              # Handling and Storage
│           ├── SDSSection8.tsx              # Exposure Controls / Personal Protection
│           ├── SDSSection9.tsx              # Physical and Chemical Properties
│           ├── SDSSection10.tsx             # Stability and Reactivity
│           ├── SDSSection11.tsx             # Toxicological Information
│           ├── SDSSection12.tsx             # Ecological Information
│           ├── SDSSection13.tsx             # Disposal Considerations
│           ├── SDSSection14.tsx             # Transport Information
│           ├── SDSSection15.tsx             # Regulatory Information
│           └── SDSSection16.tsx             # Other Information
```

### Files to modify

| File                                    | Change                                                                                      |
| --------------------------------------- | ------------------------------------------------------------------------------------------- |
| `src/screens/SafetyLabelScreen.tsx`     | Add SafetyTag tab/section, integrate DisclaimerModal, SDSSectionGrid, fix hardcoded country |
| `src/services/api/atlasSDSService.ts`   | Add strongly-typed interfaces for sections 4–16                                             |
| `src/localization/translations/en.json` | Add sds section titles, disclaimer keys, safety tag keys                                    |
| `src/localization/translations/fr.json` | Same keys in French                                                                         |
| `src/localization/translations/ar.json` | Same keys in Arabic                                                                         |

---

## Feature 1: Safety Tag Disclaimer Modal

### `src/components/modals/SafetyTagDisclaimerModal.tsx`

**Behaviour:**

- Shown once per app install (AsyncStorage key `@safety_tag_disclaimer_shown`)
- If shown and user taps OK, stores `true` and never shows again
- Modal is presented before the safety tag content is displayed
- Single "OK" button — no dismiss-on-backdrop, no cancel

**Props:**

```typescript
interface SafetyTagDisclaimerModalProps {
  visible: boolean;
  onAccept: () => void;
}
```

**Content:**

- Title: `t('safetyTag.disclaimerTitle')` → "Safety Tag"
- Body: `t('safetyTag.disclaimerBody')` → "This feature is only offered for the convenience of our customers. We take no responsibility for the correctness or completeness of the information. Our customers are responsible for ensuring the printed tag meets all regulatory requirements. The safety tag is not a replacement for the original label."
- Button: `t('common.ok')` → "OK"

**AsyncStorage integration in `SafetyLabelScreen`:**

```typescript
const DISCLAIMER_KEY = '@safety_tag_disclaimer_shown';

// on mount:
const [disclaimerDone, setDisclaimerDone] = useState(false);
useEffect(() => {
  AsyncStorage.getItem(DISCLAIMER_KEY).then(v =>
    setDisclaimerDone(v === 'true'),
  );
}, []);

const handleDisclaimerAccept = async () => {
  await AsyncStorage.setItem(DISCLAIMER_KEY, 'true');
  setDisclaimerDone(true);
};
```

---

## Feature 2: Safety Tag Content

The Safety Tag section is added as a collapsible card **below** the existing SDS data divider in `SafetyLabelScreen`, only visible after disclaimer is accepted.

### Visual layout (matching Ionic)

```
┌─────────────────────────────────────────┐
│  ██ DataMatrix barcode (left)           │
│     Article Name          (right)       │
│     Article No.                         │
│     CAS No.                             │
│     [Amount] [Unit]                     │
├─────────────────────────────────────────┤
│  ⬡ ⬡ ⬡  GHS pictograms (up to 9, 3×3) │
├─────────────────────────────────────────┤
│  SIGNAL WORD                            │
│  Hazard statements...                   │
│  Precautionary: Prevention / Response   │
│  / Storage / Disposal                   │
│  Other hazards...                       │
├─────────────────────────────────────────┤
│  The safety tag is not a replacement    │
│  of the original label.     (footer)    │
└─────────────────────────────────────────┘
```

### DataMatrix barcode

Use `react-native-svg` to render a DataMatrix barcode. The Ionic app uses `ngx-barcode6` with `bcFormat="DATA_MATRIX"`. In React Native, encode `articleNumber` using a pure-JS DataMatrix encoder.

**Recommended package:** `@bam.tech/react-native-judo-data-matrix` or render via `react-native-svg` with a custom DataMatrix encoder module.  
**Fallback if no package available:** Show a styled rectangle with the article number as text + "DataMatrix" label (consistent with current QR code placeholder approach).

### GHS Pictograms in safety tag

Use `hazardPictogramIcons` array from `sds.section_two`. Display up to 9 in a 3×3 grid. Each pictogram is a base64-encoded image from the API — use `<Image>` with `uri` source.

```typescript
// If base64 icons available:
<Image source={{ uri: `data:image/png;base64,${iconBase64}` }} style={{ width: 48, height: 48 }} />
// Fall back to GHSPictogram SVG component (already in screen) if base64 not present:
<GHSPictogram code={code} size={48} />
```

### Hazard text content

From `sds.section_two`:

- `signalWord[0]` — displayed in bold caps
- `hazardStatements` — bulleted list
- `hazardStatementsSec` (if present) — secondary hazard statements
- `precautionaryStatements.prevention` — "Prevention" subsection
- `precautionaryStatements.response` — "Response" subsection
- `precautionaryStatements.storage` — "Storage" subsection
- `precautionaryStatements.disposal` — "Disposal" subsection
- `otherHazards` (if present on section_two) — Other hazards subsection

---

## Feature 3: SDS Section Grid

### `src/components/sds/SDSSectionGrid.tsx`

**Purpose:** 4-column grid of 16 numbered tiles. Tapping a tile opens `SDSSectionModal` at that section.

**Props:**

```typescript
interface SDSSectionGridProps {
  sds: SafetyDataSheet;
  isDark: boolean;
  onSectionPress: (sectionIndex: number) => void; // 0-based (0=section1, 15=section16)
}
```

**Tile structure:**

- Numbered circle (Merck purple `#590099`, white number text)
- Section title below (translated, abbreviated if needed)
- Background: card color (theme-aware)
- Border radius: 12

**Section color mapping (cycling 6 colors from Ionic):**

| Section   | Color         | Hex       |
| --------- | ------------- | --------- |
| 1, 7, 13  | Amaranth      | `#E61E50` |
| 2, 8, 14  | Sunglow       | `#FFC832` |
| 3, 9, 15  | Android Green | `#A5CD50` |
| 4, 10, 16 | Persian Blue  | `#005CA9` |
| 5, 11     | Rose          | `#EB3C96` |
| 6, 12     | Strong Blue   | `#29B8CD` |

**Layout:** `FlatList` with `numColumns={4}`, each tile is `(screenWidth - 32 - 3*8) / 4` wide, square aspect.

**Render location:** Inside `SafetyLabelScreen`, below the existing SDS divider, replacing the current sections 1-3 inline display. The full viewer is triggered from the grid; the screen keeps the hazard summary cards.

**Integration in SafetyLabelScreen:**

```tsx
{/* Existing: hazard summary cards (sections 1-3) remain as-is above the divider */}

{/* NEW: Full SDS section grid */}
<View style={{ marginTop: 16 }}>
  <CustomText style={sectionGridTitle}>{t('label.viewFullSDS')}</CustomText>
  <SDSSectionGrid
    sds={sds}
    isDark={isDark}
    onSectionPress={(idx) => {
      setActiveSectionIdx(idx);
      setShowSDSModal(true);
    }}
  />
</View>

<SDSSectionModal
  visible={showSDSModal}
  sds={sds}
  initialSection={activeSectionIdx}
  isDark={isDark}
  onClose={() => setShowSDSModal(false)}
/>
```

---

## Feature 4: SDS Section Modal

### `src/components/sds/SDSSectionModal.tsx`

**Behaviour:**

- Full-screen modal (or bottom sheet stretching 95% height)
- Header: section picker dropdown (shows "Section N — Title") + close button
- Footer: `← Previous` / `Next →` arrows; disabled at bounds
- Content: scrollable `SDSSectionN` component for the active section
- Swipe gesture between sections (Reanimated 3, not Animated)

**Props:**

```typescript
interface SDSSectionModalProps {
  visible: boolean;
  sds: SafetyDataSheet;
  initialSection: number; // 0-based
  isDark: boolean;
  onClose: () => void;
}
```

**Internal state:**

```typescript
const [activeSection, setActiveSection] = useState(initialSection);
const [showPicker, setShowPicker] = useState(false);
```

**Layout:**

```
┌──────────────────────────────────────────┐
│  ✕   [Section 1 — Product Identification ▼]  │  ← header
├──────────────────────────────────────────┤
│                                          │
│  <SDSSectionN data={sds.section_N} />   │  ← scrollable content area
│                                          │
├──────────────────────────────────────────┤
│  ← Previous          Next →             │  ← footer navigation
└──────────────────────────────────────────┘
```

**Section routing:**

```typescript
const SECTION_KEYS = [
  'section_one',
  'section_two',
  'section_three',
  'section_four',
  'section_five',
  'section_six',
  'section_seven',
  'section_eight',
  'section_nine',
  'section_ten',
  'section_eleven',
  'section_twelve',
  'section_thirteen',
  'section_fourteen',
  'section_fifteen',
  'section_sixteen',
] as const;

const SECTION_COMPONENTS = [
  SDSSection1,
  SDSSection2,
  SDSSection3,
  SDSSection4,
  SDSSection5,
  SDSSection6,
  SDSSection7,
  SDSSection8,
  SDSSection9,
  SDSSection10,
  SDSSection11,
  SDSSection12,
  SDSSection13,
  SDSSection14,
  SDSSection15,
  SDSSection16,
];

const SectionComponent = SECTION_COMPONENTS[activeSection];
const sectionData = sds[SECTION_KEYS[activeSection]];

<SectionComponent data={sectionData} isDark={isDark} />;
```

---

## Feature 5: 16 SDS Section Components

All section components share the same prop interface and use shared sub-components `SDSInfoRow` and `SDSBulletList`:

```typescript
interface SDSSectionProps {
  data: Record<string, any> | undefined | null;
  isDark: boolean;
}
```

**Shared sub-components (internal to `SDSSectionModal.tsx` or extracted):**

- `SDSInfoRow` — `{ label, value }` key-value row with divider
- `SDSBulletList` — `{ items: string[] }` bulleted list
- `SDSSubSection` — `{ title, children }` subsection with lighter header

### Section-by-section data mapping

**Section 1 — Product Identification**
Fields: `productName`, `articleName`, `articleNumber`, `cas`, `synonyms[]`, `identifiedUses[]`, `manufacturerName`, `manufacturerAddress`, `emergencyPhone`, `productCode`

**Section 2 — Hazard Identification**
Fields: `hazardPictograms[]`, `hazardPictogramIcons[]`, `signalWord[]`, `hazardClassification[]`, `hazardStatements[]`, `hazardStatementsSec[]`, `precautionaryStatements.{prevention,response,storage,disposal}[]`, `emergencySummary[]`, `otherHazards[]`
Note: Most of this is already rendered in `SafetyLabelScreen` — the section component just wraps it in the standard layout.

**Section 3 — Composition / Information on Ingredients**
Fields: `formula`, `molar`, `compositions[].{componentName, casNumber, percentage, einecs}[]`

**Section 4 — First Aid Measures**
Fields: `generalInstructions[]`, `eyeContact[]`, `skinContact[]`, `inhalation[]`, `ingestion[]`, `protectionForFirstAiders[]`, `symptomsEffects[]`, `immediateAttentionRequired`

**Section 5 — Fire-Fighting Measures**
Fields: `suitableExtinguishingMedia[]`, `unsuitableExtinguishingMedia[]`, `hazardousCombustionProducts[]`, `specialEquipment[]`, `furtherInformation[]`

**Section 6 — Accidental Release Measures**
Fields: `personalPrecautions[]`, `environmentalPrecautions[]`, `methodsCleanup[]`, `preventiveMeasures[]`

**Section 7 — Handling and Storage**
Fields: `handlingPrecautions[]`, `storageConditions[]`, `incompatibleMaterials[]`, `storageTemperature`, `storageClass`

**Section 8 — Exposure Controls / Personal Protection**
Fields: `componentExposureLimits[].{component, twaPpm, twaMgM3, stelPpm, stelMgM3}`, `engineeringMeasures[]`, `respiratoryProtection[]`, `handProtection[]`, `eyeFaceProtection[]`, `skinBodyProtection[]`, `hygieneRecommendations[]`

**Section 9 — Physical and Chemical Properties**
Fields: `form`, `color`, `odor`, `ph`, `meltingPoint`, `boilingPoint`, `flashPoint`, `evaporationRate`, `flammability`, `upperExplosiveLimit`, `lowerExplosiveLimit`, `vapourPressure`, `vapourDensity`, `relativeDensity`, `waterSolubility`, `autoIgnitionTemperature`, `decompositionTemperature`, `viscosity`, `logPow`, `otherInformation[]`

**Section 10 — Stability and Reactivity**
Fields: `reactivity[]`, `chemicalStability[]`, `hazardousPolymerization`, `conditionsToAvoid[]`, `incompatibleMaterials[]`, `hazardousDecompositionProducts[]`

**Section 11 — Toxicological Information**
Fields: `routesOfExposure[]`, `acuteToxicity[].{routeOfAdministration, species, value, unit}`, `skinCorrosionIrritation[]`, `seriousEyeDamage[]`, `respiratorySensitization[]`, `skinSensitization[]`, `germCellMutagenicity[]`, `carcinogenicity[]`, `reproductiveToxicity[]`, `singleExposure[]`, `repeatedExposure[]`, `aspirationHazard[]`, `additionalInformation[]`

**Section 12 — Ecological Information**
Fields: `toxicity[].{organism, value, unit, duration}`, `persistenceDegradability[]`, `bioaccumulativePotential[]`, `mobilityInSoil[]`, `otherAdverseEffects[]`

**Section 13 — Disposal Considerations**
Fields: `wasteDisposalMethods[]`, `contamPackageDisposal[]`, `additionalInformation[]`

**Section 14 — Transport Information** (API returns `any` — may be nested object)
Fields: `un`, `properShippingName`, `transportHazardClass`, `packingGroup`, `environmentalHazards`, `additionalInfo[]`
Note: Render flexibly — iterate keys if structure is unknown, skip null values.

**Section 15 — Regulatory Information**
Fields: `safetyHealthEnvironmentalRegulations[]`, `chemicalSafetyAssessment`, `nationalRegulations[]`, `euRegulations[]`

**Section 16 — Other Information** (API returns `any` — may be nested object)
Fields: `preparationRevision`, `revisedSections`, `abbreviations[]`, `keyOrLegend[]`, `references[]`, `disclaimer[]`
Note: Render flexibly — iterate keys if structure is unknown.

### Generic section renderer for unknown shapes (Sections 14, 16)

```typescript
const GenericSectionRenderer: React.FC<{ data: any; isDark: boolean }> = ({
  data,
  isDark,
}) => {
  if (!data || typeof data !== 'object') return null;
  return (
    <>
      {Object.entries(data).map(([key, value]) => {
        if (value === null || value === undefined) return null;
        if (Array.isArray(value) && value.length === 0) return null;
        return (
          <SDSInfoRow
            key={key}
            label={formatFieldLabel(key)}
            value={Array.isArray(value) ? value.join('\n') : String(value)}
          />
        );
      })}
    </>
  );
};
```

---

## Feature 6: Fix Hardcoded Country in SafetyLabelScreen

**Current code** (`SafetyLabelScreen.tsx:779`):

```typescript
const {
  data: sds,
  isLoading,
  isError,
  refetch,
} = useSDS({
  materialNumber: article.materialNumber,
  system: 'NEX',
  country: 'US',
  language: 'EN',
});
```

**Fix:**

```typescript
import { useRegion } from '@context/RegionContext';
import { useLocaleStore } from '@/stores/localeStore';

const { region } = useRegion();
const language = useLocaleStore(s => s.language).toUpperCase();

// Map region to SDS validity area (matches Ionic env.validityArea logic)
const country = region === 'US' ? 'US' : 'EU';

const {
  data: sds,
  isLoading,
  isError,
  refetch,
} = useSDS({
  materialNumber: article.materialNumber,
  system: 'NEX',
  country,
  language,
});
```

---

## Translation Keys

### Keys to add to `en.json`

```json
{
  "safetyTag": {
    "disclaimerTitle": "Safety Tag",
    "disclaimerBody": "This feature is only offered for the convenience of our customers. We take no responsibility for the correctness or completeness of the information. Our customers are responsible for ensuring the printed tag meets all regulatory requirements. The safety tag is not a replacement for the original label.",
    "disclaimer": "The safety tag is not a replacement of the original label.",
    "sectionTitle": "Safety Tag",
    "generate": "Generate Safety Tag",
    "dataMatrix": "DataMatrix"
  },
  "sds": {
    "fullSDS": "Full Safety Data Sheet",
    "viewAllSections": "View All Sections",
    "section": "Section {{number}}",
    "previousSection": "Previous",
    "nextSection": "Next",
    "section1": "Product Identification",
    "section2": "Hazard Identification",
    "section3": "Composition / Ingredients",
    "section4": "First Aid Measures",
    "section5": "Fire-Fighting Measures",
    "section6": "Accidental Release Measures",
    "section7": "Handling and Storage",
    "section8": "Exposure Controls",
    "section9": "Physical & Chemical Properties",
    "section10": "Stability and Reactivity",
    "section11": "Toxicological Information",
    "section12": "Ecological Information",
    "section13": "Disposal Considerations",
    "section14": "Transport Information",
    "section15": "Regulatory Information",
    "section16": "Other Information",
    "noData": "No data available for this section.",
    "sectionN": "Section {{n}}"
  }
}
```

Same structure in `fr.json` (translated to French) and `ar.json` (translated to Arabic).

---

## Data Types (atlasSDSService.ts additions)

Replace the loose `{ [key: string]: any }` types for sections 4–13 with typed interfaces. Sections 14 and 16 stay as `any` since the API structure varies. Example for section 4:

```typescript
export interface ArticleSectionFour {
  generalInstructions?: string[];
  eyeContact?: string[];
  skinContact?: string[];
  inhalation?: string[];
  ingestion?: string[];
  protectionForFirstAiders?: string[];
  symptomsEffects?: string[];
  immediateAttentionRequired?: string;
}

// Update SafetyDataSheet:
section_four: ArticleSectionFour;
```

Sections 1, 2, 3 already have named interfaces. Add `ArticleSectionFour` through `ArticleSectionFifteen` following the same pattern.

---

## Implementation Order

Build in this sequence to avoid blocked dependencies:

1. **Translation keys** — add to all 3 locale files (en/fr/ar). No code dependencies.
2. **atlasSDSService types** — add typed interfaces for sections 4–15. No UI dependencies.
3. **SafetyTagDisclaimerModal** — standalone modal, no SDS data needed.
4. **SDSInfoRow + SDSBulletList + SDSSubSection shared components** — pure display, no SDS data needed.
5. **SDSSection1–SDSSection16** — each uses shared sub-components + sds data types.
6. **SDSSectionGrid** — uses section titles from translations.
7. **SDSSectionModal** — uses SDSSectionGrid tiles result + section components.
8. **SafetyLabelScreen updates** — integrate all above: disclaimer, grid, modal, region fix.

---

## Testing Checklist

- [ ] First app launch: disclaimer modal appears before safety tag content
- [ ] Accept disclaimer: stored in AsyncStorage, never shown again on next launch
- [ ] Safety tag renders: barcode area, product info, GHS pictograms (if present), hazard text, disclaimer footer
- [ ] SDS grid shows 16 tiles in 4-column layout with correct section colors
- [ ] Tapping any tile opens SDSSectionModal at that section
- [ ] Dropdown in modal lets user jump to any section
- [ ] Previous/Next arrows navigate between sections; disabled at bounds
- [ ] Section data renders: for sections with array fields, bullet lists show; for sections with key-value fields, info rows show; for empty sections, "no data" message shows
- [ ] Sections 14 and 16 render gracefully even with unknown structure
- [ ] Country fix: US device fetches `country: 'US'` SDS, non-US device fetches `country: 'EU'`
- [ ] Language reflects device/user preference (EN/FR/AR)
- [ ] RTL layout correct for Arabic throughout modal and grid
- [ ] Dark mode: all tiles, modal header, content, footer render correctly
- [ ] Navigation: modal can be dismissed, returns to SafetyLabelScreen cleanly

---

## Out of Scope (future PRs)

- Actual PDF generation / print workflow (currently shows "coming soon" alert — keep as-is)
- Real DataMatrix barcode encoding (use placeholder rectangle for now — consistent with existing QR code placeholder)
- Barcode scanning from SearchScreen
- Offline SDS caching / prefetch
