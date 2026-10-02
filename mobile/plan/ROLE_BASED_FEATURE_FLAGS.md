# Role-Based Feature Flags System

Complete guide to the role-based feature flags system with user and admin access control.

## Overview

The app now features a **role-based feature flags system** where:

- **Regular Users** can toggle **UI-related feature flags** (like dark/light theme, carousel, etc.)
- **Admin Users** can access **all feature flags** including features, experimental flags, analytics, debug settings, and social integrations

## Architecture

```
┌─────────────────────────────────────────┐
│   User Store (Zustand + AsyncStorage)  │
│   - Current user                         │
│   - Role (user/admin)                    │
│   - Role checking                        │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Settings Screen with Tabs             │
│   ├─ General Tab                         │
│   ├─ Features Tab (Role-based access)   │
│   └─ Account Tab                         │
└────────────┬────────────────────────────┘
             │
             ▼
┌─────────────────────────────────────────┐
│   Feature Flags by Category             │
│   • UI (user-accessible)                 │
│   • Features (admin-only)                │
│   • Social (admin-only)                  │
│   • Analytics (admin-only)               │
│   • Experimental (admin-only)            │
│   • Debug (admin-only)                   │
└──────────────────────────────────────────┘
```

## User Roles

### User Role (Default)

- **Access**: UI-related feature flags only
- **Permissions**:
  - ✅ Toggle dark/light theme
  - ✅ Enable/disable carousel
  - ✅ Toggle drawer navigation
  - ✅ Toggle tab navigation
  - ✅ Other UI customizations
  - ❌ Cannot access advanced features
  - ❌ Cannot access debug settings
  - ❌ Cannot access experimental features

### Admin Role

- **Access**: ALL feature flags across all categories
- **Permissions**:
  - ✅ Everything regular users can do
  - ✅ Toggle experimental features
  - ✅ Enable/disable analytics
  - ✅ Configure social integrations
  - ✅ Access debug settings
  - ✅ Control feature rollouts
  - ✅ Clear all overrides
  - ✅ Reset to defaults

## Settings Screen Structure

The new **Settings Screen** has **3 tabs**:

### 1. General Tab

Common settings available to all users:

- Language selection
- Theme toggle (Dark/Light)
- Notifications
- Reset first launch guide
- Other general preferences

### 2. Features Tab

**Role-based feature flag access**:

#### For Regular Users:

Shows only **UI category** flags:

- `ENABLE_HOME_CAROUSEL` - Show image carousel on home screen
- `ENABLE_DRAWER_NAVIGATION` - Enable drawer menu
- `ENABLE_TAB_NAVIGATION` - Enable bottom tab bar
- `ENABLE_DARK_MODE` - Toggle between dark and light themes

#### For Admin Users:

Shows **ALL categories**:

- **UI** (🎨) - UI & Appearance
- **Features** (⭐) - Core functionality
- **Social** (🔗) - Social integrations
- **Analytics** (📊) - Analytics and tracking
- **Experimental** (🧪) - Experimental features
- **Debug** (🐛) - Development and debugging

### 3. Account Tab

User profile and account management:

- Profile information
- Role badge (User/Admin)
- Logout button
- In dev mode: Tap role badge to toggle between User and Admin

## Usage

### For Regular Users

1. **Navigate to Settings**

   - Tap Settings in the bottom tab bar
   - Or open drawer menu and select Settings

2. **Switch to Features Tab**

   - Tap the "Features" tab at the top

3. **Toggle UI Features**

   - See all available UI customization options
   - Toggle switches to enable/disable features
   - Changes apply immediately

4. **Customized Flags Show "CUSTOM"**
   - Flags you've toggled show a "CUSTOM" badge
   - Tap the badge to reset to default

### For Admin Users

1. **Switch to Admin Role**

   - In dev mode: Tap your role badge in the Account tab
   - Production: Assigned admin role via backend

2. **Access All Features**

   - Navigate to Features tab
   - See all 6 categories organized by type
   - Expand any category to view flags

