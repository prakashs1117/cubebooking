# Navigation Guide - Date Picker Components

## 🗺️ Navigation Structure

All date picker screens have been properly integrated into your app's navigation system.

## 📱 Available Screens

### 1. **AllEventsScreen** (with Date Picker)

**Path**: `Events Tab → See All`

**Route**: `EventsStack → AllEvents`

**Features**:

- Horizontal date picker at the top
- Filters events by selected date
- Tap event to view details
- Pull to refresh

**Navigation Code**:

```tsx
// From EventsScreen
navigation.navigate('AllEvents');

// Programmatic navigation
import { useNavigation } from '@react-navigation/native';
import type { StackNavigationProp } from '@react-navigation/stack';
import { EventsStackParamList } from '@/types/navigation';

type Nav = StackNavigationProp<EventsStackParamList>;
const navigation = useNavigation<Nav>();

navigation.navigate('AllEvents');
```

### 2. **DatePickerExample** (Demo Screen)

**Path 1**: `Tools Tab → Date Picker Examples`
**Path 2**: `EventsStack → DatePickerExample` (direct navigation)

**Route**: `ToolsStack → DatePickerDemo`

**Features**:

- 4 different date picker configurations
- Live date selection preview
- Usage examples
- Feature list

**Navigation Code**:

```tsx
// From ToolsListScreen
navigation.navigate('DatePickerDemo');

// From Events Stack (if needed)
import type { StackNavigationProp } from '@react-navigation/stack';
import { EventsStackParamList } from '@/types/navigation';

type Nav = StackNavigationProp<EventsStackParamList>;
const navigation = useNavigation<Nav>();

navigation.navigate('DatePickerExample');
```

### 3. **EventDetail** (Event Details)

**Path**: `Events → All Events → [Tap any event]`

**Route**: `EventsStack → EventDetail`

**Navigation Code**:

```tsx
// From AllEventsScreen or any event list
navigation.navigate('EventDetail', {
  sessionId: event.id,
});
```

## 🔀 Navigation Flow

### Primary User Flow

```
Tab Navigator
  └─ Events Tab
      └─ EventsScreen (Main)
          ├─ Tap "See All" → AllEventsScreen
          │   └─ Tap Event → EventDetail
          └─ Tap Event Card → EventDetail
```

### Demo/Testing Flow

```
Tab Navigator
  └─ Tools Tab
      └─ ToolsListScreen
          └─ Tap "Date Picker Examples" → DatePickerExample
```

## 📋 Navigation Type Definitions

All navigation types are properly defined in `src/types/navigation.ts`:

```typescript
export type EventsStackParamList = {
  EventsList: undefined;
  AllEvents: undefined;
  EventDetail: { sessionId: string };
  DatePickerExample: undefined;
};

export type ToolsStackParamList = {
  ToolsList: undefined;
  IconGallery: undefined;
  FeatureFlags: undefined;
  DatePickerDemo: undefined;
};
```

## 🎯 OnPress Event Handlers

### EventsScreen → AllEvents

**File**: `src/screens/EventsScreen.tsx`

```tsx
const handleSeeAllPress = () => {
  navigation.navigate('AllEvents');
};

<HorizontalEventsList onSeeAllPress={handleSeeAllPress} />;
```

### AllEventsScreen → EventDetail

**File**: `src/screens/AllEventsScreen.tsx`

```tsx
const handleEventPress = (event: any) => {
  navigation.navigate('EventDetail', {
    sessionId: event.id,
  });
};

<EventListWithDatePicker events={events} onEventPress={handleEventPress} />;
```

### EventListWithDatePicker (Component)

**File**: `src/components/events/EventListWithDatePicker.tsx`

```tsx
// Event cards are now TouchableOpacity
<TouchableOpacity
  style={styles.eventCard}
  onPress={() => onEventPress?.(item)}
  activeOpacity={0.7}
>
  {/* Event content */}
</TouchableOpacity>
```

### ToolsListScreen → DatePickerDemo

**File**: `src/screens/ToolsListScreen.tsx`

```tsx
const handleToolPress = (screen: keyof ToolsStackParamList) => {
  navigation.navigate(screen);
};

// Date Picker tool item added to list
{
  id: 'datePickerDemo',
  title: 'Date Picker Examples',
  description: 'Interactive examples of horizontal date picker component',
  icon: 'calendar',
  screen: 'DatePickerDemo',
}
```

## 🔧 Navigation Configuration

### EventsStackNavigator

**File**: `src/navigation/EventsStackNavigator.tsx`

```tsx
<Stack.Navigator>
  {/* Main Events Screen */}
  <Stack.Screen name="EventsList" component={EventsScreen} />

  {/* All Events with Date Picker */}
  <Stack.Screen
    name="AllEvents"
    component={AllEventsScreen} // ✅ Updated
  />

  {/* Event Details */}
  <Stack.Screen name="EventDetail" component={EventDetailScreen} />

  {/* Date Picker Examples */}
  <Stack.Screen name="DatePickerExample" component={DatePickerExample} />
</Stack.Navigator>
```

### ToolsStackNavigator

