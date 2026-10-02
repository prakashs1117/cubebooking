# Authentication Guide

## Overview

The app now includes authentication support with bearer token for all API calls.

## 🔐 User Store

The `userStore` manages user authentication state and tokens.

### User Interface

```typescript
interface User {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'admin';
  avatar?: string;
}

interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  authToken: string | null;

  // Actions
  setUser: (user: User, token?: string) => void;
  setAuthToken: (token: string) => void;
  setUserRole: (role: UserRole) => void;
  clearUser: () => void;
  getAuthToken: () => string | null;
  isAdmin: () => boolean;
}
```

## 🚀 Usage

### 1. Login / Set User with Token

```typescript
import { useUserStore } from '@stores/userStore';

// After successful login from API
const handleLogin = async (email: string, password: string) => {
  try {
    const response = await loginAPI(email, password);

    // Set user and token in store
    useUserStore.getState().setUser(
      {
        id: response.user.id,
        email: response.user.email,
        name: response.user.name,
        role: response.user.role,
        avatar: response.user.avatar,
      },
      response.token, // Bearer token from API
    );

    console.log('✅ User logged in');
  } catch (error) {
    console.error('❌ Login failed:', error);
  }
};
```

### 2. Update Token Only

```typescript
import { useUserStore } from '@stores/userStore';

// If you need to update just the token (e.g., token refresh)
useUserStore.getState().setAuthToken('new-token-here');
```

### 3. Get Current Token

```typescript
import { useUserStore } from '@stores/userStore';

// Get current auth token
const token = useUserStore.getState().getAuthToken();
console.log('Current token:', token);
```

### 4. Logout / Clear User

```typescript
import { useUserStore } from '@stores/userStore';

// Clear user and token
useUserStore.getState().clearUser();
```

### 5. Check Authentication Status

```typescript
import { useUserStore } from '@stores/userStore';

// In a component
const isAuthenticated = useUserStore(state => state.isAuthenticated);
const currentUser = useUserStore(state => state.currentUser);
const authToken = useUserStore(state => state.authToken);

if (!isAuthenticated) {
  // Redirect to login
  navigation.navigate('Login');
}
```

## 🔌 API Integration

### Automatic Token Injection

All API services automatically include the bearer token in requests:

```typescript
// notifications.service.ts
const authToken = getAuthToken();

const response = await fetch(`${BASE_URL}${endpoint}`, {
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${authToken}`, // Automatically added
    ...options?.headers,
  },
  // ...
});
```

### Affected Services

✅ **Notifications Service** (`src/services/api/notifications.service.ts`)

- All notification endpoints require authentication
- Token automatically included in all requests

✅ **Events Service** (`src/services/api/events.service.ts`)

- Token included if available
- Public endpoints work without token
- Protected endpoints require token

### Error Handling

API services handle authentication errors:

```typescript
if (response.status === 401) {
  throw new Error('Unauthorized: Please login again');
}

if (response.status === 403) {
  throw new Error('Forbidden: You do not have permission');
}
```

## 📱 Component Example

### Protected Screen

```typescript
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import { useUserStore } from '@stores/userStore';
import { useNavigation } from '@react-navigation/native';

const ProtectedScreen: React.FC = () => {
  const isAuthenticated = useUserStore(state => state.isAuthenticated);
  const currentUser = useUserStore(state => state.currentUser);
  const navigation = useNavigation();

  useEffect(() => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      navigation.navigate('Login');
    }
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <View>
      <Text>Welcome, {currentUser?.name}!</Text>
    </View>
  );
};

export default ProtectedScreen;
```

### Login Screen

```typescript
import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { useUserStore } from '@stores/userStore';
import { useNavigation } from '@react-navigation/native';

const LoginScreen: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const handleLogin = async () => {
    setLoading(true);
    try {
      // Call your login API
      const response = await fetch('http://localhost:3000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();

      // Set user and token
      useUserStore.getState().setUser(
        {
          id: data.user.id,
          email: data.user.email,
          name: data.user.name,
          role: data.user.role,
          avatar: data.user.avatar,
        },
        data.token,
      );

      // Navigate to home
      navigation.navigate('Home');
    } catch (error) {
      Alert.alert('Login Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />
      <Button
        title={loading ? 'Logging in...' : 'Login'}
        onPress={handleLogin}
        disabled={loading}
      />
    </View>
  );
};

export default LoginScreen;
```

## 🔄 Token Refresh

If your API uses token refresh:

```typescript
import { useUserStore } from '@stores/userStore';

const refreshToken = async () => {
  try {
    const currentToken = useUserStore.getState().getAuthToken();

    const response = await fetch('http://localhost:3000/api/v1/auth/refresh', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${currentToken}`,
      },
    });

    const data = await response.json();

    // Update token
    useUserStore.getState().setAuthToken(data.newToken);

    console.log('✅ Token refreshed');
  } catch (error) {
    console.error('❌ Token refresh failed:', error);
    // Clear user and redirect to login
    useUserStore.getState().clearUser();
  }
};
```

## 🛡️ Security Best Practices

### 1. Secure Token Storage

✅ Tokens are stored in AsyncStorage via Zustand persist middleware
✅ AsyncStorage is encrypted on iOS/Android by default

### 2. Token Expiration

- Implement token refresh mechanism
- Handle 401 errors by refreshing token or logging out
- Set reasonable token expiration times (e.g., 1 hour)

### 3. HTTPS Only

- Always use HTTPS in production
- Never send tokens over HTTP

### 4. Token Validation

- Validate token format before sending
- Handle expired tokens gracefully

## 🧪 Development Mode

For development, a demo user is automatically initialized:

```typescript
// Demo user with demo token
{
  id: 'demo-user-1',
  email: 'demo@example.com',
  name: 'Demo User',
  role: 'user',
  token: 'demo-token-12345'
}
```

To use your own token in development:

```typescript
useUserStore.getState().setAuthToken('your-real-token-here');
```

## 📊 API Request Flow

```
1. Component makes API request
   ↓
2. Service gets token from userStore
   ↓
3. Token added to Authorization header
   ↓
4. Request sent with Bearer token
   ↓
5. Backend validates token
   ↓
6. Response returned
   ↓
7. If 401: Clear user → Redirect to login
   If 200: Return data
```

## 🔗 Related Files

- `src/stores/userStore.ts` - User authentication store
- `src/services/api/notifications.service.ts` - Notifications API with auth
- `src/services/api/events.service.ts` - Events API with auth
- `src/types/user.ts` - User type definitions (if exists)

## ✅ Checklist

Before deploying:

- [ ] Replace demo token with real token from login API
- [ ] Implement proper login screen
- [ ] Implement token refresh mechanism
- [ ] Handle 401/403 errors globally
- [ ] Test with real backend API
- [ ] Ensure HTTPS in production
- [ ] Add logout functionality
- [ ] Test token expiration handling

---

**Status**: ✅ Authentication System Ready

Last Updated: March 4, 2026
Version: 1.0.0
