# Styling Reference Guide

## Quick Reference for Component Styling

### Font Sizes
```
Heading 1:  28px (fw: 900)
Heading 2:  22px (fw: 900)
Heading 3:  18px (fw: 900)
Heading 4:  15px (fw: 800)
Subtitle:   14px (fw: 700)
Body:       14px (fw: 500)
Caption:    12px (fw: 500)
Button:     14px (fw: 700)
```

### Common Padding/Margins
```
Mobile Container:   14px (horizontal)
Card Padding:       14-16px (horizontal), 13-14px (vertical)
Section Gap:        18-22px (vertical)
Component Gap:      8-12px
Border Radius:      10-14px (md-lg)
```

### Color Palette

#### Brand Colors
- Primary Green:    `#149B5F` (Merck brand)
- Secondary Cyan:   `#2DBECD`
- Accent Yellow:    `#FFC832`
- Orange:           `#B07B00`
- Dark Green:       `#0B5A37` (for text on green bg)

#### Theme-based Colors (use from context)
```typescript
theme.background.primary      // Main background
theme.background.secondary    // Muted/card background
theme.background.card         // Card background
theme.text.primary            // Primary text (800-900 fw)
theme.text.secondary          // Secondary text (500-600 fw)
theme.text.tertiary           // Tertiary text (400-500 fw)
theme.border.primary          // Borders
```

## Component Styling Patterns

### Card Component
```typescript
const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.background.card,
    borderWidth: 1,
    borderColor: theme.border.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
});
```

### Header Component
```typescript
const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: theme.background.primary,
    borderBottomWidth: 1,
    borderBottomColor: theme.border.primary,
  },
});
```

### Text Components
```typescript
// Heading
fontSize: 18,
fontWeight: '900',
letterSpacing: -0.3,
lineHeight: 1.3,
color: theme.text.primary,

// Body
fontSize: 14,
fontWeight: '500',
lineHeight: 1.6,
color: theme.text.primary,

// Caption
fontSize: 12,
fontWeight: '500',
lineHeight: 1.5,
color: theme.text.secondary,
```

### Icon Sizing
```
Small:    16x16
Medium:   18-20x18-20
Large:    24-26x24-26
```

### Button Styling
```typescript
// Primary Button
paddingVertical: 11,
paddingHorizontal: 16,
borderRadius: 24,
backgroundColor: '#149B5F',
fontSize: 14,
fontWeight: '700',

// Outline Button
paddingVertical: 11,
paddingHorizontal: 16,
borderRadius: 24,
borderWidth: 1,
borderColor: '#149B5F',
backgroundColor: 'transparent',
```

## Mobile vs Tablet Adjustments

### Mobile (width < 768)
```typescript
// Screen padding
paddingHorizontal: 14,

// Font sizes (smaller)
headings: 15-18px
body: 13-14px

// Component sizes
buttons: 36-44px
avatars: 32-42px
icons: 16-20px

// Spacing
gapSmall: 8px
gapMedium: 12px
gapLarge: 18px
```

### Tablet (width >= 768)
```typescript
// Screen padding
paddingHorizontal: 22,

// Font sizes (larger)
headings: 18-28px
body: 14-15px

// Component sizes
buttons: 44-56px
avatars: 42-84px
icons: 20-26px

// Spacing
gapSmall: 10px
gapMedium: 14px
gapLarge: 22px
```

## Contrast & Accessibility

