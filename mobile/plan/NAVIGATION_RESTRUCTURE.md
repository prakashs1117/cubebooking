# Navigation Restructure - EventDetail as Internal Screen

## Summary

Restructured the navigation to properly handle EventDetailScreen as an internal screen within the Events flow, not as a tab bar item. This fixes the tab bar alignment issue and follows React Navigation best practices.

## Changes Made

### 1. Created Events Stack Navigator ✅

**File**: `src/navigation/EventsStackNavigator.tsx`

Created a new Stack Navigator to handle the Events flow:

- **EventsList** - Main events list screen (EventsScreen)
- **EventDetail** - Event detail screen (internal, not in tab bar)

This allows users to navigate from the events list to event details without affecting the tab bar.

### 2. Updated Tab Navigator ✅

**File**: `src/navigation/TabNavigator.tsx`

**Before**:

- Had EventDetailScreen as a tab with `tabBarButton: () => null` (hacky solution)
- This caused alignment issues in the tab bar

**After**:

- Removed EventDetailScreen from tabs
- Replaced EventsScreen with EventsStackNavigator
- Now only 4 visible tabs: Home, Events, Demo, Settings
- Each tab takes exactly 25% of screen width

### 3. Fixed Tab Bar Styling ✅

Updated tab bar styles for perfect alignment:

```typescript
tabBarItemStyle: {
  flex: 1,  // Equal space for all tabs
  justifyContent: 'center',
  alignItems: 'center',
  paddingHorizontal: 0,
}
```

### 4. Updated Navigation Types ✅

**File**: `src/types/navigation.ts`

Added new type for Events stack:

```typescript
export type EventsStackParamList = {
  EventsList: undefined;
  EventDetail: { sessionId: string };
};
```

Removed EventDetail from TabParamList (it's now in EventsStackParamList).

### 5. Installed Dependencies ✅

- Installed `@react-navigation/stack` npm package
- Updated iOS pods

## Navigation Flow

### Before (Incorrect)

```
Tab Navigator
├── Home Tab
├── Events Tab (EventsScreen)
├── EventDetail Tab (hidden with tabBarButton: () => null) ❌
├── Demo Tab
└── Settings Tab
```

### After (Correct)

```
Tab Navigator
├── Home Tab
├── Events Tab (EventsStackNavigator)
│   ├── EventsList (EventsScreen)
│   └── EventDetail (Internal Screen) ✅
├── Demo Tab
└── Settings Tab
```

## How It Works

1. **User taps Events tab** → Sees EventsScreen (list of events)
2. **User taps an event** → Navigates to EventDetailScreen (internal screen)
3. **User taps back** → Returns to EventsScreen (events list)
4. **Tab bar remains visible** → Always shows 4 tabs evenly distributed

## Benefits

✅ **Proper navigation structure** - Internal screens are no longer in the tab bar
✅ **Perfect tab alignment** - All 4 tabs evenly distributed (25% each)
✅ **Type-safe navigation** - Proper TypeScript types for all navigators
✅ **Better UX** - Users can navigate between events and details smoothly
✅ **Follows React Navigation best practices** - Stack navigator for hierarchical flows

## Testing

1. Open the app
2. Navigate to Events tab
3. Tap on any event
4. Should see EventDetailScreen without tab bar jumping
5. Tap back arrow
6. Should return to EventsScreen
7. Bottom tab bar should show 4 evenly spaced tabs

## Files Modified

1. ✅ `src/navigation/TabNavigator.tsx` - Removed EventDetail, added EventsStack
2. ✅ `src/types/navigation.ts` - Added EventsStackParamList
3. ✅ `package.json` - Added @react-navigation/stack

## Files Created

1. ✅ `src/navigation/EventsStackNavigator.tsx` - New Events stack navigator

## Migration Notes

No breaking changes - the navigation flow works the same from a user perspective, but is now properly structured under the hood.
