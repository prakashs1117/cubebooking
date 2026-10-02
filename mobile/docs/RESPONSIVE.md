# Responsive Layout — Mobile vs Tablet

## The Three Building Blocks

| Tool               | File                                       | Use when                                    |
| ------------------ | ------------------------------------------ | ------------------------------------------- |
| `BREAKPOINTS`      | `src/config/breakpoints.ts`                | You need the raw pixel threshold (rare)     |
| `useDeviceType()`  | `src/hooks/useDeviceType.ts`               | You need device info inside a component     |
| `<ResponsiveView>` | `src/components/common/ResponsiveView.tsx` | You want to render different JSX per device |

Breakpoints:

- **phone** — width < 768 pt
- **tablet** — 768 pt ≤ width < 1024 pt (all iPads, large Android tablets)
- **desktop** — width ≥ 1024 pt (split-view / external display edge case)

---

## Pattern 1 — `useDeviceType` hook (one component, tweaked styles)

Use this when the layout is essentially the same but a few dimensions, font sizes, or column counts differ.

```tsx
import { useDeviceType } from '@hooks/useDeviceType';

const MyComponent: React.FC = () => {
  const { isTablet, width } = useDeviceType();

  const cardWidth = isTablet ? Math.round((width - 40) / 3) : width * 0.9;

  return (
    <View style={{ width: cardWidth }}>
      <Text style={{ fontSize: isTablet ? 18 : 14 }}>Hello</Text>
    </View>
  );
};
```

**Rules:**

- Never put `isTablet` in the static `StyleSheet.create({})` — it runs once at module load, before the hook can be called.
- Apply dynamic values as **inline styles** or compute them inside the component body.
- Never import `Dimensions` and hard-code `>= 768` — use the hook so the value stays in sync with orientation changes.

---

## Pattern 2 — `<ResponsiveView>` (completely different layouts)

Use this when phone and tablet UIs are distinct enough to deserve separate files.

### Step 1 — Create the folder

```
src/screens/MyScreen/
  index.tsx               ← thin selector + shared state
  MyScreen.phone.tsx      ← phone JSX
  MyScreen.tablet.tsx     ← tablet JSX
```

### Step 2 — Write the phone and tablet components

They are plain React components. Accept shared data as props; call their own hooks for anything local.

```tsx
// MyScreen.phone.tsx
interface Props { data: string[] }
const MyScreenPhone: React.FC<Props> = ({ data }) => (
  <FlatList data={data} numColumns={1} ... />
);
export default MyScreenPhone;

// MyScreen.tablet.tsx
interface Props { data: string[] }
const MyScreenTablet: React.FC<Props> = ({ data }) => (
  <FlatList data={data} numColumns={2} contentContainerStyle={{ paddingHorizontal: 24 }} ... />
);
export default MyScreenTablet;
```

### Step 3 — Write the index

```tsx
// index.tsx
import ResponsiveView from '@components/common/ResponsiveView';
import MyScreenPhone from './MyScreen.phone';
import MyScreenTablet from './MyScreen.tablet';

const MyScreen: React.FC = () => {
  // shared state, queries, memos …
  const data = ['a', 'b', 'c'];

  return (
    <ResponsiveView
      phone={<MyScreenPhone data={data} />}
      tablet={<MyScreenTablet data={data} />}
    />
  );
};
export default MyScreen;
```

Metro resolves `@screens/MyScreen` → `MyScreen/index.tsx` automatically. Navigation imports don't change.

---

## Migrated examples

| File                                                | Pattern used                                                        |
| --------------------------------------------------- | ------------------------------------------------------------------- |
| `src/screens/HomeScreen/`                           | `<ResponsiveView>` — carousel hero (phone) vs compact grid (tablet) |
| `src/screens/EventsListScreen/`                     | `<ResponsiveView>` — 1-column (phone) vs 2-column (tablet)          |
| `src/components/home/HorizontalCardsSection.tsx`    | `useDeviceType` — card width/height computed per device             |
| `src/components/events/UpcomingEventsCarousel.tsx`  | `useDeviceType` — carousel card width computed per device           |
| `src/components/events/FilterSortModal.tsx`         | `useDeviceType` — modal max-width tweak                             |
| `src/components/auth/AuthLayout.tsx`                | `useDeviceType` — two-column layout on tablet                       |
| `src/components/carousel/HomeCarousel.tsx`          | `useDeviceType` — hidden on tablet, different carousel mode         |
| `src/components/onboarding/FirstLaunchCarousel.tsx` | `useDeviceType` — narrower image/text column on tablet              |

---

## Rules to follow

1. **Never write `width >= 768` anywhere.** Import `BREAKPOINTS.TABLET` if you need the number raw, or use `useDeviceType`.

2. **Never call `Dimensions.get` for layout branching.** It is static and ignores orientation changes. `useDeviceType` uses `useWindowDimensions` and rerenders on resize.

3. **Inline-style dynamic values.** `StyleSheet.create` runs at module load (before any hook). If a style property depends on `isTablet` or `width`, compute it inside the component and pass it as an inline style.

   ```tsx
   // WRONG
   const styles = StyleSheet.create({
     card: { width: isTablet ? 300 : 200 }, // ← isTablet is stale at module load
   });

   // CORRECT
   const { isTablet, width } = useDeviceType();
   const cardWidth = isTablet ? 300 : 200;
   // …
   <View style={[styles.card, { width: cardWidth }]} />;
   ```

4. **Use `<ResponsiveView>` for full layout swaps, `useDeviceType` for tweaks.** If the JSX between phone and tablet differs by more than a few props, move them into separate files.

5. **Migrating an existing component** is a one-file change: remove `const isTablet = Dimensions.get(…) >= 768` and add `const { isTablet } = useDeviceType();` inside the component body.