### Text Contrast
- Primary text (dark): `#1A1A1A` or theme.text.primary
- Secondary text: `#666666` or theme.text.secondary
- On green bg (#149B5F): `#FFFFFF` or `#0B5A37`
- Minimum contrast ratio: 4.5:1

### Component Touch Targets
- Minimum size: 44x44 (iOS/Android standard)
- Padding around interactive elements: 8-12px

### Color Accessibility
- Don't rely on color alone for information
- Use icons or text labels alongside colors
- Ensure sufficient brightness difference

## Dark Mode Considerations

### Using useTheme hook
```typescript
const { theme, isDark } = useTheme();

// Conditional colors
const bgColor = isDark 
  ? 'rgba(20,155,95,.16)' 
  : '#ECFDF3';
```

### Dark Mode Colors
- Backgrounds: Darker, less saturation
- Text: Lighter/brighter for readability
- Borders: More subtle (higher opacity)
- Accent colors: Same, but ensure contrast

## Common Adjustments

### Text Not Visible?
1. Increase fontSize by 1-2px
2. Increase fontWeight (600 → 700, 700 → 800)
3. Check color contrast (should be > 4.5:1)
4. Verify numberOfLines prop is removed if not needed

### Spacing Issues?
1. Check parent alignment: `alignItems`, `justifyContent`
2. Verify paddingHorizontal: should be 14px (mobile) or 22px (tablet)
3. Check gaps between elements: 8px (small), 12px (medium), 18px (large)
4. Ensure no conflicting margins

### Components Overlapping?
1. Add gap or margin between elements
2. Check flexDirection (row vs column)
3. Verify overflow: 'hidden' not set on parent
4. Check absolute positioning

### Color Issues?
1. For brand elements: use hardcoded brand colors
2. For theme elements: use theme from useTheme()
3. Ensure isDark check when needed
4. Test both light and dark modes

## Component Checklist

When styling a new component:

- [ ] Font sizes are readable (min 12px body, 14px body)
- [ ] Text color has sufficient contrast
- [ ] Padding/margin follows guidelines (14px mobile, 22px tablet)
- [ ] Border radius is 10-14px
- [ ] Icons are properly sized (16-26px)
- [ ] Touch targets are 44x44 minimum
- [ ] Card styling uses theme colors
- [ ] Heading uses 900 fontweight
- [ ] Body text uses 500 fontweight
- [ ] Caption uses 500 fontweight with secondary color
- [ ] No hardcoded hex colors (use theme)
- [ ] Mobile and tablet layouts are considered
- [ ] Dark mode is tested

## Code Examples

### Good Card Styling
```typescript
const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.background.card,
    borderWidth: 1,
    borderColor: theme.border.primary,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  title: {
    fontSize: 15,
    fontWeight: '800',
    color: theme.text.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 1.6,
    color: theme.text.secondary,
  },
});
```

### Good Responsive Layout
```typescript
const { width } = Dimensions.get('window');
const isTablet = width >= 768;

export default function MyScreen() {
  return isTablet ? <TabletLayout /> : <MobileLayout />;
}

// Mobile Layout
function MobileLayout() {
  return (
    <View style={{ paddingHorizontal: 14 }}>
      {/* Content */}
    </View>
  );
}

// Tablet Layout
function TabletLayout() {
  return (
    <View style={{ paddingHorizontal: 22 }}>
      {/* Content */}
    </View>
  );
}
```

### Good Font Styling
```typescript
const styles = StyleSheet.create({
  heading: {
    fontSize: 18,
    fontWeight: '900',      // Bold heading
    letterSpacing: -0.3,    // Tighter spacing
    lineHeight: 1.3,        // Proper line height
    color: theme.text.primary,
  },
  body: {
    fontSize: 14,
    fontWeight: '500',      // Regular weight
    lineHeight: 1.6,        // More line height for readability
    color: theme.text.primary,
  },
  caption: {
    fontSize: 12,
    fontWeight: '500',
    lineHeight: 1.5,
    color: theme.text.secondary,
  },
});
```

## Performance Tips

1. **Memoize components** if receiving many prop changes
2. **Use Dimensions hook** only at component mount
3. **Avoid inline styles** - move to StyleSheet
4. **Use FlatList/FlashList** for large lists
5. **Test with Hermes profiler** for performance issues

## Resources

- Theme colors: `src/theme/ThemeContext.tsx`
- Common styles: `src/components/home/common.styles.ts`
- Font system: `src/utils/fonts.ts`
- Icon components: `src/components/icons/`
