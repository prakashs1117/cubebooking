# Mobile App Development Guide

**Purpose:** Step-by-step guide for adding new features, screens, and functionality to the Demand Management mobile app.

---

## Temporarily Disabled API Calls

These endpoints are commented out because they are not available in the dev environment.
Re-enable them when the backend is ready.

| Endpoint | File | What to change |
|---|---|---|
| `GET /api/v1/app-version` | `App.tsx` | Uncomment the `checkAppVersion()` call and its import |
| `GET /api/v1/feature-flags` | `App.tsx` | Uncomment the `configService.initialize()` call and its import |
| `GET /api/v1/me/notifications` | `src/config/notificationsSync.config.ts` | Set `AUTO_SYNC_ENABLED: true` |

**Prerequisites:** You've completed `/mobile/SETUP.md` and can run the app.

---

## Adding a New Screen

### Step 1: Create the Screen Component

**File:** `mobile/src/screens/demand/[feature]/NewScreen.tsx`

```typescript
import React, { useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '@/stores/authStore';

interface NewScreenProps {
  navigation: any;
  route: any;
}

export default function NewScreen({ navigation, route }: NewScreenProps) {
  const user = useAuthStore(state => state.user);

  // Fetch data with TanStack Query
  const { data, isLoading, error } = useQuery({
    queryKey: ['newData'],
    queryFn: async () => {
      // Call shared service
      return data;
    },
  });

  if (isLoading) {
    return <ActivityIndicator size="large" style={{ flex: 1 }} />;
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Error loading data</Text>
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, padding: 16 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 16 }}>
        New Screen
      </Text>
      {/* Your content here */}
    </ScrollView>
  );
}
```

### Step 2: Add Route to Navigation

**File:** `mobile/src/navigation/demand/AppNavigator.tsx` (or appropriate stack)

```typescript
import NewScreen from '@/screens/demand/feature/NewScreen';

// In your navigator:
<Stack.Screen name="NewScreen" component={NewScreen} />;
```

### Step 3: Update Route Types

**File:** `mobile/src/navigation/demand/types.ts`

```typescript
export type FeatureStackParamList = {
  NewScreen: { id?: string }; // Add params if needed
};

export type FeatureStackScreenProps<T extends keyof FeatureStackParamList> =
  NativeStackScreenProps<FeatureStackParamList, T>;
```

### Step 4: Add Navigation Link

```typescript
// From another screen:
navigation.navigate('NewScreen', { id: '123' });

// In NewScreen, retrieve params:
const { id } = route.params;
```

---

## Using Shared Services

### Import Services

```typescript
import { authService } from '@/services/api/demand/auth';
import { submissionService } from '@/services/api/demand/submission';
```

### Fetch Data with TanStack Query

```typescript
import { useQuery, useMutation } from '@tanstack/react-query';

// Read data
const {
  data: submissions,
  isLoading,
  error,
  refetch,
} = useQuery({
  queryKey: ['submissions', userId],
  queryFn: () => submissionService.getAll({ userId }),
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 30 * 60 * 1000, // 30 minutes
});

// Mutate data
const { mutate: submitForm, isPending } = useMutation({
  mutationFn: data => submissionService.submitForReview(data.id),
  onSuccess: data => {
    Alert.alert('Success', 'Submitted for review');
    refetch(); // Refresh list
  },
  onError: error => {
    Alert.alert('Error', error.message);
  },
});

// Call mutation
const handleSubmit = (id: string) => {
  submitForm({ id });
};
```

### Handle Loading/Error States

```typescript
if (isLoading) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <ActivityIndicator size="large" />
      <Text>Loading...</Text>
    </View>
  );
}

if (error) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: 'red' }}>{error.message}</Text>
      <TouchableOpacity onPress={() => refetch()}>
        <Text style={{ color: '#007AFF', marginTop: 10 }}>Retry</Text>
      </TouchableOpacity>
    </View>
  );
}

if (!data) {
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>No data available</Text>
    </View>
  );
}
```

---

## Using Zustand Stores