3. **Toggle Any Flag**

   - Use switches to enable/disable
   - Changes persist across app restarts
   - Overrides shown with "CUSTOM" badge

4. **Bulk Actions**
   - "Clear All Overrides" - Reset all customizations
   - Available at top of Features tab

## Implementation Files

### Core Files

**User Store**

```
src/stores/userStore.ts
```

- Manages user authentication
- Handles role assignment
- Provides role checking hooks

**Tabbed Settings Screen**

```
src/screens/SettingsScreenTabbed.tsx
```

- Three-tab interface
- Role-based feature flag display
- User profile management

**Navigation Updates**

```
src/navigation/TabNavigator.tsx
src/navigation/DrawerNavigator.tsx
```

- Integrated new tabbed settings screen

### Hooks

```typescript
import { useIsAdmin, useCurrentUser } from '@stores/userStore';

// Check if current user is admin
const isAdmin = useIsAdmin();

// Get current user details
const currentUser = useCurrentUser();
```

## Code Examples

### Check User Role

```typescript
import { useIsAdmin } from '@stores/userStore';

const MyComponent = () => {
  const isAdmin = useIsAdmin();

  return <View>{isAdmin ? <AdminPanel /> : <UserPanel />}</View>;
};
```

### Toggle Admin Mode (Dev Only)

```typescript
import { useUserStore } from '@stores/userStore';

const DevTools = () => {
  const toggleAdminMode = useUserStore(state => state.toggleAdminMode);

  return <Button title="Toggle Admin" onPress={toggleAdminMode} />;
};
```

### Role-Based Feature Access

```typescript
import { useIsAdmin } from '@stores/userStore';
import { useFeatureFlagsByCategory } from '@hooks/useFeatureFlag';

const FeatureSettings = () => {
  const isAdmin = useIsAdmin();

  // Users see only UI flags
  const uiFlags = useFeatureFlagsByCategory('ui');

  // Admins can also access experimental flags
  const experimentalFlags = isAdmin
    ? useFeatureFlagsByCategory('experimental')
    : {};

  return (
    <View>
      {/* UI flags for everyone */}
      <FlagSection flags={uiFlags} />

      {/* Experimental flags only for admins */}
      {isAdmin && <FlagSection flags={experimentalFlags} />}
    </View>
  );
};
```

## Feature Flag Categories

### UI (User-Accessible)

All users can toggle these:

- `ENABLE_HOME_CAROUSEL` - Image carousel
- `ENABLE_DRAWER_NAVIGATION` - Drawer menu
- `ENABLE_TAB_NAVIGATION` - Bottom tabs
- `ENABLE_DARK_MODE` - Dark theme

### Features (Admin-Only)

Core functionality toggles:

- `ENABLE_ONBOARDING` - First launch guide
- `ENABLE_OFFLINE_SYNC` - Background sync
- `ENABLE_PUSH_NOTIFICATIONS` - Push notifications
- `ENABLE_BIOMETRIC_AUTH` - Fingerprint/Face ID

### Social (Admin-Only)

Social integration settings:

- `ENABLE_SOCIAL_LOGIN_GOOGLE` - Google login
- `ENABLE_SOCIAL_LOGIN_APPLE` - Apple login
- `ENABLE_SOCIAL_LOGIN_FACEBOOK` - Facebook login

### Analytics (Admin-Only)

Tracking and monitoring:

- `ENABLE_ANALYTICS` - User analytics
- `ENABLE_PERFORMANCE_MONITORING` - Performance tracking

### Experimental (Admin-Only)

New features in testing:

- `ENABLE_NEW_TODO_UI` - Enhanced UI
- `ENABLE_REAL_TIME_UPDATES` - Live updates
- `ENABLE_AI_FEATURES` - AI recommendations

### Debug (Admin-Only)

Development tools:

- `SHOW_DEBUG_INFO` - Debug panel
- `ENABLE_FEATURE_FLAGS_SCREEN` - Full flags screen

## Development Mode Features

### Toggle Admin Role

