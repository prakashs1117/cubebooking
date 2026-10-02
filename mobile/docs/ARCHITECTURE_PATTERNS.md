# 🏗️ Architecture Patterns — My M Safety RN App

**Purpose:** Document the established patterns for components, hooks, services, and data flow  
**Audience:** All developers  
**Last Updated:** May 30, 2026

---

## Table of Contents

1. [Data Flow Architecture](#1-data-flow-architecture)
2. [Component Patterns](#2-component-patterns)
3. [Hook Patterns](#3-hook-patterns)
4. [Service Layer](#4-service-layer)
5. [State Management](#5-state-management)
6. [Context Usage](#6-context-usage)
7. [Real-World Examples](#7-real-world-examples)
8. [Anti-Patterns (What NOT To Do)](#8-anti-patterns-what-not-to-do)

---

## 1. Data Flow Architecture

### The Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ USER INTERACTION (Tap, swipe, input)                        │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ SCREEN COMPONENT                                            │
│ - Manages UI state (open/closed, form data)                │
│ - Calls custom hooks                                        │
│ - Handles user input events                                 │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ CUSTOM HOOKS (useQuery, useMutation, custom logic)         │
│ - Data fetching via TanStack Query                         │
│ - Complex state logic                                       │
│ - Derived values                                            │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ SERVICE LAYER (authService, userService, etc.)             │
│ - Wraps API calls                                           │
│ - Business logic                                            │
│ - Transformations                                           │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ API LIBRARY (@lib/axios)                                   │
│ - HTTP client wrapper                                       │
│ - Error handling                                            │
│ - Token injection                                           │
└──────────────────────┬──────────────────────────────────────┘
                       ↓
┌─────────────────────────────────────────────────────────────┐
│ BACKEND API                                                 │
│ - /auth/* endpoints                                         │
│ - /users/* endpoints                                        │
│ - /articles/* endpoints                                     │
└─────────────────────────────────────────────────────────────┘
```

### Key Rules

1. **Screens never call services directly** — always go through hooks
2. **Hooks fetch data with TanStack Query** — not manual useState + useEffect
3. **Services handle API communication** — screens don't import axios
4. **API library handles low-level HTTP** — services don't use axios directly
5. **No server state in Context/Zustand** — TanStack Query owns all remote data

---

## 2. Component Patterns

### Basic Screen Component

```typescript
// Location: src/screens/MyScreen.tsx

import React, { useCallback, useState } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useTheme } from '@theme/index';
import { useMyData } from '@hooks/useMyData';
import { MyCard } from '@components/MyCard';
import { CustomHeader } from '@components/common/CustomHeader';

interface MyScreenProps {
  // Navigation params if needed
}

const MyScreen: React.FC<MyScreenProps> = () => {
  const { theme, isDark } = useTheme();
  const { data, isLoading, error, refetch } = useMyData();
  
  // Local UI state (not server state)
  const [selectedId, setSelectedId] = useState<string | null>(null);
  
  const handleSelect = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const handleRefresh = useCallback(async () => {
    await refetch();
  }, [refetch]);

  return (
    <View style={[styles.container, { backgroundColor: theme.background.primary }]}>
      <CustomHeader 
        title="My Screen"
        showBack
        onRefresh={handleRefresh}
      />
      
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color={theme.text.primary} />
          </View>
        ) : error ? (
          <View style={styles.error}>
            <CustomText color="error">Error loading data</CustomText>
          </View>
        ) : (
          data?.map((item) => (
            <MyCard
              key={item.id}
              item={item}
              isSelected={selectedId === item.id}
              onPress={() => handleSelect(item.id)}
            />
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  error: {
    padding: 16,
    backgroundColor: '#fff3cd',
    borderRadius: 8,
  },
});

export default MyScreen;
```

**Key patterns:**
- Props interface at top
- Hooks imported and called
- useCallback for event handlers
- theme + isDark for colors
- StyleSheet at bottom
- Conditional rendering for states

---

### Modal/Bottom Sheet Component

```typescript
// Location: src/components/modals/MyModal.tsx

import React, { useCallback, useRef, useEffect } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { 
  BottomSheetModal, 
  BottomSheetView,
  BottomSheetBackdrop 
} from '@gorhom/bottom-sheet';
import type { BottomSheetBackdropProps } from '@gorhom/bottom-sheet';
import { useTheme } from '@theme/index';

interface MyModalProps {
  visible: boolean;
  onClose: () => void;
  onSelect?: (value: string) => void;
}

const MyModal: React.FC<MyModalProps> = ({ visible, onClose, onSelect }) => {
  const { theme } = useTheme();
  const sheetRef = useRef<BottomSheetModal>(null);

  // Present on mount with proper cleanup
  useEffect(() => {
    const id = setTimeout(() => sheetRef.current?.present(), 50);
    return () => clearTimeout(id);
  }, []);

  const handleBackdropPress = useCallback(() => {
    sheetRef.current?.dismiss();
  }, []);

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop
        {...props}
        disappearsOnIndex={-1}
        appearsOnIndex={0}
        opacity={0.55}
        pressBehavior="close"
      />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={sheetRef}
      enableDynamicSizing
      enablePanDownToClose
      backdropComponent={renderBackdrop}
      onDismiss={onClose}
      backgroundStyle={{ backgroundColor: theme.background.modal }}
    >
      <BottomSheetView style={[styles.content, { backgroundColor: theme.background.modal }]}>
        {/* Modal content */}
      </BottomSheetView>
    </BottomSheetModal>
  );
};

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
});

export default MyModal;
```

**Key patterns:**
- useRef + useEffect for presentation (not callback ref!)
- Proper cleanup in useEffect
- renderBackdrop memoized
- enablePanDownToClose for swipe dismiss
- enableDynamicSizing for content-driven height

---

## 3. Hook Patterns

### Data Fetching Hook (TanStack Query)

```typescript
// Location: src/hooks/useMyData.ts

import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { myService } from '@services/myService';

interface MyDataResponse {
  id: string;
  name: string;
  // ...
}

export const useMyData = (
  options?: UseQueryOptions<MyDataResponse[]>,
) => {
  return useQuery({
    queryKey: ['myData'],
    queryFn: () => myService.getMyData(),
    // Default behavior: cache for 5 mins, stale after 2 mins
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
    ...options, // Allow overrides
  });
};
```

**Key patterns:**
- Single query key (if parameters, include them: `['myData', id]`)
- Service layer call
- Proper TypeScript typing
- Configurable options

### Mutation Hook (Write Operations)

```typescript
// Location: src/hooks/useUpdateMyData.ts

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { myService } from '@services/myService';

export const useUpdateMyData = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: MyData) => myService.updateMyData(data),
    onSuccess: () => {
      // Invalidate related queries to refetch
      queryClient.invalidateQueries({ queryKey: ['myData'] });
    },
    onError: (error) => {
      console.error('Update failed:', error);
    },
  });
};
```

**Key patterns:**
- Returns result with `mutate` function
- Invalidates related queries on success
- Handles errors
- QueryClient access for cache management

### Custom Logic Hook

```typescript
// Location: src/hooks/useFormValidation.ts

