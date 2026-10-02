# Authentication Screens - Documentation

## Overview

This directory contains fully-featured, production-ready authentication screens for the TodoApp. The implementation follows best practices and uses reusable components.

## Components Created

### Screens

1. **SignInScreen** (`SignInScreen.tsx`)

   - Email/Password login
   - Social authentication (Google, Apple)
   - Password visibility toggle
   - Form validation
   - Forgot password link
   - Navigation to Sign Up

2. **SignUpScreen** (`SignUpScreen.tsx`)
   - Full name, email, and password fields
   - Password confirmation
   - Form validation
   - Social sign up (Google, Apple)
   - Navigation to Sign In

### Reusable Components

Located in `src/components/common/`:

1. **CustomInput** (`CustomInput.tsx`)

   - Flexible text input with icon support
   - Left and right icon slots
   - Error message display
   - Focus state styling
   - Fully customizable

2. **CustomButton** (`CustomButton.tsx`)

   - Multiple variants: primary, secondary, outline
   - Three sizes: small, medium, large
   - Loading state
   - Icon support (left/right)
   - Disabled state
   - Custom styling support

3. **SocialButton** (`SocialButton.tsx`)
   - Pre-configured for Google, Apple, Facebook
   - Consistent styling
   - Easy to extend for other providers

### Icons

Located in `src/assets/`:

- `icon-mail.tsx` - Email icon
- `icon-lock.tsx` - Lock/password icon
- `icon-visibility.tsx` - Show password icon
- `icon-visibility-off.tsx` - Hide password icon
- `icon-shield-person.tsx` - Authentication logo icon

## Features

### ✅ Form Validation

- Email format validation
- Password length validation (min 6 characters)
- Password confirmation matching
- Real-time error display

### ✅ User Experience

- Password visibility toggle
- Loading states
- Keyboard-aware scrolling
- Safe area handling
- Back navigation
- Smooth transitions

### ✅ Theming

- Uses theme.json colors
- Supports light/dark modes
- Consistent with app design system

### ✅ Accessibility

- Proper labels
- Touch targets
- Color contrast
- Screen reader support

## Usage Examples

### Using CustomInput

```typescript
import CustomInput from '@components/common/CustomInput';
import MailIcon from '@assets/icon-mail';

<CustomInput
  label="Email"
  placeholder="name@example.com"
  value={email}
  onChangeText={setEmail}
  keyboardType="email-address"
  leftIcon={<MailIcon size={24} color="#668583" />}
  error={emailError}
/>;
```

### Using CustomButton

```typescript
import CustomButton from '@components/common/CustomButton';

<CustomButton
  title="Sign In"
  onPress={handleSignIn}
  variant="primary"
  size="large"
  loading={isLoading}
/>;
```

### Using SocialButton

```typescript
import SocialButton from '@components/common/SocialButton';

<SocialButton provider="google" onPress={handleGoogleSignIn} />;
```

## Customization

### Colors

All colors are sourced from `config/eva/theme.json`:

- Primary: `#503291`
- Secondary: `#3C2274`
- Text colors, borders, backgrounds all from theme

### Fonts

Uses the app's font system from `@utils/fonts`:

- Urbanist family for headings
- Poppins family for body text

### Styling

All components accept custom styles via props:

- `containerStyle` - Outer container styling
- `inputStyle` - Input field styling
- `textStyle` - Text styling
- `labelStyle` - Label styling

## Integration with Firebase

To connect with Firebase Authentication:

1. **Email/Password Sign In:**

```typescript
import auth from '@react-native-firebase/auth';

const handleSignIn = async () => {
  try {
    await auth().signInWithEmailAndPassword(email, password);
  } catch (error) {
    console.error(error);
  }
};
```

2. **Email/Password Sign Up:**

```typescript
const handleSignUp = async () => {
  try {
    await auth().createUserWithEmailAndPassword(email, password);
    // Update profile with name
    await auth().currentUser?.updateProfile({ displayName: name });
  } catch (error) {
    console.error(error);
  }
};
```

3. **Google Sign In:**

```typescript
import { GoogleSignin } from '@react-native-google-signin/google-signin';

const handleGoogleSignIn = async () => {
  try {
    await GoogleSignin.hasPlayServices();
    const { idToken } = await GoogleSignin.signIn();
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    await auth().signInWithCredential(googleCredential);
  } catch (error) {
    console.error(error);
  }
};
```

4. **Apple Sign In:**

```typescript
import { appleAuth } from '@invertase/react-native-apple-authentication';

const handleAppleSignIn = async () => {
  try {
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });
    const { identityToken, nonce } = appleAuthRequestResponse;
    const appleCredential = auth.AppleAuthProvider.credential(
      identityToken,
      nonce,
    );
    await auth().signInWithCredential(appleCredential);
  } catch (error) {
    console.error(error);
  }
};
```

## Navigation Setup

The SignInScreen is already added to the TabNavigator. To use it in a stack navigator:

```typescript
import { createStackNavigator } from '@react-navigation/stack';
import SignInScreen from '@screens/SignInScreen';
import SignUpScreen from '@screens/SignUpScreen';

const AuthStack = createStackNavigator();

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="SignIn" component={SignInScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}
```

## Testing

Run the app and navigate to the "Sign In" tab to see the authentication screens in action.

```bash
npm run android
# or
npm run ios
```

## Best Practices

1. **Security**: Never store passwords in plain text
2. **Validation**: Always validate on both client and server
3. **Error Handling**: Provide clear, user-friendly error messages
4. **Loading States**: Show loading indicators during API calls
5. **Accessibility**: Ensure all elements are accessible
6. **Testing**: Write unit and integration tests for auth flows

## Future Enhancements

- [ ] Biometric authentication (Face ID, Touch ID)
- [ ] Two-factor authentication (2FA)
- [ ] Password strength indicator
- [ ] Remember me functionality
- [ ] Account recovery flow
- [ ] Email verification
- [ ] Phone number authentication

## Support

For issues or questions, refer to:

- React Native Firebase: https://rnfirebase.io/
- React Navigation: https://reactnavigation.org/
- App documentation: `/Users/M324550/Documents/MERCK_PROJECTS/REACT_NATIVE/todoApp/CLAUDE.md`
