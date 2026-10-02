# Upcoming Events Navigation Fix

## Issue

The "View All" button and event cards in the UpcomingEventsCarousel on the Home screen were not properly navigating to the Events screens.

## Root Cause

The navigation structure is:

```
TabNavigator
├── Home (HomeScreen)
├── Events (EventsStackNavigator)
│   ├── EventsList
│   ├── AllEvents ← Target screen
│   └── EventDetail ← Target screen
├── Tools
└── More
```

The HomeScreen is in the **Tab Navigator**, while the AllEvents and EventDetail screens are nested inside the **Events Stack Navigator**.

Simple `navigation.navigate('AllEvents')` doesn't work because:

1. We're navigating from a different tab
2. The target screen is nested inside a stack navigator

## Solution

Used `CommonActions.navigate()` to navigate across navigators:

### Before (Broken)

```typescript
const handleViewAll = () => {
  navigation.navigate('AllEvents'); // ❌ Can't find screen
};

const handleEventPress = (slug: string) => {
  navigation.navigate('EventDetail', { slug }); // ❌ Can't find screen
};
```

### After (Fixed)

```typescript
const handleViewAll = () => {
  // Navigate to Events tab, then to AllEvents screen
  navigation.dispatch(
    CommonActions.navigate({
      name: 'Events',
      params: {
        screen: 'AllEvents',
      },
    }),
  );
};

const handleEventPress = (slug: string) => {
  // Navigate to Events tab, then to EventDetail screen
  navigation.dispatch(
    CommonActions.navigate({
      name: 'Events',
      params: {
        screen: 'EventDetail',
        params: { slug },
      },
    }),
  );
};
```

## How It Works

`CommonActions.navigate()` allows navigation across different navigators:

1. **First level**: Navigate to 'Events' tab
2. **Second level**: Navigate to nested screen within Events stack
3. **Third level**: Pass parameters to that screen

### Navigation Flow

#### View All Button

```
Home Screen
    ↓
[Tap "View All"]
    ↓
Switch to Events Tab
    ↓
Navigate to AllEvents Screen
    ✓ Success!
```

#### Event Card

```
Home Screen
    ↓
[Tap Event Card]
    ↓
Switch to Events Tab
    ↓
Navigate to EventDetail Screen
    ↓
Pass slug parameter
    ✓ Success!
```

## Files Modified

- `src/components/events/UpcomingEventsCarousel.tsx`
  - Updated `handleViewAll()` function
  - Updated `handleEventPress()` function
  - Changed imports to include `CommonActions`
  - Removed unused `StackNavigationProp` types

## Testing

### Test "View All" Button

1. Open app on Home screen
2. Scroll to "Upcoming Events" section
3. Tap "View All" button
4. ✅ Should navigate to Events tab → AllEvents screen
5. ✅ Should show all events list with filters

### Test Event Card

1. Open app on Home screen
2. Scroll to "Upcoming Events" section
3. Tap on any event card
4. ✅ Should navigate to Events tab → EventDetail screen
5. ✅ Should show the correct event details

### Test Navigation State

1. Navigate using View All
2. Press back button
3. ✅ Should return to Events tab (EventsList screen)
4. ✅ Tab bar should show Events tab as active

## Technical Details

### CommonActions API

```typescript
CommonActions.navigate({
  name: 'TargetNavigator',
  params: {
    screen: 'NestedScreen',
    params: {
      /* screen params */
    },
  },
});
```

**Parameters:**

- `name`: The navigator to navigate to (e.g., 'Events' tab)
- `params.screen`: The screen within that navigator
- `params.params`: Parameters to pass to the nested screen

### Navigation Dispatch

`navigation.dispatch()` is used instead of `navigation.navigate()` because:

- It can navigate across different navigators
- It handles complex navigation structures
- It properly updates the navigation state

## Benefits

✅ **Proper Navigation**: Works across tab and stack navigators
✅ **State Management**: Maintains proper navigation state
✅ **Back Button**: Back button works correctly
✅ **Tab Highlighting**: Events tab highlights when navigating
✅ **Deep Linking**: Could support deep links in future

## Alternative Solutions Considered

### Option 1: Use Navigation Context (Rejected)

```typescript
const rootNavigation = useNavigation<RootNavigationProp>();
```

- More complex type definitions needed
- Not necessary for this use case

### Option 2: Use Screen Navigation Events (Rejected)

```typescript
navigation.navigate('Events');
// Then separately navigate to AllEvents
```

- Race conditions
- Multiple re-renders
- Poor UX

### Option 3: CommonActions (Selected ✅)

- Single dispatch
- Clean code
- Proper state management
- Recommended by React Navigation docs

## Documentation Links

- [React Navigation - CommonActions](https://reactnavigation.org/docs/navigation-actions/#common)
- [Navigating to nested navigators](https://reactnavigation.org/docs/nesting-navigators/#navigating-to-a-screen-in-a-nested-navigator)

## Summary

✅ **Fixed**: "View All" button now navigates to AllEvents screen
✅ **Fixed**: Event cards now navigate to EventDetail screen
✅ **Tested**: Navigation works correctly across tabs
✅ **Clean**: Uses recommended React Navigation patterns

The navigation now works seamlessly from Home screen to Events screens! 🎉
