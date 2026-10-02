# Event Card - Glass Morphism Design

## Overview

Redesigned the EventCard component with a premium glass morphism style inspired by the Merck Pharma Connect reference design, while maintaining compatibility with the existing theme system.

## Design Philosophy

The new design follows modern glass morphism principles:

- ✅ Semi-transparent backgrounds with blur effects
- ✅ Subtle borders with low opacity
- ✅ Elevated shadows for depth
- ✅ Clean, minimalist layout
- ✅ Premium visual appeal
- ✅ Dark/Light theme support

## Key Visual Changes

### 1. Glass Morphism Effect

**Background**:

- Dark theme: `rgba(255, 255, 255, 0.05)` - Subtle white overlay
- Light theme: `rgba(255, 255, 255, 0.9)` - Bright white with transparency

**Borders**:

- Dark theme: `rgba(255, 255, 255, 0.1)` - Subtle white border
- Light theme: `rgba(0, 0, 0, 0.05)` - Subtle dark border

### 2. Layout Redesign

#### Before

```
┌─────────────────────────┐
│     Event Image         │
├─────────────────────────┤
│ Event Title             │
│ 📅 Jun 15 - Jun 17      │
│ 👤 Capacity: 500        │
│ [AI/ML] [Tech] +1       │
└─────────────────────────┘
```

#### After (Glass Style)

```
┌─────────────────────────┐
│     Event Image         │
│     [STATUS BADGE]      │
├─────────────────────────┤
│ JUN 15 - JUN 17         │ ← Small uppercase label
│                         │
│ Event Title             │ ← Bold, prominent
│ Here in two lines       │
│                         │
│ 👤 500  [AI/ML] [Tech] │ ← Bottom row
└─────────────────────────┘
```

### 3. Typography Updates

**Date Label** (New):

- Font size: 9px
- Font weight: 700 (bold)
- Letter spacing: 1.5px (wider)
- Transform: UPPERCASE
- Color: Primary brand color
- Purpose: Clean, minimal date indicator

**Title**:

- Font size: 15px (slightly reduced)
- Font weight: 700 (bold)
- Line height: 19px
- Max lines: 2

**Status Badge**:

- Font size: 10px
- Font weight: 700
- Letter spacing: 1px
- Transform: UPPERCASE
- Border: 1px with 20% white opacity
- Padding: More generous (4px vertical)

**Tags**:

- Font size: 9px
- Font weight: 700
- Letter spacing: 0.5px
- Max width: 90px

### 4. Spacing & Dimensions

**Card**:

- Width: `min(viewportWidth * 0.85, 280px)`
- Height: 280px (increased)
- Border radius: 20px (larger for modern look)
- Padding: 16px (more generous)

**Image**:

- Height: 140px (increased)
- Border radius: Matches card top (20px)

**Shadows**:

- Offset: (0, 8)
- Opacity: 0.15
- Radius: 12px
- Elevation: 8

### 5. Color Scheme Integration

**Primary Colors** (from theme):

- Merck Purple: Used for date labels, tags, status badges
- Background: Adaptive glass effect (dark/light)
- Text: Theme-aware (primary, secondary, tertiary)

**Glass Effects**:

- Dark mode: Purple tint `rgba(79, 49, 144, 0.15)` for placeholders
- Light mode: Traditional light backgrounds
- Borders: Theme-adaptive opacity

## Component Structure

### Layout Hierarchy

```tsx
<TouchableOpacity> (Card Container)
  <View> (Image Container)
    <Image | Placeholder />
    <View> (Status Badge - Glass style)
  </View>

  <View> (Content Container)
    {/* Date Label - Small uppercase */}
    <Text>JUN 15 - JUN 17</Text>

    {/* Title - Bold, prominent */}
    <Heading3>Event Title</Heading3>

    {/* Meta Row - Bottom aligned */}
    <View style="row, space-between">
      <View> (Capacity Badge)
        <Icon />
        <Text>500</Text>
      </View>

      <View> (Tags Row)
        <Tag>AI/ML</Tag>
        <Tag>Tech</Tag>
        <Tag>+1</Tag>
      </View>
    </View>
  </View>
</TouchableOpacity>
```

## Style Properties

### Glass Morphism Card

```typescript
{
  backgroundColor: isDark
    ? 'rgba(255, 255, 255, 0.05)'
    : 'rgba(255, 255, 255, 0.9)',
  borderWidth: 1,
  borderColor: isDark
    ? 'rgba(255, 255, 255, 0.1)'
    : 'rgba(0, 0, 0, 0.05)',
  borderRadius: 20,
  shadowOffset: { width: 0, height: 8 },
  shadowOpacity: 0.15,
  shadowRadius: 12,
  elevation: 8,
}
```

