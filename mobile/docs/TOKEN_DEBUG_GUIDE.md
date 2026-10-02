# Token Debug Guide

## 🐛 Debugging Missing Bearer Token

If your API requests to `/me/notifications` are not including the Bearer token, follow these steps to debug.

## 📊 Step 1: Check Current Auth State

Open your app and run in the console:

```javascript
global.debugAuth();
```

**Expected Output:**

```
========== AUTH STATE DEBUG ==========
📊 User: Demo User (or your user name)
📊 Email: demo@example.com
📊 Authenticated: true
📊 Token: demo-token-12345... (should show your token)
======================================
```

**If Token shows "NOT SET":**

- Token is not being stored or loaded
- Continue to Step 2

## 🔧 Step 2: Set a Test Token

Set your real token manually:

```javascript
global.setTestToken('YOUR_REAL_TOKEN_HERE');
```

**Expected Output:**

```
🔧 Setting test token: YOUR_REAL_TOKEN_HERE...
✅ Token set. Verify: YOUR_REAL_TOKEN_HERE...
```

Then check state again:

```javascript
global.debugAuth();
```

## 🧪 Step 3: Test API Request

Test if the token is being sent:

```javascript
global.testTokenInRequest();
```

**Expected Output (Success):**

```
========== TESTING API REQUEST ==========
🔑 Current token: YOUR_TOKEN...
📡 Response status: 200
✅ Success! Token is working
📊 Notifications count: 16
=========================================
```

**Expected Output (Token Missing):**

```
========== TESTING API REQUEST ==========
🔑 Current token: NOT SET
❌ NO TOKEN FOUND! API calls will fail.
=========================================
```

**Expected Output (Invalid Token):**

```
========== TESTING API REQUEST ==========
🔑 Current token: YOUR_TOKEN...
📡 Response status: 401
❌ 401 Unauthorized - Token is invalid or expired
=========================================
```

## 🔍 Step 4: Check Console Logs

Look for these logs when app starts:

```
🔄 Initializing demo user...
   Current user: NONE (or existing user)
   Current token: NONE (or existing token)
✅ Creating demo user with token: demo-token-12345
👤 User set: Demo User (user)
🔑 Auth token set: demo-token-12345...
🔑 Token in store: demo-token-12345...
✅ Verification - Token in store: demo-token-12345...
```

When making API call:

```
📡 API Request: http://localhost:3000/api/v1/me/notifications?page=1&limit=20
🔑 Auth Token: demo-token-12345... (or YOUR_TOKEN...)
📡 API Response Status: 200
```

## 🛠️ Common Issues & Solutions

### Issue 1: Token is NULL

**Symptom:**

```
🔑 Auth Token: NOT FOUND
```

**Causes:**

1. User not logged in
2. Token not set after login
3. AsyncStorage not hydrated yet

**Solution:**

```javascript
// Set token manually
global.setTestToken('your-real-token-from-login-api');

// Or force login with token
global.forceLoginWithToken('your-real-token-from-login-api');
```

### Issue 2: Token Not Persisting

**Symptom:**

- Token works initially
- Token is NULL after app restart

**Causes:**

- AsyncStorage not persisting
- Zustand persist middleware issue

**Solution:**

```javascript
// Check AsyncStorage directly
import AsyncStorage from '@react-native-async-storage/async-storage';

AsyncStorage.getItem('user-storage').then(data => {
  console.log('AsyncStorage data:', JSON.parse(data));
});
```

### Issue 3: Token Not Sent in Request

**Symptom:**

```
📡 API Request: http://localhost:3000/api/v1/me/notifications
🔑 Auth Token: demo-token-12345...
📡 API Response Status: 401
```

**Causes:**

- Backend not accepting token format
- Token expired
- Token invalid

**Solution:**

1. **Check token format** - Should be `Bearer YOUR_TOKEN`
2. **Verify token on backend** - Decode JWT to check expiry
3. **Test with curl**:

```bash
curl -H "Authorization: Bearer YOUR_TOKEN" \
     http://localhost:3000/api/v1/me/notifications
```

### Issue 4: AsyncStorage Not Hydrating

**Symptom:**

- Token available after login
- Token NULL on app restart
- No persistence

**Solution:**
Check if AsyncStorage is working:

```javascript
// Test AsyncStorage
AsyncStorage.setItem('test-key', 'test-value').then(() => {
  AsyncStorage.getItem('test-key').then(value => {
    console.log('AsyncStorage working:', value === 'test-value');
  });
});
```

## 🧪 Manual Testing Steps

### Test 1: Login Flow

```javascript
// 1. Start fresh
useUserStore.getState().clearUser();
global.debugAuth(); // Should show NOT SET

// 2. Simulate login
global.forceLoginWithToken('test-token-123');
global.debugAuth(); // Should show test-token-123

// 3. Test API
global.testTokenInRequest(); // Should send Bearer test-token-123
```

### Test 2: Token Persistence

```javascript
// 1. Set token
global.setTestToken('persistent-token-456');

// 2. Close and restart app

// 3. Check if persisted
global.debugAuth(); // Should still show persistent-token-456
```

### Test 3: Real Backend Token

After logging in with your backend:

```javascript
// 1. Get token from login response
const loginResponse = await fetch('http://localhost:3000/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password' }),
});

const data = await loginResponse.json();
console.log('Login token:', data.token);

// 2. Set in app
global.setTestToken(data.token);

// 3. Test notifications
global.testTokenInRequest();
```

## 📝 Expected Token Flow

```
1. User logs in
   ↓
2. Backend returns JWT token
   ↓
3. App stores token: useUserStore.setUser(user, token)
   ↓
4. Token saved to AsyncStorage via Zustand persist
   ↓
5. API calls: getAuthToken() retrieves token from store
   ↓
6. Token added to headers: Authorization: Bearer TOKEN
   ↓
7. Backend validates token
   ↓
8. Response returned
```

## 🔍 Debugging Network Requests

### Using React Native Debugger

1. Open React Native Debugger
2. Go to Network tab
3. Look for request to `/me/notifications`
4. Check Request Headers
5. Verify `Authorization: Bearer TOKEN` is present

### Using Charles Proxy / Proxyman

1. Configure proxy on device
2. Make API request
3. Inspect request headers
4. Verify Bearer token is included

### Using Chrome DevTools

1. Open Chrome DevTools
2. Go to Network tab
3. Filter by `notifications`
4. Check request headers

## ✅ Verification Checklist

- [ ] User is logged in: `global.debugAuth()` shows user
- [ ] Token is set: `global.debugAuth()` shows token
- [ ] Token persists: Token survives app restart
- [ ] Token in request: Network tab shows `Authorization` header
- [ ] Backend accepts token: API returns 200, not 401
- [ ] Demo user has token: `demo-token-12345` visible in logs

## 🚀 Production Checklist

Before deploying:

- [ ] Replace demo token with real tokens from login
- [ ] Implement proper login screen
- [ ] Store real JWT tokens from backend
- [ ] Test token refresh flow
- [ ] Test token expiration handling
- [ ] Remove debug utilities in production
- [ ] Verify AsyncStorage encryption

## 📚 Related Files

- `src/stores/userStore.ts` - Token storage
- `src/services/api/notifications.service.ts` - Token usage
- `src/utils/debugAuth.ts` - Debug utilities
- `App.tsx` - Initialization

---

**Need Help?**

Run these commands and share the output:

```javascript
global.debugAuth();
global.testTokenInRequest();
```

Last Updated: March 4, 2026
