# React Native Development Best Practices - Implementation Guide

## 📋 Current Implementation Status

### ✅ **What We're Doing Right**

#### 1. Component Design

- ✅ **Functional Components**: All new components use hooks
- ✅ **TypeScript**: Strong typing throughout the app
- ✅ **Single Responsibility**: Components focused on specific tasks
- ✅ **Custom Hooks**: Reusable logic extracted (useFeatureFlag, useIsAdmin)
- ✅ **Composition**: Using HOCs and component composition

#### 2. State Management

- ✅ **Zustand Store**: Modern, lightweight state management
- ✅ **AsyncStorage Persistence**: State persists across sessions
- ✅ **Context API**: Theme and network contexts
- ✅ **No Prop Drilling**: Using stores and context
- ✅ **Centralized State**: Feature flags and user state in stores

#### 3. Code Organization

- ✅ **Absolute Imports**: Using path aliases (@components, @screens, @stores)
- ✅ **Folder Structure**: Organized by feature/function
- ✅ **Index Files**: Clean imports from directories
- ✅ **Separation of Concerns**: UI, logic, and data layers separated

#### 4. Side Effects

- ✅ **Cleanup Functions**: useEffect cleanup properly implemented
- ✅ **Dependency Arrays**: Dependencies specified correctly
- ✅ **Async Handling**: Proper async/await patterns

### ⚠️ **Areas for Improvement**

#### 1. Performance Optimization

**Current Issue**: Not using React.memo and useCallback consistently

**What to Fix**:

```typescript
// ❌ Current (Component re-renders unnecessarily)
const FeatureFlagItem = ({ flag, onToggle }) => {
  return <Switch onValueChange={onToggle} />;
};

// ✅ Improved (Memoized component)
const FeatureFlagItem = memo(
  ({ flag, onToggle }) => {
    return <Switch onValueChange={onToggle} />;
  },
  (prevProps, nextProps) => {
    return prevProps.flag.enabled === nextProps.flag.enabled;
  },
);
```

**Action Items**:

- [ ] Add React.memo to frequently rendered components
- [ ] Use useCallback for event handlers passed as props
- [ ] Optimize FlatList/ScrollView with proper keys
- [ ] Use React.lazy for code splitting

#### 2. Error Handling

**Current Issue**: No error boundaries implemented

**What to Add**:

```typescript
// Create src/components/common/ErrorBoundary.tsx
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error:', error, errorInfo);
    // Log to error tracking service
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}
```

**Action Items**:

- [ ] Create ErrorBoundary component
- [ ] Wrap main navigation in ErrorBoundary
- [ ] Add error logging service integration
- [ ] Create user-friendly error messages

#### 3. Request Cancellation

**Current Issue**: API requests not cancelled on unmount

**What to Add**:

```typescript
// ✅ Improved with AbortController
useEffect(() => {
  const abortController = new AbortController();

  const fetchData = async () => {
    try {
      const response = await fetch(url, {
        signal: abortController.signal,
      });
      const data = await response.json();
      setData(data);
    } catch (error) {
      if (error.name === 'AbortError') {
        console.log('Request cancelled');
      } else {
        console.error('Error:', error);
      }
    }
  };

  fetchData();

  return () => {
    abortController.abort();
  };
}, [url]);
```

**Action Items**:

- [ ] Add AbortController to configService
- [ ] Cancel pending requests on component unmount
- [ ] Add timeout handling for requests

#### 4. Testing

**Current Issue**: No tests implemented

**Action Items**:

- [ ] Add unit tests for custom hooks
- [ ] Test components with React Testing Library
- [ ] Add integration tests for critical flows
- [ ] Mock Zustand store in tests
- [ ] Test error scenarios

## 📝 Best Practices Checklist

### Component Design

```typescript
// ✅ Good Practice
import React, { memo, useCallback } from 'react';

interface Props {
  count: number;
  onIncrement: () => void;
}

export const Counter = memo<Props>(
  ({ count, onIncrement }) => {
    return (
      <View>
        <Text>{count}</Text>
        <Button onPress={onIncrement} title="Increment" />
      </View>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.count === nextProps.count;
  },
);

Counter.displayName = 'Counter';
```

**Rules**:

- ✅ Use TypeScript interfaces for props
- ✅ Add displayName for debugging
- ✅ Use memo for pure components
- ✅ Keep components under 200 lines
- ✅ Extract complex logic to custom hooks

### Custom Hooks

```typescript
// ✅ Good Practice
export const useFeatureFlag = (
  flagKey: string,
  fallbackValue = false,
): boolean => {
  // Hook implementation
  return useFeatureFlagsStore(state => {
    try {
      return state.isFeatureEnabled(flagKey);
    } catch (error) {
      console.warn(`Error getting flag ${flagKey}:`, error);
      return fallbackValue;
    }
  });
};
```

**Rules**:

- ✅ Start with "use" prefix
- ✅ Handle errors gracefully
- ✅ Provide fallback values
- ✅ Document with JSDoc comments
- ✅ Test hooks independently

### Performance Optimization

```typescript
// ✅ Good Practice - Memoization
const expensiveValue = useMemo(() => {
  return complexCalculation(data);
}, [data]);

const handleClick = useCallback(() => {
  doSomething(value);
}, [value]);

const MemoizedComponent = memo(MyComponent);
```

