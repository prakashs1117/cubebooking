# 📋 Project Configuration & Standards — My M Safety RN App

**Last Updated:** May 30, 2026  
**Status:** Complete Setup Configuration  
**Audience:** All developers working on this project

---

## Table of Contents

1. [Critical Code Standards](#1-critical-code-standards) — **MANDATORY**
2. [Development Workflow](#2-development-workflow) — Git, scripts, pre-commit
3. [Architecture & Patterns](#3-architecture--patterns) — How we build
4. [Quick Reference](#4-quick-reference) — Copy-paste ready

---

## 1. Critical Code Standards

### ✅ ABSOLUTE IMPORTS ONLY — Non-negotiable

**RULE:** All imports MUST use absolute paths. Relative imports are **FORBIDDEN** and will fail linting.

#### Why?
- Project-wide consistency
- Easier refactoring (moving files doesn't break imports)
- Clearer dependencies
- Enforced by ESLint (will fail CI)

#### Path Aliases (from `tsconfig.json` & `babel.config.js`)

```typescript
// ✅ CORRECT - Always use these
import Component from '@/components/MyComponent';
import Screen from '@screens/MyScreen';
import { useHook } from '@hooks/useCustomHook';
import Navigator from '@navigation/TabNavigator';
import { utility } from '@utils/helpers';
import theme from '@theme/colors';
import service from '@services/api';
import { Context } from '@context/AppContext';
import config from '@config/app';
import { t } from '@localization/i18n';
import image from '@assets/images/logo.png';
import lib from '@lib/external';

// ❌ FORBIDDEN - Will fail linting
import Component from '../components/MyComponent';
import { useHook } from './hooks/useCustomHook';
import service from '../../../services/api';
```

#### Available Aliases

| Alias | Maps To | Use For |
|---|---|---|
| `@/` | `src/` | Root imports |
| `@components` | `src/components/` | UI components |
| `@screens` | `src/screens/` | Screen/page components |
| `@hooks` | `src/hooks/` | Custom React hooks |
| `@navigation` | `src/navigation/` | Navigation stacks, navigators |
| `@utils` | `src/utils/` | Utility functions |
| `@theme` | `src/theme/` | Theme, colors, styles |
| `@services` | `src/services/` | API services, external APIs |
| `@context` | `src/context/` | React contexts |
| `@config` | `src/config/` | Configuration files |
| `@localization` | `src/localization/` | i18n setup, translations |
| `@assets` | `src/assets/` | Images, icons, fonts |
| `@lib` | `src/lib/` | Library configurations |
| `@stores` | `src/stores/` | State stores (if using Zustand) |

---

### ✅ TYPESCRIPT STRICT MODE

- TypeScript is **strict mode enforced**
- All files must be `.ts` or `.tsx`
- No `any` types unless absolutely necessary (document with `@ts-ignore` comment)
- All function parameters must have types
- All return types should be explicit

```typescript
// ✅ GOOD
const fetchUser = async (id: string): Promise<User> => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

// ❌ BAD - missing return type, any param
const fetchUser = async (id) => {
  const response: any = await api.get(`/users/${id}`);
  return response.data;
};
```

---

### ✅ NAMING CONVENTIONS

| Category | Convention | Examples |
|---|---|---|
| **Components** | PascalCase | `UserCard.tsx`, `LoginScreen.tsx`, `CustomButton.tsx` |
| **Hooks** | camelCase, start with `use` | `useAuth.ts`, `useFavorites.ts`, `useTheme.ts` |
| **Files** | PascalCase (components), camelCase (utils) | `UserProfile.tsx`, `formatDate.ts`, `authService.ts` |
| **Folders** | kebab-case or camelCase | `user-profile/`, `authContext/`, `api-services/` |
| **Constants** | UPPER_SNAKE_CASE | `const MAX_RETRIES = 3;` |
| **Variables** | camelCase | `isLoading`, `userData`, `handleSubmit` |
| **Classes** | PascalCase | `class ApiService {}` |
| **Interfaces** | PascalCase | `interface User {}`, `interface ApiResponse {}` |
| **Types** | PascalCase | `type Theme = 'light' \| 'dark';` |

---

### ✅ EFFECT CLEANUP — Non-negotiable

**RULE:** Every `useEffect` with a subscription, timer, or listener MUST return a cleanup function.

```typescript
// ✅ GOOD - cleanup returned
useEffect(() => {
  const subscription = eventBus.subscribe('event', handler);
  const timer = setInterval(tick, 1000);
  
  return () => {
    subscription.unsubscribe();
    clearInterval(timer);
  };
}, [handler]);

// ❌ BAD - missing cleanup (memory leak!)
useEffect(() => {
  const subscription = eventBus.subscribe('event', handler);
  const timer = setInterval(tick, 1000);
  // No cleanup = memory leak on unmount
}, [handler]);
```

**Missing cleanup causes:**
- Memory leaks across screen navigations
- Stale event listeners
- Multiple timer instances
- Test failures

---

### ✅ KEY PROP HYGIENE IN LISTS

**RULE:** Never use `key={index}`. Always key by stable ID.

```typescript
// ✅ GOOD - stable ID
{items.map((item) => (
  <Item key={item.id} data={item} />
))}

// ❌ BAD - index key causes issues on reorder
{items.map((item, index) => (
  <Item key={index} data={item} />
))}
```

**Why?** When items reorder or get deleted, `key={index}` causes React to reconcile incorrectly, leading to:
- State getting attached to wrong items
- Performance degradation
- UI bugs (checkboxes, toggles in wrong state)

---

### ✅ LIST RENDERING

**RULE:** Use `FlashList` from `@shopify/flash-list` for dynamic lists (never `FlatList`).

```typescript
// ✅ GOOD
import { FlashList } from '@shopify/flash-list';

<FlashList
  data={items}
  keyExtractor={(item) => item.id}  // Stable ID, not index!
  renderItem={({ item }) => <ItemRow item={item} />}
  estimatedItemSize={100}
/>

// ❌ BAD - FlatList is slower
<FlatList
  data={items}
  keyExtractor={(item, index) => index}  // Double mistake!
  renderItem={({ item }) => <ItemRow item={item} />}
/>
```

---

### ✅ ANIMATIONS

**RULE:** Use `Reanimated 3` (not core React Native `Animated`).

```typescript
// ✅ GOOD
import Animated, { 
  FadeIn, 
  FadeOut, 
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

<Animated.View entering={FadeIn.duration(300)}>
  {/* content */}
</Animated.View>

// ❌ BAD - core Animated is less performant
import { Animated } from 'react-native';
```

---

### ✅ SERVER STATE MANAGEMENT

**RULE:** All remote data goes in **TanStack Query**, NOT Context or local state.

```typescript
// ✅ GOOD - TanStack Query manages server state
import { useQuery } from '@tanstack/react-query';

const { data: user, isLoading, error } = useQuery({
  queryKey: ['user', id],
  queryFn: () => api.getUser(id),
});

// ❌ BAD - manual state management for remote data
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(false);
useEffect(() => {
  api.getUser(id).then(setUser);
}, [id]);
```

**Benefits:**
- Automatic caching
- Stale data handling
- Background refetching
- Deduplication

---

## 2. Development Workflow

### Development Commands

```bash
# Start development
npm start              # Start Metro bundler

# Build & run
npm run ios            # Build and run on iOS simulator
npm run android        # Build and run on Android emulator

# Code quality
npm run lint           # Run ESLint (checks all .ts/.tsx files)
npm run format         # Format code with Prettier
npm test               # Run Jest tests

# Cache management
npm run android-cache-clear      # Clear Android build cache
npm run clear_local_gradle_cache # Clear Gradle cache
npm run type-check                # Run TypeScript check
```

---

### Pre-Commit Hooks (Husky)

**Status:** Pre-commit hooks are configured to run on every commit.

Hooks automatically run:
1. **ESLint** — checks code style (auto-fixes if possible)
2. **Prettier** — formats code
3. **TypeScript** — type checking

If any hook fails, the commit is blocked. To proceed:

```bash
# Fix issues manually
npm run lint -- --fix
npm run format

# Then try commit again
git commit -m "your message"
```

To skip hooks (not recommended):
```bash
git commit --no-verify  # Bypasses all hooks
```

---

### Git Workflow

#### Branch Naming Convention

```
feature/<feature-name>      # New features
fix/<bug-name>             # Bug fixes
refactor/<area>            # Code refactoring
docs/<topic>               # Documentation
chore/<task>               # Maintenance tasks

# Examples
feature/search-overlay
fix/language-modal-gesture
refactor/auth-context
docs/setup-guide
chore/update-dependencies
```

#### Commit Message Format

Follow Conventional Commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat:` — New feature
- `fix:` — Bug fix
- `refactor:` — Code refactor (no behavior change)
- `perf:` — Performance improvement
- `test:` — Tests added/updated
- `docs:` — Documentation
- `chore:` — Maintenance, dependencies, build

**Examples:**
```
feat(language-modal): add scroll-to-accept UX

- Add scroll detection to TermsAndPrivacyModal
- Checkbox only unlocks after scrolling to bottom
- Fixes swipe-dismiss on real iOS devices

fix(gesture-handler): remove double GestureHandlerRootView

This fixes the issue where swipe-down-to-dismiss failed on real
iOS devices but worked on simulators.

Causes:
- Two nested GestureHandlerRootView wrappers created competing gesture responders
- Missing bare 'react-native-gesture-handler' import in index.js

Fixes #42
```

---

### Before Every Pull Request

- [ ] Run `npm run lint` — passes with 0 errors
- [ ] Run `npm run format` — code formatted
- [ ] Run `npm test` — all tests pass
- [ ] Run `npm run type-check` — 0 TypeScript errors
- [ ] Test on real device (simulator is not enough for gesture handlers!)
- [ ] Update MEMORY.md if you found new patterns
- [ ] Add unit tests for new features

---

## 3. Architecture & Patterns

### Component Pattern

```typescript
// Location: src/components/MyComponent.tsx

import React, { useState, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { CustomText } from '@components/common/CustomText';

interface MyComponentProps {
  title: string;
  onPress?: () => void;
}

const MyComponent: React.FC<MyComponentProps> = ({ title, onPress }) => {
  const { theme, isDark } = useTheme();
  const [isActive, setIsActive] = useState(false);

  const handlePress = useCallback(() => {
    setIsActive(!isActive);
    onPress?.();
  }, [isActive, onPress]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <CustomText style={[styles.title, { color: theme.text.primary }]}>
        {title}
      </CustomText>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default MyComponent;
```

**Key patterns:**
- Props interface at top
- `useTheme()` for dynamic colors
- Callback wrapped with `useCallback`
- StyleSheet at bottom
- Export component as default

---

### Hook Pattern

```typescript
// Location: src/hooks/useMyCustomHook.ts

import { useQuery } from '@tanstack/react-query';
import { apiService } from '@services/api';

interface UseMyCustomHookOptions {
  id: string;
  enabled?: boolean;
}

export const useMyCustomHook = ({ 
  id, 
  enabled = true 
}: UseMyCustomHookOptions) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ['myData', id],
    queryFn: () => apiService.getMyData(id),
    enabled,
  });

  return { data, isLoading, error };
};
```

**Key patterns:**
- Descriptive name starting with `use`
- Interface for options
- Return object with named properties
- Use TanStack Query for remote data

---

### Service Pattern

```typescript
// Location: src/services/authService.ts

import { api } from '@lib/axios';

interface LoginCredentials {
  email: string;
  password: string;
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<{ token: string }> {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  }

  async logout(): Promise<void> {
    await api.post('/auth/logout');
  }

  async getCurrentUser() {
    const response = await api.get('/auth/me');
    return response.data;
  }
}

export const authService = new AuthService();
```

**Key patterns:**
- Class-based structure
- Single responsibility
- Async/await for API calls
- Typed request/response
- Export singleton instance

---

### Data Flow

```
User Interaction
       ↓
Screen Component
       ↓
Hook (useQuery/useMutation from TanStack Query)
       ↓
Service Layer (authService, userService)
       ↓
API Library (axios wrapper in @lib/axios)
       ↓
Backend API
```

**Rules:**
1. Screens call hooks, never call services directly
2. Hooks manage data fetching (TanStack Query)
3. Services handle API calls
4. Never duplicate server state in Context/Zustand
5. Context only for client state (theme, auth status, UI flags)

---

### State Management

| Where | What | Tool | Example |
|---|---|---|---|
| **Component Local** | Form inputs, UI toggles | `useState` | Open/close modal |
| **Server Data** | Remote API responses | **TanStack Query** | User profile, articles |
| **Global App State** | Auth status, theme | **Context** | isAuthenticated, isDark |
| **Cross-Component** | Complex state logic | **Zustand** (if needed) | Language, filters |

---

## 4. Quick Reference

### Absolute Must-Do's
- [ ] Only absolute imports (`@components/X`, not `../components/X`)
- [ ] Always clean up effects (timers, subscriptions)
- [ ] Never use `key={index}` in lists
- [ ] Use `FlashList` not `FlatList`
- [ ] Use `Reanimated 3` not core `Animated`
- [ ] Server data in TanStack Query, never `useState` + `useEffect`
- [ ] Test on real device before submitting PR

### Linting Will Catch
- ✅ Relative imports (will error)
- ✅ Missing effect cleanup (will warn)
- ✅ TypeScript type errors (will error)
- ✅ ESLint rule violations (will error)

### Before Commit
```bash
npm run lint      # Must pass
npm run format    # Auto-fix formatting
npm test          # Tests should pass
npm run type-check # Must pass
```

### Emergency: Clear Everything
```bash
# Complete reset
npm run android-cache-clear
npm run clear_local_gradle_cache
rm -rf node_modules
npm install
npm start
```

---

## Questions?

Refer to:
- `CLAUDE.md` — Project overview & commands
- `PERFORMANCE.md` — Performance standards in detail
- `DEVELOPMENT.md` — Extended development guide
- Memory files in `.claude/projects/.../memory/` — Team decisions & patterns

---

**Last Updated:** May 30, 2026  
**Maintained By:** Development Team
