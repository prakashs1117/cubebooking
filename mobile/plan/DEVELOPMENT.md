# Development Guidelines

## Path Configuration

### Absolute Path Imports (REQUIRED)

This project is configured to use absolute path imports instead of relative paths. **All new code must use absolute paths.**

#### Configuration Files

The absolute path configuration is implemented in:

1. **babel.config.js** - Module resolver configuration
2. **tsconfig.json** - TypeScript path mapping

#### Available Path Aliases

Use these absolute path aliases in your imports:

```typescript
import Component from '@/components/MyComponent'; // ./src/components/MyComponent
import Screen from '@screens/MyScreen'; // ./src/screens/MyScreen
import { useCustomHook } from '@hooks/useCustomHook'; // ./src/hooks/useCustomHook
import Navigator from '@navigation/TabNavigator'; // ./src/navigation/TabNavigator
import { utility } from '@utils/helpers'; // ./src/utils/helpers
import theme from '@theme/colors'; // ./src/theme/colors
import service from '@services/api'; // ./src/services/api
import { Context } from '@context/AppContext'; // ./src/context/AppContext
import config from '@config/app'; // ./src/config/app
import { t } from '@localization/i18n'; // ./src/localization/i18n
import image from '@assets/images/logo.png'; // ./src/assets/images/logo.png
import lib from '@lib/external'; // ./src/lib/external
```

#### Examples

✅ **CORRECT - Use absolute paths:**

```typescript
import CustomText from '@components/common/CustomText';
import { useTodos } from '@hooks/useTodos';
import HomeScreen from '@screens/HomeScreen';
```

❌ **INCORRECT - Do NOT use relative paths:**

```typescript
import CustomText from '../components/common/CustomText';
import { useTodos } from './hooks/useTodos';
import HomeScreen from '../../screens/HomeScreen';
```

#### Why Absolute Paths?

1. **Maintainability**: Easier to refactor and move files
2. **Readability**: Clear indication of where components come from
3. **Consistency**: Uniform import style across the codebase
4. **IDE Support**: Better autocomplete and navigation

#### Setup for New Developers

The configuration is already in place. No additional setup required beyond:

```sh
npm install
# or
yarn install
```

## Implementation History

- **Commit 257798f**: "[Absolute path] - changed relative path to Absolute path"
  - Configured babel.config.js with module-resolver plugin
  - Updated tsconfig.json with path mappings
  - Converted all existing relative imports to absolute paths

## Enforcement

All new code and modifications should use absolute paths. This is a project-wide standard that must be maintained for consistency and maintainability.

## Native Splash Screen

The project includes a fully configured **native splash screen** implementation:

- **Implementation**: Native iOS and Android splash screens (zero dependencies)
- **Platforms**: iOS and Android fully supported with OS-native handling
- **Performance**: Fast, reliable, and compatible with React Native's new architecture
- **Documentation**: See [NATIVE_SPLASH_SCREEN_GUIDE.md](./NATIVE_SPLASH_SCREEN_GUIDE.md) for detailed customization

### Quick Splash Screen Facts:

- Zero JavaScript dependencies - fully native implementation
- Professional blue-to-purple gradient design with customizable branding
- Easily replaceable images for different projects using the provided guide
- Automatic OS-handled transitions and proper scaling for all device sizes
- Production-ready and compatible with React Native's new architecture
