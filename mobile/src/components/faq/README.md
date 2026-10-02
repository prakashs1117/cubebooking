# FAQ Components

Beautiful, reusable components for displaying Frequently Asked Questions with search, filtering, and expandable items.

## Overview

The FAQ system provides a complete solution for displaying and searching through frequently asked questions. It's built with a clean component architecture and supports:

- 🔍 **Real-time search** across questions, answers, and tags
- 🏷️ **Category filtering** with beautiful chip-based UI
- 📱 **Expand/collapse** animations for answers
- 🌐 **Multi-language support** (EN, FR, AR)
- 🎨 **Dark/light theme** integration
- 📊 **Data from JSON or API** (easily switchable)
- ♿ **Accessibility** built-in
- 🚀 **Performance optimized** with caching

## Architecture

```
┌─────────────────────────────────────────┐
│            FAQScreen                     │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  FAQSearchBar                   │   │
│  │  - Search input                 │   │
│  │  - Clear button                 │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  FAQCategoryFilter              │   │
│  │  - Horizontal scroll chips      │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  FAQItem (Expandable)           │   │
│  │  - Question with icon           │   │
│  │  - Animated answer              │   │
│  │  - Tags                         │   │
│  └────────────────────────────────┘   │
│                                         │
│  ┌────────────────────────────────┐   │
│  │  FAQEmptyState                  │   │
│  │  - No results message           │   │
│  └────────────────────────────────┘   │
└─────────────────────────────────────────┘
```

## Components

### FAQSearchBar

Beautiful search bar with clear button and animations.

**Props:**

- `value: string` - Current search text
- `onChangeText: (text: string) => void` - Search text change handler
- `placeholder?: string` - Placeholder text
- `onFocus?: () => void` - Focus handler
- `onBlur?: () => void` - Blur handler

**Features:**

- Animated border on focus
- Clear button with scale animation
- Search icon
- Smooth transitions

**Example:**

```tsx
<FAQSearchBar
  value={searchQuery}
  onChangeText={setSearchQuery}
  placeholder="Search FAQs..."
/>
```

---

### FAQItem

Expandable/collapsible FAQ item with smooth animations.

**Props:**

- `item: FAQItemType` - FAQ data (question, answer, tags, etc.)
- `isExpanded?: boolean` - Control expanded state
- `onToggle?: () => void` - Toggle handler

**Features:**

- Smooth expand/collapse animation
- Optional icon display
- Tag display
- Chevron rotation animation
- Accessibility support

**Example:**

```tsx
<FAQItem
  item={{
    id: 'faq-1',
    question: 'How do I reset my password?',
    answer: 'Go to login screen and tap "Forgot Password?"...',
    category: 'account',
    tags: ['password', 'reset'],
    order: 1,
    icon: 'key',
  }}
  isExpanded={expandedId === 'faq-1'}
  onToggle={() => handleToggle('faq-1')}
/>
```

---

### FAQCategoryFilter

Horizontal scrollable category filter with chips.

**Props:**

- `categories: FAQCategory[]` - Array of categories
- `selectedCategory: string | null` - Currently selected category
- `onSelectCategory: (id: string | null) => void` - Selection handler
- `showAllOption?: boolean` - Show "All" option (default: true)
- `allOptionLabel?: string` - Label for "All" option

**Features:**

- Horizontal scroll
- Icon + text chips
- Active state styling
- Smooth transitions

**Example:**

```tsx
<FAQCategoryFilter
  categories={categories}
  selectedCategory={selectedCategory}
  onSelectCategory={setSelectedCategory}
  showAllOption
  allOptionLabel="All Categories"
/>
```

---

### FAQEmptyState

Empty state component for no results.

**Props:**

- `title: string` - Empty state title
- `message: string` - Empty state message
- `icon?: string` - Icon name (default: 'search')

**Example:**

```tsx
<FAQEmptyState
  title="No results found"
  message="Try different keywords or browse by category"
  icon="search"
/>
```

---

## Hooks

### useFAQData

Custom hook for fetching and managing FAQ data.

**Returns:**