**File**: `src/navigation/ToolsStackNavigator.tsx`

```tsx
<Stack.Navigator>
  <Stack.Screen name="ToolsList" component={ToolsListScreen} />
  <Stack.Screen name="IconGallery" component={IconGalleryScreen} />
  <Stack.Screen name="FeatureFlags" component={FeatureFlagsScreen} />

  {/* Date Picker Demo */}
  <Stack.Screen name="DatePickerDemo" component={DatePickerExample} />
</Stack.Navigator>
```

## 🎨 User Experience Flow

### Scenario 1: View Events by Date

1. User opens app → **Events Tab** (default)
2. Sees upcoming events on **EventsScreen**
3. Taps **"See All"** button
4. Navigates to **AllEventsScreen** with date picker
5. Scrolls through dates horizontally
6. Taps a date → Events filtered instantly
7. Taps an event → Opens **EventDetail**

### Scenario 2: Test Date Picker

1. User opens app
2. Taps **Tools Tab**
3. Sees **"Date Picker Examples"** in tools list
4. Taps to open **DatePickerExample**
5. Sees 4 different configurations
6. Interacts with each example
7. Back button returns to Tools

### Scenario 3: Event Details

1. From any event list (EventsScreen or AllEventsScreen)
2. Tap any event card
3. Opens **EventDetail** with full event information
4. Back button returns to previous screen

## 🚀 Quick Navigation Commands

### From Events Screen

```tsx
// Navigate to All Events
navigation.navigate('AllEvents');

// Navigate to Event Details
navigation.navigate('EventDetail', { sessionId: 'event-id' });

// Navigate to Date Picker Examples
navigation.navigate('DatePickerExample');
```

### From Any Screen

```tsx
// Navigate to Events tab, then All Events
navigation.navigate('Events', {
  screen: 'AllEvents',
});

// Navigate to Tools tab, then Date Picker Demo
navigation.navigate('Tools', {
  screen: 'DatePickerDemo',
});
```

## ✅ Checklist

- [x] AllEventsScreen registered in EventsStack
- [x] DatePickerExample registered in EventsStack
- [x] DatePickerExample registered in ToolsStack
- [x] Navigation types updated
- [x] EventsScreen → AllEvents navigation working
- [x] AllEventsScreen → EventDetail navigation working
- [x] EventListWithDatePicker cards are touchable
- [x] ToolsListScreen → DatePickerDemo navigation working
- [x] Custom headers configured
- [x] Back navigation working

## 📝 Testing Instructions

### Test 1: Events Flow

1. ✅ Open Events tab
2. ✅ Tap "See All" button
3. ✅ See date picker at top
4. ✅ Select different dates
5. ✅ Tap an event card
6. ✅ See event details
7. ✅ Tap back button

### Test 2: Date Picker Demo

1. ✅ Open Tools tab
2. ✅ Find "Date Picker Examples"
3. ✅ Tap to open
4. ✅ Interact with examples
5. ✅ Select dates in each configuration
6. ✅ Tap back button

### Test 3: Direct Navigation

```tsx
// In any component
const navigation = useNavigation();

// Test navigation
navigation.navigate('AllEvents');
navigation.navigate('DatePickerDemo');
```

## 🔍 Debugging Navigation

### Check Current Route

```tsx
import { useRoute } from '@react-navigation/native';

const route = useRoute();
console.log('Current route:', route.name);
console.log('Params:', route.params);
```

### Navigation State

```tsx
import { useNavigationState } from '@react-navigation/native';

const state = useNavigationState(state => state);
console.log('Navigation state:', state);
```

### Navigate with Reset

```tsx
import { CommonActions } from '@react-navigation/native';

navigation.dispatch(
  CommonActions.reset({
    index: 0,
    routes: [{ name: 'AllEvents' }],
  }),
);
```

## 📚 Related Files

### Navigation

- `src/navigation/EventsStackNavigator.tsx` - Events navigation
- `src/navigation/ToolsStackNavigator.tsx` - Tools navigation
- `src/types/navigation.ts` - Navigation types

### Screens

- `src/screens/EventsScreen.tsx` - Main events screen
- `src/screens/AllEventsScreen.tsx` - Events with date picker
- `src/screens/EventDetailScreen.tsx` - Event details
- `src/screens/examples/DatePickerExample.tsx` - Date picker demo
- `src/screens/ToolsListScreen.tsx` - Tools list

### Components

- `src/components/common/HorizontalDatePicker.tsx` - Date picker
- `src/components/events/EventListWithDatePicker.tsx` - Events + date picker
- `src/components/events/HorizontalEventsList.tsx` - Events carousel

## 🎯 Summary

All navigation is now properly configured and working:

✅ **EventsScreen** → **AllEventsScreen** (See All button)
✅ **AllEventsScreen** → **EventDetail** (Tap event card)
✅ **ToolsListScreen** → **DatePickerExample** (Date Picker Examples)
✅ **All event cards are touchable** with proper navigation
✅ **Back navigation** works on all screens
✅ **Type-safe navigation** with TypeScript

**Ready to use!** Just run the app and test the navigation flows.