### Create a New Store

**File:** `mobile/src/stores/newStore.ts`

```typescript
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NewStoreState {
  items: any[];
  selectedItem: any | null;
  addItem: (item: any) => void;
  selectItem: (id: string) => void;
  clearItems: () => void;
}

export const useNewStore = create<NewStoreState>()(
  persist(
    set => ({
      items: [],
      selectedItem: null,
      addItem: item =>
        set(state => ({
          items: [...state.items, item],
        })),
      selectItem: id =>
        set(state => ({
          selectedItem: state.items.find(item => item.id === id),
        })),
      clearItems: () => set({ items: [], selectedItem: null }),
    }),
    {
      name: 'new-store',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: state => ({
        items: state.items,
        selectedItem: state.selectedItem,
      }),
    },
  ),
);
```

### Use Store in Screen

```typescript
import { useNewStore } from '@/stores/newStore';

export default function MyScreen() {
  const items = useNewStore(state => state.items);
  const addItem = useNewStore(state => state.addItem);

  const handleAdd = () => {
    addItem({ id: '1', name: 'New Item' });
  };

  return (
    <View>
      <FlatList data={items} renderItem={item => <Text>{item.name}</Text>} />
      <TouchableOpacity onPress={handleAdd}>
        <Text>Add Item</Text>
      </TouchableOpacity>
    </View>
  );
}
```

---

## Using Shared Types

### Import Types

```typescript
import {
  Role,
  Status,
  Priority,
  Submission,
  User,
  Notification,
} from '@demand/shared';
```

### Type Your Components

```typescript
interface SubmissionItemProps {
  submission: Submission;
  onPress: (id: string) => void;
}

export default function SubmissionItem({
  submission,
  onPress,
}: SubmissionItemProps) {
  return (
    <TouchableOpacity onPress={() => onPress(submission.id)}>
      <Text>{submission.appName}</Text>
      <StatusBadge status={submission.status} />
    </TouchableOpacity>
  );
}
```

---

## Using Forms with React Hook Form

### Simple Form

```typescript
import { useForm, Controller } from 'react-hook-form';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';

export default function MyForm() {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async data => {
    try {
      await api.submit(data);
      Alert.alert('Success');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View>
      <Controller
        control={control}
        name="email"
        rules={{ required: 'Email is required' }}
        render={({ field: { value, onChange } }) => (
          <TextInput
            placeholder="Email"
            value={value}
            onChangeText={onChange}
            style={{ borderBottomWidth: 1, paddingVertical: 10 }}
          />
        )}
      />
      {errors.email && (
        <Text style={{ color: 'red' }}>{errors.email.message}</Text>
      )}

      <TouchableOpacity onPress={handleSubmit(onSubmit)}>
        <Text>Submit</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Form with Shared Schema

```typescript
import { requestSchema, defaultValues, STEP_FIELDS } from '@demand/shared';
import { zodResolver } from '@hookform/resolvers/zod';

const { control, trigger, handleSubmit } = useForm({
  resolver: zodResolver(requestSchema),
  defaultValues,
});

// Validate current step
const validateStep = async (stepIndex: number) => {
  const fieldsInStep = STEP_FIELDS[stepIndex];
  return await trigger(fieldsInStep);
};

// On submit
const onSubmit = async data => {
  await submissionService.submitForReview(data);
};
```

---

## Building Lists

### With FlashList (50+ items)

```typescript
import { FlashList } from '@shopify/flash-list';

export default function SubmissionsList({
  submissions,
}: {
  submissions: Submission[];
}) {
  return (
    <FlashList
      data={submissions}
      renderItem={({ item }) => <SubmissionItem submission={item} />}
      keyExtractor={item => item.id} // Never use index!
      estimatedItemSize={80}
      onEndReached={() => loadMore()}
      ListEmptyComponent={<Text>No submissions</Text>}
    />
  );
}
```

### With FlatList (< 50 items)

```typescript
import { FlatList } from 'react-native';