import { useCallback, useState } from 'react';

interface ValidationErrors {
  [field: string]: string;
}

export const useFormValidation = (validate: (data: any) => ValidationErrors) => {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateForm = useCallback((data: any) => {
    const newErrors = validate(data);
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validate]);

  return { errors, validateForm };
};
```

**Key patterns:**
- useCallback for stable function references
- Clear return interface
- Reusable logic extracted

---

## 4. Service Layer

### API Service Pattern

```typescript
// Location: src/services/authService.ts

import { api } from '@lib/axios';
import { tokenService } from '@services/tokenService';

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  accessToken: string;
  refreshToken: string;
  user: { id: string; email: string };
}

class AuthService {
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
      const response = await api.post<LoginResponse>('/auth/login', credentials);
      
      // Store tokens
      await tokenService.setTokens(
        response.data.accessToken,
        response.data.refreshToken,
      );
      
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async logout(): Promise<void> {
    try {
      await api.post('/auth/logout');
    } finally {
      // Clear tokens regardless of API response
      await tokenService.clearTokens();
    }
  }

  private handleError(error: unknown): Error {
    if (error instanceof AxiosError) {
      // Transform API errors to user-friendly messages
      if (error.response?.status === 401) {
        return new Error('Invalid credentials');
      }
    }
    return new Error('An error occurred');
  }
}

export const authService = new AuthService();
```

**Key patterns:**
- Class-based, single responsibility
- Typed request/response
- Error handling/transformation
- Side effects (token storage)
- Export singleton instance

---

## 5. State Management

### Rule of Thumb

```
┌─────────────────────────────────────────┐
│ Where should this state live?           │
└─────────────────────────────────────────┘
         ↓                              ↓
    Remote/Server Data            Local/Client Data
    (from API)                     (UI state, form)
         ↓                              ↓
  TanStack Query                 useState + useCallback
  (automatic caching,            (React hooks only)
   refetch, dedup)                
         ↓
    IF complex global              IF complex global
    shared logic THEN              client state THEN
    Context or Zustand            Context or Zustand
```

### Local State Example

```typescript
const [isOpen, setIsOpen] = useState(false);
const [formData, setFormData] = useState({ name: '', email: '' });
```

Use when: Form inputs, modal open/close, UI toggles

### Server State Example

```typescript
const { data, isLoading, error, refetch } = useQuery({
  queryKey: ['users', id],
  queryFn: () => userService.getUser(id),
});
```

Use when: Data from API, needs caching/refetch

### Global Client State Example

```typescript
// src/context/ThemeContext.tsx
const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDark, setIsDark] = useState(false);
  
  return (
    <ThemeContext.Provider value={{ isDark, setIsDark }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used in ThemeProvider');
  return context;
};
```

Use when: Global flags (theme, language, auth status), not remote data

---

## 6. Context Usage

### When to Use Context

✅ **DO use Context for:**
- Theme (light/dark)
- Language/Localization
- Authentication status (isLoggedIn)
- User preferences
- Network status
- Global UI flags

❌ **DON'T use Context for:**
- Remote API data (use TanStack Query)
- Large lists (causes unnecessary re-renders)
- Frequently changing data

### Context Pattern

```typescript
// 1. Define context and interface
interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string) => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