In development mode, you can easily switch between user and admin roles:

1. Navigate to Settings → Account tab
2. Tap your role badge (User/Admin)
3. Role switches instantly
4. Toast notification confirms the change

### Initialize Demo User

The app automatically creates a demo user on first launch:

```typescript
// In App.tsx
initializeDemoUser();
```

Default demo user:

- Name: "Demo User"
- Email: "demo@example.com"
- Role: "user"

### Toggle Between Roles

```typescript
import { useUserStore } from '@stores/userStore';

// In any component
const toggleAdminMode = useUserStore(state => state.toggleAdminMode);
toggleAdminMode(); // Switches between user and admin
```

## Production Deployment

### Setting User Roles

In production, user roles should be set via your authentication system:

```typescript
import { useUserStore } from '@stores/userStore';

// After successful login
const setUser = useUserStore.getState().setUser;

setUser({
  id: userData.id,
  email: userData.email,
  name: userData.name,
  role: userData.role, // 'user' or 'admin' from backend
  avatar: userData.avatar,
});
```

### Backend Integration

Your backend should:

1. Assign roles to users in the database
2. Return role in authentication response
3. Verify role permissions for sensitive operations
4. Audit admin actions

### Security Considerations

⚠️ **Important**: Feature flag access is controlled client-side. For sensitive operations:

1. **Always verify permissions on the backend**
2. **Don't rely solely on client-side role checks**
3. **Audit admin feature flag changes**
4. **Implement proper authentication**

Example backend check:

```javascript
// Backend API
app.post('/api/feature-flags', authenticateUser, (req, res) => {
  // Verify user has admin role
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized' });
  }

  // Allow admin to update flags
  // ...
});
```

## Migration from Old Settings

### Before (Old SettingsScreen)

- Single scrollable view
- All settings in one screen
- Dev mode feature flags at bottom
- No role-based access

### After (New SettingsScreenTabbed)

- ✅ Three organized tabs
- ✅ Role-based feature flag access
- ✅ Better organization
- ✅ Scalable architecture
- ✅ User-friendly interface

### Switching Back (If Needed)

To use the old settings screen:

```typescript
// In TabNavigator.tsx
import SettingsScreen from '@screens/SettingsScreen';

// Replace
component = { SettingsScreenTabbed };
// With
component = { SettingsScreen };
```

## Benefits

### For Users

- ✅ Simple UI customization
- ✅ Easy to find settings
- ✅ Immediate visual feedback
- ✅ Clear feature descriptions
- ✅ Can reset customizations

### For Admins

- ✅ Complete control over all features
- ✅ Easy feature rollout management
- ✅ Organized by category
- ✅ Bulk override management
- ✅ Debug and experimental access

### For Developers

- ✅ Role-based access control
- ✅ Easy to add new categories
- ✅ Persistent across sessions
- ✅ TypeScript type safety
- ✅ Dev mode admin toggle

## Troubleshooting

### Q: How do I switch to admin mode?

A: In dev mode, tap your role badge in the Account tab. In production, admin role is assigned by your backend.

### Q: User can't see feature flags

A: Regular users only see UI flags in the Features tab. This is expected behavior.

### Q: Changes not persisting

A: Both user role and feature flag overrides are persisted to AsyncStorage. Check storage permissions.

### Q: How to reset everything?

A: Admin users can tap "Clear All Overrides" in the Features tab, or use the reset button in FeatureFlagsManagementScreen.

### Q: Can users become admins?

A: In dev mode, yes (tap role badge). In production, roles must be assigned by your backend authentication system.

## Summary

The role-based feature flags system provides:

🎯 **User Empowerment** - Users control their UI experience
🔐 **Admin Control** - Admins manage all features
📱 **Clean Interface** - Organized tabs and categories
💾 **Persistence** - Settings saved across sessions
🧪 **Dev-Friendly** - Easy role switching in dev mode
🔒 **Production-Ready** - Backend role integration

Users can customize their experience, while admins have full control over feature rollouts and experimental features!
