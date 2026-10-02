# 👨‍💻 Developer Workflow Guide — My M Safety RN App

**Purpose:** Step-by-step guide for developers on how to work with this project  
**Audience:** All developers  
**Last Updated:** May 30, 2026

---

## Table of Contents

1. [First Time Setup](#1-first-time-setup)
2. [Daily Workflow](#2-daily-workflow)
3. [Feature Development Checklist](#3-feature-development-checklist)
4. [Pre-Commit Checklist](#4-pre-commit-checklist)
5. [Code Review Process](#5-code-review-process)
6. [Troubleshooting](#6-troubleshooting)

---

## 1. First Time Setup

### Step 1: Clone & Install

```bash
# 1a. Clone the repository
git clone <repo-url>
cd react-native-mobileapp

# 1b. Install dependencies
npm install

# 1c. Install iOS dependencies (macOS only)
cd ios
bundle install
bundle exec pod install
cd ..

# 1d. Verify setup
npm run lint
npm run type-check
```

### Step 2: Read Critical Documentation

- [ ] Read `PROJECT_CONFIGURATION.md` — **code standards (MANDATORY)**
- [ ] Read `CLAUDE.md` — project overview
- [ ] Skim `PERFORMANCE.md` — performance rules
- [ ] Skim `DEVELOPMENT.md` — extended guide

### Step 3: Start Development

```bash
# Terminal 1: Start Metro bundler
npm start

# Terminal 2: Launch on your platform
npm run ios      # iOS simulator
npm run android  # Android emulator
```

Expected: App launches with Sign In screen.

### Step 4: Create Your Developer Profile

Add a file to memory:
```bash
mkdir -p .claude/projects/$(pwd | md5sum | cut -d' ' -f1)/memory

# Create memory/developer-<your-name>.md with:
# - Your role
# - What you specialize in
# - How you prefer feedback
# - Your coding style preferences
```

---

## 2. Daily Workflow

### Start of Day

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Verify everything builds
npm start
npm run lint
npm run type-check
```

### During Development

#### Creating a New Feature

1. **Create a branch**
   ```bash
   git checkout -b feature/my-feature-name
   ```

2. **Code with standards in mind**
   - Use absolute imports (`@components/X`)
   - Add cleanup to useEffect
   - Use stable keys in lists
   - Use FlashList for dynamic lists
   - Use Reanimated for animations

3. **Run checks frequently**
   ```bash
   # Before every commit
   npm run lint
   npm run format
   npm test
   npm run type-check
   ```

4. **Test on real device**
   ```bash
   # Build and deploy to physical device
   npm run ios      # Real iPhone on macOS
   npm run android  # Real Android on any OS
   ```

#### Fixing a Bug

1. **Reproduce on real device** (not simulator)
   - Gesture handlers, animations, network issues behave differently

2. **Create debug branch**
   ```bash
   git checkout -b fix/bug-description
   ```

3. **Document the fix**
   - Why it happened
   - Why this fix works
   - How to test it

4. **Add regression test**
   ```bash
   # Create a test that would have caught this bug
   echo "test: verify bug doesn't regress" >> src/__tests__/bugName.test.ts
   ```

---

## 3. Feature Development Checklist

Before starting, ensure you have:

- [ ] Read `PROJECT_CONFIGURATION.md` and understand standards
- [ ] Created a feature branch: `git checkout -b feature/name`
- [ ] Updated memory/MEMORY.md if this relates to existing patterns

### Implementation

- [ ] Use **absolute imports** only (`@components/X`)
- [ ] Use **TypeScript strict mode** (no `any` types)
- [ ] Use **TanStack Query** for server data (not useState + useEffect)
- [ ] **Clean up effects** (return cleanup function)
- [ ] Use **FlashList** for dynamic lists (never FlatList)
- [ ] Use **Reanimated 3** for animations (never core Animated)
- [ ] Use **theme tokens** for colors (useTheme hook)
- [ ] Add **stable keys** in lists (never key={index})
- [ ] Follow **naming conventions** (PascalCase components, camelCase files)

### Testing

- [ ] Write tests in `__tests__/` or `.test.tsx` file
- [ ] Test on **real iOS device** (not simulator)
- [ ] Test on **real Android device** (not emulator)
- [ ] Test **dark mode** ✓
- [ ] Test **RTL (Arabic)** ✓
- [ ] Test **network offline** scenario ✓
- [ ] Test **permission prompts** ✓

### Documentation

- [ ] Add code comments where logic is non-obvious
- [ ] Update `MEMORY.md` if you established new patterns
- [ ] Add usage examples in component/hook files
- [ ] Document any new environment variables

### Quality Gates

- [ ] `npm run lint` — passes with 0 errors ✓
- [ ] `npm run format` — code formatted ✓
- [ ] `npm run type-check` — 0 TypeScript errors ✓
- [ ] `npm test` — tests pass ✓
- [ ] No console.log statements left (use debug utils instead) ✓
- [ ] No dead code / unused imports ✓

---

## 4. Pre-Commit Checklist

Before you commit, run these checks:

```bash
# 1. Format code (auto-fixes)
npm run format

# 2. Lint (must fix manually if auto-fix fails)
npm run lint

# 3. Type check
npm run type-check

# 4. Run tests
npm test

# 5. Make sure you can build
npm run ios    # or android
```

### Commit Message Format

Follow Conventional Commits:

```
<type>(<scope>): <short summary>

<optional body explaining why>

<optional footer>
```

**Types:** `feat`, `fix`, `refactor`, `perf`, `test`, `docs`, `chore`

**Examples:**

```bash
# Good
git commit -m "feat(search): add search filter to article list"

git commit -m "fix(gesture-handler): remove double GestureHandlerRootView

This fixes swipe-dismiss not working on real iOS devices."

git commit -m "refactor(auth): migrate to new token storage pattern"

# Bad
git commit -m "fix stuff"
git commit -m "updated files"
git commit -m "work in progress"
```

### If Pre-Commit Hook Fails

Hooks run ESLint, Prettier, TypeScript check.

**If ESLint fails:**
```bash
npm run lint -- --fix     # Auto-fix what it can
# Then manually fix remaining issues
git add .
git commit -m "message"
```

**If Prettier fails:**
```bash
npm run format            # Auto-format
git add .
git commit -m "message"
```

**If TypeScript fails:**
```bash
# Fix type errors manually
npm run type-check        # View errors
# Then commit
git commit -m "message"
```

---

## 5. Code Review Process

### Before Requesting Review

- [ ] Branch is up to date: `git pull origin main && git rebase`
- [ ] All checks pass locally
- [ ] Tested on real device
- [ ] No console.log left
- [ ] Follows all standards from `PROJECT_CONFIGURATION.md`

### During Review

- [ ] Respond to all comments
- [ ] Don't just accept suggestions — understand why
- [ ] Update memory if you learn a new pattern
- [ ] Ask questions if feedback unclear

### After Approval

```bash
# 1. Merge (maintainer does this)
git merge main

# 2. Verify it still works after merge
npm run lint
npm test

# 3. Delete branch
git branch -d feature/name
```

---

## 6. Troubleshooting

### "Can't find module @components/X"

**Cause:** Relative import or typo in alias  
**Fix:**
```typescript
// ❌ Wrong
import Component from '../components/Component';

// ✅ Right
import Component from '@components/Component';
```

Check `tsconfig.json` for available aliases.

### "React hook warnings about missing dependencies"

**Cause:** useEffect dependency array is incomplete  
**Fix:**
```typescript
// ❌ Wrong - missing 'id'
useEffect(() => {
  loadData(id);
}, []); // id not in dependency array

// ✅ Right
useEffect(() => {
  loadData(id);
}, [id]); // id included
```

### "ESLint errors won't go away"

**Fix:**
```bash
npm run lint -- --fix
npm run format
npm run lint              # Re-check
git add .
git commit -m "style: fix linting issues"
```

### "TypeScript errors after npm install"

**Fix:**
```bash
npm run type-check        # See all errors
# Fix each one

# If still stuck:
rm -rf node_modules
npm install
npm run type-check
```

### "App crashes on startup"

**Fix (iOS):**
```bash
cd ios
bundle exec pod install
cd ..
npm run ios
```

**Fix (Android):**
```bash
npm run android-cache-clear
npm run clear_local_gradle_cache
npm run android
```

### "Gesture handlers not working on real device"

**Cause:** Usually missing `import 'react-native-gesture-handler'` at top of entry file  
**Fix:** Check `index.js` — must have:
```js
import 'react-native-gesture-handler';  // ← First line!
import React from 'react';
// ...
```

Also check for double `GestureHandlerRootView` wrappers (should only exist once at app root).

### "Memory leak warnings"

**Cause:** Missing cleanup in useEffect  
**Fix:**
```typescript
// ❌ Wrong - no cleanup
useEffect(() => {
  const sub = eventBus.subscribe('event', handler);
}, []);

// ✅ Right - cleanup returned
useEffect(() => {
  const sub = eventBus.subscribe('event', handler);
  return () => sub.unsubscribe();
}, []);
```

### "Tests failing locally but not in CI"

**Cause:** Usually mock data differences  
**Fix:**
```bash
# Clear test cache
npm test -- --clearCache
npm test
```

---

## Quick Commands Reference

```bash
# Development
npm start                  # Start Metro
npm run ios                # iOS simulator
npm run android            # Android emulator

# Code Quality
npm run lint               # Check linting
npm run format             # Format code
npm run type-check         # TypeScript check
npm test                   # Run tests
npm test -- --watch        # Watch mode

# Cleanup
npm run android-cache-clear
npm run clear_local_gradle_cache
rm -rf node_modules && npm install

# Git
git status
git add .
git commit -m "message"
git push origin feature/name
```

---

## Getting Help

- **Standards questions?** → Read `PROJECT_CONFIGURATION.md`
- **Code patterns?** → Check `DEVELOPMENT.md` or memory files
- **Performance issues?** → See `PERFORMANCE.md`
- **Setup problems?** → Check Troubleshooting above or `SETUP.md`
- **Project history?** → Check `.claude/projects/.../memory/MEMORY.md`

---

**Remember:** When in doubt, check the standards document and test on a real device!