// 2. Create provider component
export const UserProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const login = useCallback(async (email: string) => {
    setIsLoading(true);
    try {
      const response = await authService.login(email);
      setUser(response.user);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const value = useMemo(() => ({ user, isLoading, login }), [user, isLoading, login]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// 3. Create custom hook for usage
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) throw new Error('useUser must be used in UserProvider');
  return context;
};

// 4. Use in components
const MyComponent = () => {
  const { user, login } = useUser();
  // ...
};
```

---

## 7. Real-World Examples

### Example 1: Article List Screen

```typescript
// Component layer
const ArticleListScreen = () => {
  const { theme } = useTheme();
  const { data: articles, isLoading } = useArticles(); // Custom hook
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <FlashList
      data={articles}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ArticleCard 
          article={item} 
          onPress={() => setSelectedId(item.id)}
        />
      )}
    />
  );
};

// Hook layer
const useArticles = () => {
  return useQuery({
    queryKey: ['articles'],
    queryFn: () => articleService.getArticles(),
  });
};

// Service layer
class ArticleService {
  async getArticles(): Promise<Article[]> {
    const response = await api.get('/articles');
    return response.data.map(this.transformArticle);
  }

  private transformArticle(raw: any): Article {
    return { id: raw.id, title: raw.title, /* ... */ };
  }
}
```

### Example 2: Login Flow

```typescript
// Screen
const LoginScreen = () => {
  const { login, isLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = useCallback(async () => {
    await login(email, password);
    // Navigation happens automatically via auth context
  }, [email, password, login]);

  return (
    <View>
      <TextInput value={email} onChangeText={setEmail} />
      <TextInput value={password} onChangeText={setPassword} secureTextEntry />
      <TouchableOpacity onPress={handleLogin} disabled={isLoading}>
        <Text>{isLoading ? 'Loading...' : 'Login'}</Text>
      </TouchableOpacity>
    </View>
  );
};

// Hook
const useAuth = () => {
  const loginMutation = useMutation({
    mutationFn: (creds: Credentials) => authService.login(creds),
    onSuccess: (data) => {
      // Update context state
      setUser(data.user);
    },
  });

  return {
    login: loginMutation.mutate,
    isLoading: loginMutation.isPending,
  };
};

// Service
class AuthService {
  async login(creds: Credentials): Promise<LoginResponse> {
    const response = await api.post('/auth/login', creds);
    await tokenService.setTokens(response.data.tokens);
    return response.data;
  }
}
```

---

## 8. Anti-Patterns (What NOT To Do)

### ❌ Anti-Pattern 1: Manual Fetch in useEffect

```typescript
// ❌ BAD - Manual state + effect
const [data, setData] = useState(null);
useEffect(() => {
  api.get('/users').then(setData);
}, []);

// ✅ GOOD - TanStack Query handles this
const { data } = useQuery({
  queryKey: ['users'],
  queryFn: () => api.get('/users'),
});
```

### ❌ Anti-Pattern 2: No Effect Cleanup

```typescript
// ❌ BAD - Memory leak
useEffect(() => {
  const timer = setInterval(tick, 1000);
}, []);

// ✅ GOOD - Cleanup returned
useEffect(() => {
  const timer = setInterval(tick, 1000);
  return () => clearInterval(timer);
}, []);
```

### ❌ Anti-Pattern 3: key={index}

```typescript
// ❌ BAD - Index key causes issues
{items.map((item, index) => (
  <Item key={index} data={item} />
))}

// ✅ GOOD - Stable ID
{items.map((item) => (
  <Item key={item.id} data={item} />
))}
```

### ❌ Anti-Pattern 4: Context for Remote Data

```typescript
// ❌ BAD - All users go in context
const UserProvider = ({ children }) => {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    api.get('/users').then(setUsers);
  }, []);
  return <Provider value={{ users }}>{children}</Provider>;
};

// ✅ GOOD - TanStack Query handles caching
const { data: users } = useQuery({
  queryKey: ['users'],
  queryFn: () => api.get('/users'),
});
```

### ❌ Anti-Pattern 5: Relative Imports

```typescript
// ❌ BAD
import Component from '../components/Component';
import { useHook } from './hooks/useHook';

// ✅ GOOD
import Component from '@components/Component';
import { useHook } from '@hooks/useHook';
```

---

## Summary

**The Three Layers:**
1. **Screen/Component** — UI, calls hooks, handles user events
2. **Hooks** — Data fetching (TanStack Query), complex state logic
3. **Services** — API communication, business logic transformation

**State Placement:**
- Remote data → **TanStack Query**
- Client UI state → **useState**
- Global flags → **Context**

**Remember:**
- Screens call hooks, not services
- Hooks use TanStack Query for remote data
- Services wrap API calls
- Always clean up effects
- Use stable keys in lists

---

**Questions?** Check `PROJECT_CONFIGURATION.md` or memory files for more details.
