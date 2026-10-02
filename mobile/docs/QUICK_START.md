# Quick Start — Clean Slate Mobile App

## 1. Start the Dev Server

```bash
cd mobile
npx react-native start --reset-cache
```

You should see:
```
Welcome to React Native v0.85
Starting dev server on http://localhost:8081
```

## 2. Run on iOS

In a separate terminal:
```bash
npx react-native run-ios
```

Or open `mobile/ios/DEMAND_MANAGEMENT_LATEST.xcworkspace` in Xcode and hit Run (Cmd+R).

## 3. Test the Flow

**On first launch:**
- Sign In screen appears
- Enter any email/password (they're not validated)
- Tap "Sign In" → you're logged in

**After login:**
- Home tab is active
- Bottom tabs visible: Home | News | Search | Notifications | Settings
- Tap each tab → placeholder content shown
- Tap hamburger (☰) top-left → drawer slides in
- Drawer shows Profile: "John Doe" + Logout button
- Tap Logout → back to Sign In

## 4. Add Your First Feature

### Example: Display a Blog Post List on Home

1. **Edit `src/screens/new/HomeScreen.tsx`:**

```typescript
import { useQuery } from '@tanstack/react-query';

export default function HomeScreen() {
  // ... existing code ...
  
  // Fetch blog posts (when you have a service)
  const { data: posts } = useQuery({
    queryKey: ['posts'],
    queryFn: async () => {
      // const response = await fetch('/api/posts');
      // return response.json();
      return [
        { id: 1, title: 'First Post', excerpt: 'Coming soon...' },
      ];
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* ... header ... */}
      <View style={styles.content}>
        {posts?.map(post => (
          <View key={post.id}>
            <CustomText variant="heading2">{post.title}</CustomText>
            <CustomText>{post.excerpt}</CustomText>
          </View>
        ))}
      </View>
    </SafeAreaView>
  );
}
```

2. Run the app — you'll see "First Post" on the Home tab

3. Replace the mock data with a real API call

## 5. Component Cheat Sheet

### Text
```typescript
import CustomText from '@/components/common/CustomText';

<CustomText variant="heading1">Large Title</CustomText>
<CustomText variant="heading2">Medium Title</CustomText>
<CustomText variant="bodyText">Normal text</CustomText>
```

### Button
```typescript
import CustomButton from '@/components/common/CustomButton';

<CustomButton 
  label="Click me" 
  onPress={() => console.log('Tapped!')} 
/>
```

### Input
```typescript
import CustomInput from '@/components/common/CustomInput';

<CustomInput 
  placeholder="Enter email" 
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
/>
```

### Theme
```typescript
import { useTheme } from '@/theme/ThemeContext';

const { theme } = useTheme();

// Use colors:
// theme.background.primary
// theme.text.primary
// theme.button.primary.background
// theme.border.primary
```

### Icons
```typescript
import HomeIcon from '@/components/icons/components/HomeIcon';

<HomeIcon width={24} height={24} color="#000" />
```

### Data Fetching
```typescript
import { useQuery } from '@tanstack/react-query';

const { data, isLoading, error } = useQuery({
  queryKey: ['todos'], // cache key
  queryFn: async () => {
    const res = await fetch('/api/todos');
    return res.json();
  },
});

if (isLoading) return <CustomText>Loading...</CustomText>;
if (error) return <CustomText>Error!</CustomText>;
return <CustomText>{data.length} todos</CustomText>;
```

## 6. File Locations

| What | Where |
|------|-------|
| Screens | `src/screens/new/` |
| Components | `src/components/` |
| Services (API) | `src/services/api/` |
| Theme | `src/theme/` |
| Navigation | `src/navigation/` |
| Hooks | `src/hooks/` |
| Utilities | `src/utils/` |

## 7. Common Tasks

### Add a New Tab
1. Create screen: `src/screens/new/MyNewScreen.tsx`
2. Import in `src/navigation/TabNavigator.tsx`
3. Add to Tab.Screen list

### Connect to Your API
1. Create service: `src/services/api/myfeature.service.ts`
2. Use in screen: `const { data } = useQuery({ queryFn: () => myfeatureService.list() })`

### Use a Zustand Store
```typescript
import { useUserStore } from '@stores/userStore'; // or any store

const { user, updateUser } = useUserStore();
```

### Add Navigation
```typescript
import { useNavigation } from '@react-navigation/native';

const navigation = useNavigation();

<CustomButton 
  label="Go to Details" 
  onPress={() => navigation.navigate('Details')} 
/>
```

## 8. Troubleshooting

### "Metro error: Cannot find module '@screens/...'"
- Check the file exists in `src/screens/new/`
- Verify path alias in `tsconfig.json` is correct

### "App shows white screen"
- Check React Native console for errors
- Check that all imports are absolute paths (start with `@/`)

### "Sign In doesn't work"
- It doesn't call a real API; tap any email/password
- `AuthContext.login()` just sets local state

### "Icons not showing"
- Icon file must exist in `src/components/icons/components/`
- Pass `color`, `width`, `height` props

---

**You're all set. Start building!**
