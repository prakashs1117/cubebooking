# Mobile App Architecture

## Overview

The mobile app uses a responsive design that adapts between mobile (< 768px) and tablet (≥ 768px) layouts. Both share common components and styling while maintaining platform-specific optimizations.

## File Structure

### Screens (`src/screens/new/`)

#### Home Screen Architecture
```
HomeScreen.tsx (router - switches based on device width)
├── HomeScreen.mobile.tsx (mobile-specific layout)
│   └── Uses full-width single-column layout
│       └── Shared components: MobileAppHeader, SearchBar, etc.
├── HomeScreen.tablet.tsx (tablet-specific layout)
│   └── Uses sidebar + 2-column layout
│       └── Shared components: DashboardSidebar, Dashboard components
└── HomeScreen.shared.ts (mock data - shared between both)
```

**Why separate files?**
- Clean separation of concerns
- Different layout strategies per device
- Easy to maintain and update independently
- Shared data to avoid duplication
- Can be individually tested

#### Other Screens
- `SignInScreen.tsx` - Authentication
- `ProfileScreen.tsx` - User profile with logout
- `NewsScreen.tsx`, `SearchScreen.tsx`, `SettingsScreen.tsx` - Placeholder screens

### Components (`src/components/home/`)

#### Mobile Components (Mobile-Specific)
- `MobileAppHeader.tsx` - Mobile header with menu, greeting, notifications
- `AnnouncementBanner.tsx` - Green announcement strip
- `QuickActionGrid.tsx` & `QuickActionButton.tsx` - Action buttons
- `EventCarousel.tsx` & `EventCard.tsx` - Event list
- `FeedPost.tsx` & `PostActions.tsx` - Social feed

#### Tablet Components (Dashboard-Specific)
- `DashboardSidebar.tsx` - Left navigation sidebar (236px)
- `HeroStrip.tsx` - Greeting banner
- `KPICard.tsx` & `KPIGrid.tsx` - KPI metrics
- `MiniCalendar.tsx` - Calendar widget
- `EngagementChart.tsx` - Analytics chart
- `TabletDashboard.tsx` - Tablet orchestrator

#### Shared Components (`src/components/common/`)
- `SearchBar.tsx` - Search input
- `CustomText.tsx` - Themed text component
- `CustomButton.tsx` - Themed button
- `CustomInput.tsx` - Themed input
- `Avatar.tsx` - User avatar circles
- `Chip.tsx` - Tag/label chips
- `IconButton.tsx` - Icon buttons

### Styling System

#### Shared Styles (`src/components/home/common.styles.ts`)
```typescript
SPACING = { xs: 4, sm: 8, md: 12, lg: 14, xl: 16, xxl: 18, xxxl: 22 }
BORDER_RADIUS = { sm: 8, md: 10, lg: 12, xl: 14, xxl: 20, full: 99 }
TYPOGRAPHY = { heading1, heading2, heading3, heading4, subtitle, body, caption, button }
SHADOWS = { sm, md, lg }
```

**Usage Pattern:**
```typescript
import { SPACING, BORDER_RADIUS, TYPOGRAPHY } from './common.styles';

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
    borderRadius: BORDER_RADIUS.lg,
  },
  title: {
    ...TYPOGRAPHY.heading3,
  },
});
```

## Responsive Design Pattern

### Device Detection
```typescript
const { width } = Dimensions.get('window');
const isTablet = width >= 768;
```

### Router Component Strategy
The main `HomeScreen.tsx` acts as a router:
```typescript
export default function HomeScreen() {
  return isTablet ? <HomeScreenTablet /> : <HomeScreenMobile />;
}
```

### Why This Approach?
1. **Clear separation** - Each layout is isolated
2. **Easy maintenance** - Update mobile or tablet independently
3. **Performance** - Only relevant components are rendered
4. **Testability** - Can test each layout separately
5. **Shared data** - Mock data lives in `.shared.ts`

## Component Reusability Matrix

| Component | Mobile | Tablet | Shared |
|-----------|--------|--------|--------|
| SearchBar | ✓ | ✓ | common/ |
| CustomText | ✓ | ✓ | common/ |
| Avatar | ✓ | ✓ | common/ |
| FeedPost | ✓ | ✓ | home/ |
| MobileAppHeader | ✓ | ✗ | home/ |
| DashboardSidebar | ✗ | ✓ | home/ |
| KPIGrid | ✗ | ✓ | home/ |

## Spacing Guidelines

### Mobile Layout Margins
- Container margins: 14px (left/right)
- Section gaps: 0-20px (vertical)
- Card padding: 14-16px (horizontal), 13-14px (vertical)

