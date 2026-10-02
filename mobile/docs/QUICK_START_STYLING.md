# Quick Start: Styling Components

## TL;DR - The Essentials

### Import at the top of your component file:
```typescript
import { useTheme } from '@/theme';
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/components/home/common.styles';
```

### Basic styling template:
```typescript
export default function MyComponent() {
  const { theme, isDark } = useTheme();

  const styles = StyleSheet.create({
    container: {
      paddingHorizontal: SPACING.lg,        // 14px
      paddingVertical: SPACING.xl,          // 16px
      backgroundColor: theme.background.card,
      borderRadius: BORDER_RADIUS.lg,       // 12px
      borderWidth: 1,
      borderColor: theme.border.primary,
    },
    heading: {
      ...TYPOGRAPHY.heading3,               // 18px, 900 weight
      color: theme.text.primary,
      marginBottom: SPACING.md,              // 12px
    },
    body: {
      ...TYPOGRAPHY.body,                   // 14px, 500 weight
      color: theme.text.secondary,
      lineHeight: 1.6,
    },
  });

  return (
    <View style={styles.container}>
      <CustomText style={styles.heading}>Title</CustomText>
      <CustomText style={styles.body}>Body text</CustomText>
    </View>
  );
}
```

## Common Spacing Values

```
SPACING.xs  = 4px     (tiny gaps)
SPACING.sm  = 8px     (small gaps between items)
SPACING.md  = 12px    (medium gaps)
SPACING.lg  = 14px    (container horizontal margin)
SPACING.xl  = 16px    (card padding)
SPACING.xxl = 18px    (section padding)
```

## Common Font Sizes

```
Heading 3:  18px (900 weight)
Subtitle:   14px (700 weight)
Body:       14px (500 weight)
Caption:    12px (500 weight)
```

## Color Quick Reference

```typescript
// Use theme colors for most things:
theme.background.primary      // Main background
theme.background.card         // Card background
theme.text.primary            // Headings/primary text
theme.text.secondary          // Secondary text
theme.border.primary          // Borders

// Use hardcoded colors only for brand elements:
'#149B5F'   // Primary green (brand)
'#2DBECD'   // Secondary cyan
'#FFC832'   // Accent yellow
```

## Responsive Design (Mobile vs Tablet)

### If you need different layouts:
```typescript
// src/screens/new/MyScreen.tsx
import { Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function MyScreen() {
  return isTablet ? <MyScreenTablet /> : <MyScreenMobile />;
}

// src/screens/new/MyScreen.mobile.tsx
export default function MyScreenMobile() {
  return (
    <View style={{ paddingHorizontal: SPACING.lg }}>
      {/* Mobile layout here */}
    </View>
  );
}

// src/screens/new/MyScreen.tablet.tsx
export default function MyScreenTablet() {
  return (
    <View style={{ paddingHorizontal: 22 }}>
      {/* Tablet layout here */}
    </View>
  );
}
```

## Common Mistakes to Avoid

### ❌ DON'T - Hardcoded values
```typescript
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,      // Hardcoded!
    fontSize: 14,               // Hardcoded!
    backgroundColor: '#FFFFFF', // Hardcoded!
  },
});
```

### ✅ DO - Use constants and theme
```typescript
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    backgroundColor: theme.background.primary,
  },
  text: {
    ...TYPOGRAPHY.body,
    color: theme.text.primary,
  },
});
```

### ❌ DON'T - Tiny fonts (hard to read)
```typescript
fontSize: 11,  // Too small!
fontSize: 12,  // Minimum, only for captions
```

### ✅ DO - Readable font sizes
```typescript
// Body text minimum
fontSize: 14,

// Captions
fontSize: 12,

// Headings
fontSize: 18,
```

### ❌ DON'T - Poor color contrast
```typescript
// Light gray text on light background
color: '#CCCCCC',
backgroundColor: '#F5F5F5',
```

### ✅ DO - High contrast
```typescript
// Use theme colors which are pre-tested
color: theme.text.primary,        // High contrast
backgroundColor: theme.background.primary,
```

## Test Your Component

Checklist before committing:

```
[ ] Can read all text easily?
[ ] Spacing looks consistent?
[ ] Colors look good in both light/dark mode?
[ ] Touch targets are 44x44 or larger?
[ ] No text is cut off?
[ ] Aligns with other components?
[ ] Uses SPACING constants (not hardcoded)?
[ ] Uses TYPOGRAPHY or BORDER_RADIUS constants?
```

## Need Help?

### Text not visible?
→ Increase `fontSize` by 2-3px  
→ Change `fontWeight` to '700' or '800'  
→ Check that `color` contrasts with background

### Spacing issues?
→ Use `SPACING.lg` for horizontal margins  
→ Use `SPACING.xl` for card padding  
→ Use `SPACING.md` for gaps between items

### Layout broken?
→ Check `flexDirection` (row or column?)  
→ Verify `justifyContent` alignment  
→ Check parent container sizing

### Colors weird?
→ Always use `theme` colors from hook  
→ Test in dark mode too  
→ Check WCAG contrast ratio (min 4.5:1)

## See Full Docs

- Architecture: `MOBILE_ARCHITECTURE.md`
- All changes: `UX_FIXES_SUMMARY.md`
- Detailed reference: `STYLING_REFERENCE.md`