- `faqs: FAQItem[]` - Array of FAQ items
- `categories: FAQCategory[]` - Array of categories
- `isLoading: boolean` - Loading state
- `error: string | null` - Error message
- `source: 'json' | 'api' | 'cache'` - Data source
- `refresh: () => Promise<void>` - Refresh data
- `clearCache: () => void` - Clear cache
- `prefetch: () => Promise<void>` - Prefetch data
- `searchFAQs: (query: string) => FAQItem[]` - Search function
- `getFAQsByCategory: (categoryId: string) => FAQItem[]` - Filter function

**Example:**

```tsx
const { faqs, categories, isLoading, error, searchFAQs, getFAQsByCategory } =
  useFAQData();

// Search
const results = searchFAQs('password');

// Filter by category
const accountFAQs = getFAQsByCategory('account');
```

---

## Data Structure

### FAQItem

```typescript
interface FAQItem {
  id: string; // Unique identifier
  question: string; // The question
  answer: string; // The answer
  category: string; // Category ID
  tags: string[]; // Searchable tags
  order: number; // Display order
  icon?: string; // Optional icon name
}
```

### FAQCategory

```typescript
interface FAQCategory {
  id: string; // Unique identifier
  name: string; // Display name
  icon: string; // Icon name
  order: number; // Display order
}
```

---

## Service Layer

### faqService.ts

Manages data fetching with support for both JSON and API sources.

**Configuration:**

```typescript
const FAQ_CONFIG = {
  source: 'json' as 'json' | 'api', // Switch between JSON and API
  apiEndpoint: '/api/faq', // API endpoint
  cacheEnabled: true, // Enable/disable cache
};
```

**Functions:**

- `getFAQData()` - Fetch FAQ data (with caching)
- `clearFAQCache()` - Clear cache
- `prefetchFAQData()` - Prefetch for performance
- `configureFAQService(config)` - Update configuration

**Switching to API:**

```typescript
import { configureFAQService } from '@services/faqService';

configureFAQService({
  source: 'api',
  apiEndpoint: 'https://api.example.com/faq',
});
```

---

## Data Source

### JSON File Structure

Location: `src/data/faq/faq.json`

```json
{
  "version": "1.0",
  "lastUpdated": "2026-02-28",
  "languages": {
    "en": {
      "categories": [
        {
          "id": "getting-started",
          "name": "Getting Started",
          "icon": "rocket",
          "order": 1
        }
      ],
      "items": [
        {
          "id": "faq-1",
          "question": "How do I create an account?",
          "answer": "Creating an account is simple!...",
          "category": "getting-started",
          "tags": ["signup", "account"],
          "order": 1,
          "icon": "user-plus"
        }
      ]
    }
  }
}
```

---

## Integration

### Adding FAQ to Navigation

1. **Add to DrawerNavigator** (already done):

```tsx
<Drawer.Screen
  name="FAQ"
  component={FAQScreen}
  options={{
    drawerLabel: 'FAQ',
    headerTitle: 'FAQ',
  }}
/>
```

2. **Add to CustomHeader** (already done):

```tsx
{
  showFAQ && (
    <TouchableOpacity onPress={() => navigation.navigate('FAQ')}>
      <Icon name="help-circle" size={24} />
    </TouchableOpacity>
  );
}
```

3. **Feature Flag** (already done):

```json
"ENABLE_FAQ": {
  "enabled": true,
  "description": "Show FAQ icon in header and screen in drawer",
  "rolloutPercentage": 100,
  "environments": ["development", "staging", "production"]
}
```

---

## Usage Examples

### Basic Implementation

```tsx
import React from 'react';
import { View } from 'react-native';
import { FAQSearchBar, FAQItem, FAQCategoryFilter } from '@components/faq';
import { useFAQData } from '@hooks/useFAQData';

const MyFAQScreen = () => {
  const { faqs, categories, searchFAQs } = useFAQData();
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = searchQuery ? searchFAQs(searchQuery) : faqs;

  return (
    <View>
      <FAQSearchBar value={searchQuery} onChangeText={setSearchQuery} />
      <FAQCategoryFilter
        categories={categories}
        selectedCategory={null}
        onSelectCategory={() => {}}
      />
      {filteredFAQs.map(faq => (
        <FAQItem key={faq.id} item={faq} />
      ))}
    </View>
  );
};
```

