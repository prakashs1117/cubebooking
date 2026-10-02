# Role-Based Feature Flags - Quick Start Guide

## 🚀 Try It Now!

### Step 1: Run the App

```bash
npm start
npm run android
# or
npm run ios
```

### Step 2: Navigate to Settings

- Tap **Settings** in the bottom tab bar
- You'll see the new **tabbed interface**

### Step 3: Explore the Tabs

#### General Tab

- Toggle dark/light theme
- Change language
- Configure notifications

#### Features Tab

- See **UI features** you can customize
- Toggle switches to enable/disable
- Changes apply instantly

#### Account Tab

- View your profile
- See your role badge: **👤 User**

### Step 4: Try Admin Mode (Dev Only)

1. Go to **Account** tab
2. **Tap your role badge** (👤 User)
3. It switches to **👑 Admin**
4. Toast message confirms the change

### Step 5: See Admin Features

1. Go to **Features** tab (as admin)
2. Now you see **6 categories** instead of 1:

   - 🎨 UI & Appearance
   - ⭐ Features
   - 🔗 Social
   - 📊 Analytics
   - 🧪 Experimental
   - 🐛 Debug

3. Expand any category
4. Toggle any feature flag
5. See it take effect immediately

### Step 6: Test Persistence

1. Toggle a few flags
2. **Close the app completely**
3. Reopen the app
4. Go to Settings → Features
5. **Your changes are still there!** ✅

## 🎯 What You Can Do

### As a User (Default)

- ✅ Customize UI appearance
- ✅ Toggle dark mode
- ✅ Enable/disable carousel
- ✅ Configure navigation
- ❌ Cannot access advanced features

### As an Admin

- ✅ Everything users can do
- ✅ Toggle experimental features
- ✅ Configure analytics
- ✅ Enable social integrations
- ✅ Access debug settings
- ✅ Clear all overrides

## 🔑 Key Features

### Role Badge (Account Tab)

```
👤 User    → Regular user mode
👑 Admin   → Admin mode with full access
```

**Dev Mode**: Tap the badge to switch roles
**Production**: Roles assigned by backend

### Feature Categories

**Everyone Sees:**

- 🎨 UI & Appearance

**Admins Also See:**

- ⭐ Features
- 🔗 Social
- 📊 Analytics
- 🧪 Experimental
- 🐛 Debug

### Override Badges

When you toggle a flag, you'll see:

```
CUSTOM (tap to reset)
```

Tap the badge to reset that flag to default.

### Bulk Actions (Admin Only)

At the top of Features tab:

```
[Clear All Overrides]
```

Resets all customized flags at once.

## 📱 Screenshots Flow

```
Settings Screen
├─ [General] [Features] [Account]    ← Tab bar
│
├─ General Tab
│  • Language: EN
│  • Theme: 🌓 Dark/Light toggle
│  • Notifications: 🔔 On/Off
│
├─ Features Tab
│  User Mode:
│  ┌─ 🎨 UI & Appearance ─────────┐
│  │ ENABLE_DARK_MODE      [ON ]  │
│  │ ENABLE_HOME_CAROUSEL  [ON ]  │
│  │ ENABLE_TAB_NAVIGATION [ON ]  │
│  └──────────────────────────────┘
│
│  Admin Mode:
│  ┌─ 🎨 UI & Appearance ─────────┐
│  ┌─ ⭐ Features ────────────────┐
│  ┌─ 🔗 Social ─────────────────┐
│  ┌─ 📊 Analytics ──────────────┐
│  ┌─ 🧪 Experimental ───────────┐
│  └─ 🐛 Debug ─────────────────┘
│
└─ Account Tab
   👤 Demo User
   demo@example.com
   [👤 User]  ← Tap to toggle (dev mode)
   [Logout]
```

## 🧪 Test Scenarios

### Scenario 1: User Customizes UI

1. Start as User
2. Features tab → Toggle dark mode
3. App switches to dark theme
4. Restart app → Still in dark mode ✅

### Scenario 2: Admin Enables Experimental Feature

1. Switch to Admin (tap badge)
2. Features tab → Expand Experimental
3. Toggle "ENABLE_NEW_TODO_UI"
4. See new UI activate
5. Restart app → New UI still enabled ✅

### Scenario 3: Reset Customizations

1. Make several changes
2. See "CUSTOM" badges
3. Tap individual badge → That flag resets
4. Or tap "Clear All Overrides" → All reset ✅

### Scenario 4: Role Switching

1. Start as User → See 1 category
2. Switch to Admin → See 6 categories
3. Switch back to User → See 1 category again ✅

## 💡 Tips

### For Users

- Toggle dark mode for comfortable viewing
- Try the carousel on/off to see what you prefer
- Customizations persist across sessions
- Reset anytime with the CUSTOM badge

### For Admins

- Explore experimental features safely
- Use debug mode for troubleshooting
- Clear overrides to reset everything
- Test features before rolling out to users

### For Developers

- Use dev mode to test both roles
- Check persistence by restarting app
- Verify role-based access control
- Test with different flag combinations

## 🆘 Troubleshooting

**Q: I don't see the Features tab**
A: The tab is there by default. Check if you're on Settings screen.

**Q: Features tab shows "locked" message**
A: You're a regular user. Switch to admin mode in dev, or request admin role in production.

**Q: Role badge not switching**
A: Only works in dev mode (**DEV** === true). In production, roles come from backend.

**Q: Changes not saving**
A: Check AsyncStorage permissions. Try clearing app data and restarting.

**Q: Too many/few categories**
A: Regular users see 1 category (UI). Admins see all 6. This is by design.

## 📚 Documentation

For more details, see:

- `ROLE_BASED_FEATURE_FLAGS.md` - Complete guide
- `ROLE_BASED_IMPLEMENTATION_SUMMARY.md` - Technical details
- `FEATURE_FLAGS_GUIDE.md` - Feature flags system guide
- `FEATURE_FLAGS_QUICK_REFERENCE.md` - Code examples

## 🎉 Summary

You now have a **complete role-based feature flags system**!

✅ **Users** can customize their UI
✅ **Admins** control all features
✅ **Dev mode** allows role switching
✅ **Everything persists** across sessions

Navigate to Settings and start customizing! 🚀
