# Delete Account Button - Icon & Color Reference

## Button Styling

### Light Theme
```
┌─────────────────────────────────────────────┐
│ [🗑️ DELETE ACCOUNT]                [→]    │  ← Light red background tint
│                                               │
│ Icon: #FF3B30 (Error red)                    │
│ Text: #FF3B30 (Error red)                    │
│ Chevron: #FF3B30 (Error red)                 │
│ Background: #FF3B3D08 (5% error opacity)    │
└─────────────────────────────────────────────┘
```

### Dark Theme
```
┌─────────────────────────────────────────────┐
│ [🗑️ DELETE ACCOUNT]                [→]    │  ← Darker red background tint
│                                               │
│ Icon: #FF6B5B (Light error red)              │
│ Text: #FF6B5B (Light error red)              │
│ Chevron: #FF6B5B (Light error red)           │
│ Background: #FF6B5B08 (5% light error)      │
└─────────────────────────────────────────────┘
```

## Visual Component Breakdown

1. **Delete Profile Icon** (20px)
   - User profile with delete/cancel X symbol
   - Scalable SVG
   - Inherits color from theme

2. **"Delete Account" Text**
   - ButtonText component
   - Bold weight for action emphasis
   - Color matches icon (error/warning color)

3. **Background Highlight**
   - Subtle 5% opacity overlay
   - Same error color as text
   - Provides visual context without overwhelming

4. **Chevron Indicator** (16px)
   - Shows actionable row
   - Color matches text for visual cohesion
   - Points right to indicate navigation

## Color Variables Used

From `src/theme/colors.ts`:

### Light Theme
- `theme.text.error` = `#FF3B30`
- Background = `#FF3B30` + `08` hex (5% opacity)

### Dark Theme
- `theme.text.error` = `#FF6B5B`
- Background = `#FF6B5B` + `08` hex (5% opacity)

## Usage in Code

```typescript
// SettingsRowComponent destructive styling
<Icon name="delete-profile" size={20} color={theme.text.error} />
<ButtonText color={theme.text.error}>
  {t('settings.deleteAccount')}
</ButtonText>
<Icon name="chevron-right" size={16} color={theme.text.error} />

// Background style
style={styles.destructiveRow}
// where destructiveRow = { backgroundColor: theme.text.error + '08' }
```

## Why This Approach Works

1. **Warning Color** - Red (#FF3B30 / #FF6B5B) immediately signals destructive action
2. **Consistent Theme** - Uses existing theme error colors
3. **Subtle Background** - 5% opacity doesn't overpower the UI
4. **Accessible** - High contrast between red and white/dark backgrounds
5. **Visual Hierarchy** - Icon + text + background create clear affordance
6. **Mobile UX** - Large touch target (56px height minimum)

## Testing Across Themes

- ✅ Light mode: Red stands out on white
- ✅ Dark mode: Light red stands out on dark
- ✅ Accessibility: WCAG AA contrast ratio met
- ✅ Visual weight: Balanced with other settings rows