export default function SmallList({ items }: { items: any[] }) {
  return (
    <FlatList
      data={items}
      renderItem={({ item }) => <Item {...item} />}
      keyExtractor={item => item.id}
    />
  );
}
```

### Pull-to-Refresh

```typescript
import { ScrollView, RefreshControl } from 'react-native';

const [refreshing, setRefreshing] = React.useState(false);

const onRefresh = React.useCallback(() => {
  setRefreshing(true);
  refetch().then(() => setRefreshing(false));
}, [refetch]);

return (
  <ScrollView
    refreshControl={
      <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
    }
  >
    {/* Content */}
  </ScrollView>
);
```

---

## Navigation Patterns

### Simple Navigation

```typescript
// Navigate to screen with no params
navigation.navigate('Dashboard');

// Navigate with params
navigation.navigate('SubmissionDetail', { id: '123' });

// Go back
navigation.goBack();

// Navigate and clear stack
navigation.reset({
  index: 0,
  routes: [{ name: 'Dashboard' }],
});
```

### Conditional Navigation (Auth)

```typescript
// RootNavigator already handles this
const user = useAuthStore(state => state.user);

// RootNavigator shows:
// - AuthStack if !user
// - AppNavigator if user
```

### Role-Based Navigation

```typescript
// MoreStack in AppNavigator already filters by role
const user = useAuthStore(state => state.user);

if (['Admin', 'Super Admin'].includes(user?.role)) {
  // Show Admin screens
}
```

---

## Styling

### Using Theme

```typescript
import { useTheme } from '@react-navigation/native';

export default function MyComponent() {
  const { colors } = useTheme();

  return (
    <View style={{ backgroundColor: colors.background }}>
      <Text style={{ color: colors.text }}>Hello</Text>
    </View>
  );
}
```

### Using Theme Context

```typescript
import { useTheme } from '@/theme';

const { isDark, colors } = useTheme();

return (
  <View
    style={{
      backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
      color: isDark ? '#ffffff' : '#000000',
    }}
  >
    Content
  </View>
);
```

### Shared Color Tokens

```typescript
import { statusColor, priorityColor } from '@demand/shared';

const approved = statusColor('Approved');
// { color: '#059669', bg: '#ecfdf5', border: '#a7f3d0' }

return (
  <View
    style={{
      borderColor: approved.border,
      backgroundColor: approved.bg,
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 8,
    }}
  >
    <Text style={{ color: approved.color }}>Approved</Text>
  </View>
);
```

---

## Animations

### Simple Fade Animation

```typescript
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

export default function AnimatedComponent() {
  return (
    <Animated.View entering={FadeIn} exiting={FadeOut}>
      <Text>Animated content</Text>
    </Animated.View>
  );
}
```

### Slide Animation

```typescript
import Animated, { SlideInRight, SlideOutLeft } from 'react-native-reanimated';

<Animated.View entering={SlideInRight} exiting={SlideOutLeft}>
  <Text>Slides in from right, out to left</Text>
</Animated.View>;
```

### Custom Animation

```typescript
import Animated, { withSpring } from 'react-native-reanimated';
import { useAnimatedStyle, useSharedValue } from 'react-native-reanimated';

export default function CustomAnimation() {
  const offset = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: offset.value }],
  }));

  return (
    <>
      <Animated.View style={animatedStyle}>
        <Text>Animated</Text>
      </Animated.View>
      <TouchableOpacity onPress={() => (offset.value = withSpring(100))}>
        <Text>Animate</Text>
      </TouchableOpacity>
    </>
  );
}
```

---

## Localization (i18n)

### Supported Languages

- English (en)
- French (fr)
- Arabic (ar) — with RTL support

### Usage

```typescript
import { useTranslation } from 'react-i18next';