**Rules**:

- ✅ Use useMemo for expensive calculations
- ✅ Use useCallback for functions passed as props
- ✅ Use React.memo for components that render often
- ✅ Don't over-optimize - profile first
- ✅ Avoid inline object/array creation in render

### State Management

```typescript
// ✅ Good Practice - Zustand Store
export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      currentUser: null,
      setUser: user => set({ currentUser: user }),
      clearUser: () => set({ currentUser: null }),
      isAdmin: () => get().currentUser?.role === 'admin',
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
```

**Rules**:

- ✅ Use Zustand for global state
- ✅ Persist important state to AsyncStorage
- ✅ Keep state as local as possible
- ✅ Use selectors to prevent unnecessary re-renders
- ✅ Avoid state duplication

### Side Effects

```typescript
// ✅ Good Practice - Effect Cleanup
useEffect(() => {
  const subscription = source.subscribe();

  return () => {
    subscription.unsubscribe();
  };
}, [source]);

// ✅ Good Practice - Async Effects
useEffect(() => {
  let isMounted = true;

  const fetchData = async () => {
    const data = await api.getData();
    if (isMounted) {
      setData(data);
    }
  };

  fetchData();

  return () => {
    isMounted = false;
  };
}, []);
```

**Rules**:

- ✅ Always return cleanup function
- ✅ Specify all dependencies
- ✅ Handle race conditions
- ✅ Use isMounted flag for async operations
- ✅ Cancel pending requests on unmount

## 🎯 Implementation Plan

### Priority 1 (Critical) - Performance

1. **Add React.memo to frequently rendered components**

   ```typescript
   // Components to optimize:
   -FeatureFlagItem - SettingListItem - CategoryCard;
   ```

2. **Use useCallback for event handlers**

   ```typescript
   // In SettingsScreenTabbed.tsx
   const handleToggleFlag = useCallback(
     (key, value) => {
       setFeatureFlagOverride(key, !value);
     },
     [setFeatureFlagOverride],
   );
   ```

3. **Fix ESLint warnings**
   - Update dependency arrays
   - Remove unused variables
   - Fix any type issues

### Priority 2 (Important) - Error Handling

1. **Create ErrorBoundary component**

   - Add to src/components/common/ErrorBoundary.tsx
   - Wrap RootNavigator
   - Log errors to service

2. **Add request cancellation**

   - Update configService with AbortController
   - Cancel on component unmount
   - Handle timeout errors

3. **Add loading states**
   - Show loading indicators
   - Handle error states
   - Retry mechanisms

### Priority 3 (Enhancement) - Testing

1. **Setup testing infrastructure**

   - Configure Jest
   - Add React Testing Library
   - Mock Zustand stores

2. **Write tests**

   - Custom hooks tests
   - Component tests
   - Integration tests

3. **Add E2E tests**
   - Critical user flows
   - Cross-platform testing

## 📊 Code Quality Metrics

### Current Status

```
✅ TypeScript Coverage: 100%
✅ Hook Rules: Compliant
✅ Absolute Imports: Implemented
⚠️  Performance Optimization: Needs Improvement
⚠️  Error Handling: Needs Implementation
⚠️  Test Coverage: 0%
```

### Goals

```
🎯 TypeScript Coverage: 100% (Maintain)
🎯 Performance Score: >90
🎯 Error Boundaries: Implemented
🎯 Test Coverage: >70%
🎯 ESLint Warnings: 0
```

## 🔧 Quick Wins (Implement Now)

### 1. Fix useFeatureFlags dependencies

✅ **DONE** - Added stable string key for memoization

### 2. Add displayName to memo components

```typescript
const MyComponent = memo(() => { ... });
MyComponent.displayName = 'MyComponent';
```

### 3. Use useCallback consistently

```typescript
// Before
<Button onPress={() => handleClick()} />;

// After
const handleClickMemoized = useCallback(() => {
  handleClick();
}, [handleClick]);

<Button onPress={handleClickMemoized} />;
```

### 4. Extract magic numbers/strings

```typescript
// Before
if (age > 1000000) { ... }

// After
const CACHE_DURATION_MS = 1000000;
if (age > CACHE_DURATION_MS) { ... }
```

## 📚 Resources

### Documentation

- [React Hooks Docs](https://react.dev/reference/react)
- [React Native Performance](https://reactnative.dev/docs/performance)
- [Zustand Best Practices](https://github.com/pmndrs/zustand)

### Tools

- React DevTools - Component profiling
- Flipper - React Native debugging
- ESLint - Code quality
- TypeScript - Type safety

## ✨ Summary

Our app follows most React Native best practices:

- ✅ Modern hooks-based architecture
- ✅ TypeScript for type safety
- ✅ Proper state management with Zustand
- ✅ Clean code organization
- ⚠️ Need performance optimizations
- ⚠️ Need error boundaries
- ⚠️ Need test coverage

**Next Steps**:

1. Add React.memo to rendered components
2. Implement ErrorBoundary
3. Add AbortController for requests
4. Write tests for critical paths
5. Profile and optimize performance

The foundation is solid - we just need to add the finishing touches for production readiness! 🚀