### Status Badge (Enhanced)

```typescript
{
  backgroundColor: getStatusBadgeColor() + 'E6', // 90% opacity
  borderWidth: 1,
  borderColor: 'rgba(255, 255, 255, 0.2)',
  borderRadius: 6,
  paddingHorizontal: 10,
  paddingVertical: 4,
}
```

### Date Label (New Style)

```typescript
{
  fontSize: 9,
  fontWeight: '700',
  letterSpacing: 1.5,
  textTransform: 'uppercase',
  color: theme.button.primary.background,
  marginBottom: 6,
}
```

### Meta Row (Capacity + Tags)

```typescript
{
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexWrap: 'wrap',
  gap: 8,
}
```

### Tags (Glass Style)

```typescript
{
  backgroundColor: isDark
    ? 'rgba(79, 49, 144, 0.2)'  // Purple glass
    : theme.button.primary.background + '15',
  borderWidth: 1,
  borderColor: isDark
    ? 'rgba(79, 49, 144, 0.3)'
    : 'transparent',
  borderRadius: 14,
  paddingHorizontal: 10,
  paddingVertical: 4,
}
```

## Theme Compatibility

### Dark Mode

- Glass background: White overlay at 5% opacity
- Borders: White at 10% opacity
- Image placeholder: Purple glass at 15% opacity
- Tags: Purple glass with border
- Premium, modern appearance

### Light Mode

- Glass background: White at 90% opacity
- Borders: Black at 5% opacity
- Image placeholder: Gray 200
- Tags: Primary color at 15% opacity
- Clean, bright appearance

## Responsive Behavior

### Card Width

- Mobile (small): 85% of viewport, max 280px
- Tablet: Maintains max-width constraint
- Adapts to different screen sizes gracefully

### Content Wrapping

- Tags wrap to new line if needed
- Capacity badge stays on left
- Flexible layout handles various content lengths

## Visual Enhancements

### Image Treatment

- Rounded top corners match card (20px)
- Seamless integration with glass card
- Gradient overlay support (can be added)

### Status Badge

- More prominent with border
- Better contrast on images
- Glass-like appearance with transparency

### Interactive Feedback

- `activeOpacity: 0.9` for subtle press effect
- Maintains glass aesthetic during interaction

## Comparison: Before vs After

### Before (Standard Card)

- Solid background colors
- Standard shadows
- Simple layout
- Basic spacing
- Less visual hierarchy

### After (Glass Morphism)

- Semi-transparent backgrounds
- Enhanced shadows with depth
- Layered visual design
- Premium spacing
- Clear visual hierarchy
- Small uppercase labels
- Bottom-aligned meta info
- Modern, sophisticated look

## Benefits

✅ **Premium Appearance** - Glass morphism creates sophisticated UI
✅ **Better Hierarchy** - Clear visual separation of information
✅ **Modern Design** - Follows current design trends
✅ **Theme Integration** - Works seamlessly with dark/light themes
✅ **Consistent Branding** - Uses Merck purple for key elements
✅ **Improved Readability** - Better spacing and typography
✅ **Professional Look** - Matches high-end event apps
✅ **Backward Compatible** - All fields remain optional

## Reference Implementation

Based on Merck Pharma Connect design:

- Glass morphism effects
- Small uppercase labels
- Bold titles
- Minimal information display
- Clean spacing
- Premium visual treatment

## Performance

- ✅ No performance impact
- ✅ Native shadow rendering
- ✅ Efficient layout calculations
- ✅ Optimized re-renders

## Files Modified

- ✅ `src/components/events/EventCard.tsx`
  - Added glass morphism backgrounds
  - Updated typography
  - Redesigned layout
  - Enhanced spacing
  - Improved shadows

## Testing Scenarios

### Visual Testing

- Dark mode glass effect
- Light mode glass effect
- Status badge visibility on images
- Tag wrapping with many items
- Long event titles (2 lines)
- Single day vs multi-day events

### Theme Testing

- Dark theme appearance
- Light theme appearance
- Primary color usage
- Border visibility
- Shadow rendering

---

**Status**: ✅ COMPLETE

**Design Style**: Glass Morphism
**Theme Support**: Dark & Light
**Last Updated**: March 5, 2026
**Version**: 2.0.0