export default function MyComponent() {
  const { t, i18n } = useTranslation();

  return (
    <View>
      <Text>{t('common.welcome')}</Text>
      <TouchableOpacity onPress={() => i18n.changeLanguage('fr')}>
        <Text>{t('common.changeLang')}</Text>
      </TouchableOpacity>
    </View>
  );
}
```

### Adding Translations

Edit language files in `mobile/localization/`:

```json
{
  "common": {
    "welcome": "Welcome",
    "changeLang": "Change Language"
  }
}
```

---

## Testing

### Unit Test Example

**File:** `mobile/src/utils/__tests__/helpers.test.tsx`

```typescript
import { formatPrice } from '../helpers';

describe('formatPrice', () => {
  it('should format price correctly', () => {
    expect(formatPrice(1000)).toBe('$10.00');
    expect(formatPrice(0)).toBe('$0.00');
  });
});
```

### Component Test Example

```typescript
import { render, screen } from '@testing-library/react-native';
import MyComponent from '../MyComponent';

describe('MyComponent', () => {
  it('should render text', () => {
    render(<MyComponent />);
    expect(screen.getByText('Hello')).toBeTruthy();
  });
});
```

### Running Tests

```bash
npm test                    # Run all tests
npm test -- MyComponent     # Run specific test
npm test -- --watch        # Watch mode
npm test -- --coverage     # Coverage report
```

---

## Performance Tips

### 1. Memoize Components

```typescript
import { memo } from 'react';

const SubmissionItem = memo(({ submission, onPress }: Props) => (
  <TouchableOpacity onPress={() => onPress(submission.id)}>
    <Text>{submission.appName}</Text>
  </TouchableOpacity>
));
```

### 2. Use useMemo for Expensive Calculations

```typescript
const expensiveValue = useMemo(() => {
  return calculate(largeArray);
}, [largeArray]);
```

### 3. Lazy Load Images

```typescript
import { Image } from 'react-native';

<Image
  source={{ uri: 'https://...' }}
  style={{ width: 200, height: 200 }}
  defaultSource={require('@/assets/placeholder.png')}
/>;
```

### 4. Virtualize Long Lists

Already handled by FlashList — it only renders visible items.

---

## Debugging Tips

### View Component Tree

```bash
# In Metro terminal, press 'd'
# Opens Chrome DevTools to inspect components
```

### Log Redux/Store State

```typescript
import { useNewStore } from '@/stores/newStore';

// In screen, access store
const state = useNewStore();
console.log('Store state:', state);
```

### Inspect Network Requests

```bash
# Use Flipper → Network tab
# Shows all API calls, request/response bodies, timing
```

### Performance Monitor

```typescript
import { PerformanceMonitor } from 'react-native-performance-monitor';

<PerformanceMonitor>
  <YourScreen />
</PerformanceMonitor>;
```

---

## Common Patterns

### Handle API Errors

```typescript
const handleError = (error: any) => {
  if (error.response?.status === 401) {
    // Token expired, logout
    useAuthStore.getState().logout();
  } else if (error.response?.status === 403) {
    Alert.alert('Permission Denied');
  } else {
    Alert.alert('Error', error.message);
  }
};
```

### Debounce Search

```typescript
import { debounce } from 'lodash';

const debouncedSearch = useMemo(
  () =>
    debounce((text: string) => {
      setSearchText(text);
    }, 500),
  [],
);

return <TextInput onChangeText={debouncedSearch} placeholder="Search..." />;
```

### Confirmation Dialog

```typescript
import { Alert } from 'react-native';

const handleDelete = () => {
  Alert.alert('Confirm Delete', 'Are you sure?', [
    { text: 'Cancel', onPress: () => {}, style: 'cancel' },
    { text: 'Delete', onPress: () => deleteItem(), style: 'destructive' },
  ]);
};
```

---

## References

- **Setup Guide:** `/mobile/SETUP.md`
- **Shared Package:** `/packages/shared/README.md`
- **Mobile CLAUDE.md:** `/mobile/CLAUDE.md`
- **React Navigation Docs:** https://reactnavigation.org/
- **React Native Docs:** https://reactnative.dev/
- **React Hook Form:** https://react-hook-form.com/
- **TanStack Query:** https://tanstack.com/query/latest
- **Zustand:** https://zustand-demo.vercel.app/