### With Category Filtering

```tsx
const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

const filteredFAQs = useMemo(() => {
  let result = faqs;

  if (selectedCategory) {
    result = getFAQsByCategory(selectedCategory);
  }

  if (searchQuery) {
    result = searchFAQs(searchQuery);
    if (selectedCategory) {
      result = result.filter(faq => faq.category === selectedCategory);
    }
  }

  return result;
}, [faqs, selectedCategory, searchQuery]);
```

### With Expand/Collapse Control

```tsx
const [expandedId, setExpandedId] = useState<string | null>(null);

const handleToggle = (id: string) => {
  setExpandedId(expandedId === id ? null : id);
};

<FAQItem
  item={faq}
  isExpanded={expandedId === faq.id}
  onToggle={() => handleToggle(faq.id)}
/>;
```

---

## Styling

All components use the theme system for consistent styling:

```tsx
const { theme } = useTheme();

// Colors are applied from theme
backgroundColor: theme.background.card;
color: theme.text.primary;
borderColor: theme.border.secondary;
```

---

## Accessibility

All components include proper accessibility props:

- **Search bar**: `accessibilityLabel`, `accessibilityRole`
- **Category chips**: `accessibilityState` for selection
- **FAQ items**: `accessibilityState` for expanded state, `accessibilityHint`

---

## Performance

### Caching Strategy

- FAQ data cached for 5 minutes
- Source indicator shows where data came from (json/api/cache)
- Manual refresh available via pull-to-refresh

### Optimizations

- `useMemo` for filtered results
- Animated values for smooth UI
- Layout animation for expand/collapse
- Lazy rendering for large lists

---

## Localization

Supports multiple languages with full RTL support:

```json
{
  "languages": {
    "en": {
      /* English content */
    },
    "fr": {
      /* French content */
    },
    "ar": {
      /* Arabic content with RTL */
    }
  }
}
```

The hook automatically selects the correct language based on i18n settings.

---

## API Integration

To switch from JSON to API:

1. **Update service configuration**:

```typescript
configureFAQService({
  source: 'api',
  apiEndpoint: 'https://your-api.com/faq',
});
```

2. **API Response Format**:

```json
{
  "success": true,
  "data": {
    "version": "1.0",
    "lastUpdated": "2026-02-28",
    "languages": {
      "en": {
        "categories": [...],
        "items": [...]
      }
    }
  },
  "timestamp": "2026-02-28T..."
}
```

3. **Error Handling**:
   The service automatically handles errors and provides fallback behavior.

---

## Future Enhancements

Potential improvements:

1. **Analytics**

   - Track most searched questions
   - Monitor popular categories
   - Measure answer helpfulness

2. **Feedback**

   - "Was this helpful?" buttons
   - Report incorrect answers
   - Request new FAQs

3. **Smart Search**

   - Fuzzy matching
   - Synonyms support
   - Search suggestions

4. **Personalization**

   - Recently viewed FAQs
   - Bookmarked questions
   - Recommended based on usage

5. **Rich Content**
   - Images in answers
   - Video tutorials
   - Code snippets
   - Interactive demos

---

## Troubleshooting

### FAQ data not loading

Check:

1. JSON file exists at `src/data/faq/faq.json`
2. Service configuration is correct
3. Network connection (if using API)
4. Cache might need clearing

### Search not working

Check:

1. Search query is being passed correctly
2. FAQ items have proper fields (question, answer, tags)
3. No whitespace-only queries

### Expand/collapse not working

Check:

1. `isExpanded` prop is controlled correctly
2. `onToggle` handler is implemented
3. LayoutAnimation is enabled on Android

---

## Support

For issues or questions:

- Check the FAQ screen demo: `FAQScreen.tsx`
- Review type definitions: `src/types/faq.types.ts`
- Examine service: `src/services/faqService.ts`

---

**Created:** 2026-02-28
**Version:** 1.0
**Status:** ✅ Production Ready
