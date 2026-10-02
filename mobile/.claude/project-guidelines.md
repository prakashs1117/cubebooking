# Project Guidelines for Claude Code

## Import Path Requirements

**CRITICAL**: This project enforces absolute path imports. All imports must use the configured path aliases.

### Quick Reference

```typescript
// Always use these absolute paths:
import Component from '@components/MyComponent';
import Screen from '@screens/MyScreen';
import { hook } from '@hooks/useCustomHook';
import Navigator from '@navigation/TabNavigator';
import { utility } from '@utils/helpers';
import theme from '@theme/colors';
import service from '@services/api';
import { Context } from '@context/AppContext';
import config from '@config/app';
import { t } from '@localization/i18n';
import image from '@assets/images/logo.png';
import lib from '@lib/external';

// NEVER use relative paths like:
// import Component from '../components/MyComponent';
// import Screen from '../../screens/MyScreen';
```

### Configuration

- **babel.config.js**: Module resolver with path aliases
- **tsconfig.json**: TypeScript path mapping
- **Commit 257798f**: Implementation of absolute path system

### For New Features/Components

1. Always use absolute imports from the start
2. Reference DEVELOPMENT.md for complete guidelines
3. Follow the existing pattern established in the codebase

This is a project-wide standard that must be maintained for consistency and maintainability.