### Tablet Layout Margins
- Sidebar width: 236px (fixed)
- Main content padding: 22px (horizontal), 20px (vertical)
- Column gap: 16px

### Typography Scaling

**Mobile:**
- Headings: 15-18px
- Body: 13-14px
- Caption: 10-12px

**Tablet:**
- Headings: 18-22px
- Body: 14-15px
- Caption: 12-13px

## Color System

### Theme Colors (from ThemeContext)
```typescript
theme.background.primary    // Main background
theme.background.secondary  // Secondary/card background
theme.background.card       // Card background
theme.text.primary          // Main text
theme.text.secondary        // Secondary text
theme.text.tertiary         // Tertiary text
theme.border.primary        // Primary border
theme.button.primary.background  // Primary button color
```

### Brand Colors (Hardcoded - Merck Liquid)
```
Primary Green:   #149B5F
Secondary Cyan:  #2DBECD
Accent Yellow:   #FFC832
Orange:          #B07B00
```

## Best Practices

### 1. Component Organization
```typescript
// ✓ Good - clear separation
src/components/
├── common/          (shared: SearchBar, Avatar, etc.)
├── home/            (home screen components)
└── navigation/      (navigation components)
```

### 2. Styling
```typescript
// ✓ Good - using common styles
import { SPACING, TYPOGRAPHY } from './common.styles';

const styles = StyleSheet.create({
  title: TYPOGRAPHY.heading3,
  container: { marginHorizontal: SPACING.lg },
});

// ✗ Avoid - hardcoded values
const styles = StyleSheet.create({
  title: { fontSize: 18, fontWeight: '900' },
  container: { marginHorizontal: 14 },
});
```

### 3. Responsive Checks
```typescript
// ✓ Good - centralized in router component
function HomeScreen() {
  return isTablet ? <HomeScreenTablet /> : <HomeScreenMobile />;
}

// ✗ Avoid - responsive checks scattered in component
function HomeScreen() {
  const isTablet = Dimensions.get('window').width >= 768;
  if (isTablet) return <TabletLayout />;
  return <MobileLayout />;
}
```

### 4. Mock Data
```typescript
// ✓ Good - shared in .shared.ts
export const mockFeedPosts = [...]

// ✗ Avoid - duplicated in each layout
```

## Navigation Structure

```
App.tsx
├── RootNavigator
│   ├── AuthStack (if not authenticated)
│   │   └── SignInScreen
│   └── Main (if authenticated)
│       └── DrawerNavigator
│           ├── ProfileScreen (drawer content)
│           └── TabNavigator
│               ├── Home (HomeScreen.mobile OR HomeScreen.tablet)
│               ├── News
│               ├── Search
│               ├── Notifications (modal overlay)
│               └── Settings
```

## Performance Considerations

1. **FlashList** for large lists (used in feed, not yet implemented)
2. **Memoization** for expensive components
3. **useCallback** for event handlers passed as props
4. **Dimensions listener** for orientation changes (not yet needed at 768px breakpoint)

## Testing Strategy

### Unit Tests
- Component rendering
- Props validation
- Event handling

### Integration Tests
- Mobile → Tablet transition
- Navigation flow
- Data persistence

### Visual Tests
- Responsive behavior
- Spacing consistency
- Text readability

## Future Enhancements

1. **Orientation handling** - Support landscape mode
2. **Tablet optimization** - Improve large screen experience
3. **Animation library** - Add Reanimated for smooth transitions
4. **Accessibility** - Add accessibility labels and roles
5. **Dark mode** - Complete dark theme testing
6. **Localization** - RTL support for Arabic

## Common Issues & Solutions

### Issue: Text not visible
**Solution:** Increase font size, improve contrast, use proper color from theme

### Issue: Spacing inconsistent
**Solution:** Use SPACING constants from common.styles.ts

### Issue: Component overlapping
**Solution:** Add proper margins/padding, check flexDirection and justifyContent

### Issue: Keyboard pushing content
**Solution:** Use KeyboardAvoidingView or adjust ScrollView with keyboard behavior

## Code Review Checklist

- [ ] Uses shared components where applicable
- [ ] Follows SPACING and TYPOGRAPHY from common.styles
- [ ] Proper responsive checks (if needed)
- [ ] Text sizes are readable (min 12px)
- [ ] Colors have sufficient contrast
- [ ] Spacing is consistent with guidelines
- [ ] Mobile and tablet layouts don't conflict
- [ ] No hardcoded values (use constants)
- [ ] Mock data in .shared.ts (not duplicated)
- [ ] Proper TypeScript types
