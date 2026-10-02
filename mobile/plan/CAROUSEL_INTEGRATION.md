# Carousel Integration Summary

## Overview

Integrated react-native-reanimated-carousel into the Home screen with feature flag control, JSON data configuration, and placeholder support for missing images.

## Installation

```bash
npm install react-native-reanimated-carousel
```

**Note:** This library requires `react-native-reanimated` which is already installed in the project.

## Key Features

### 1. **Feature Flag Control** ✅

```typescript
// src/config/featureFlags.ts
ENABLE_HOME_CAROUSEL: {
  key: 'ENABLE_HOME_CAROUSEL',
  name: 'Home Carousel',
  description: 'Show image carousel on home screen',
  defaultValue: true,
  environment: 'all',
  enabled: true,
}
```

**Benefits:**

- Easy toggle on/off without code changes
- Can be controlled per environment
- Testable in development

### 2. **JSON Data Configuration** ✅

```json
// src/data/carouselData.json
{
  "carouselItems": [
    {
      "id": "1",
      "title": "Welcome to the App",
      "description": "Discover amazing features and functionality",
      "imageUrl": "",
      "backgroundColor": "#4A90E2"
    }
  ]
}
```

**Benefits:**

- Easy to update content without code changes
- Supports both image URLs and placeholders
- Configurable background colors
- Simple structure for CMS integration

### 3. **Smart Placeholder Support** ✅

```typescript
// HomeCarousel.tsx
const hasImage = item.imageUrl && item.imageUrl.trim() !== '';

{
  hasImage ? (
    <Image
      source={{ uri: item.imageUrl }}
      style={styles.image}
      resizeMode="cover"
    />
  ) : (
    <View style={styles.placeholderContainer}>
      <Icon name="merck-logo" size={80} color={theme.text.secondary} />
    </View>
  );
}
```

**Benefits:**

- Automatic fallback to placeholder
- Theme-aware placeholder styling
- Graceful handling of missing images
- Professional appearance

### 4. **Theme Integration** ✅

```typescript
// Dark mode support
backgroundColor: isDark ? theme.background.card : item.backgroundColor,
color: isDark ? theme.text.primary : '#FFFFFF',
```

**Benefits:**

- Seamless dark/light mode switching
- Consistent with app theme
- Proper contrast in both modes

### 5. **Auto-play & Navigation** ✅

```typescript
<Carousel
  loop={true}
  autoplay={true}
  autoplayDelay={1000}
  autoplayInterval={4000}
  onSnapToItem={index => setActiveSlide(index)}
/>
```

**Features:**

- Automatic sliding every 4 seconds
- Infinite loop
- Touch-responsive pagination dots
- Smooth animations

## Component Structure

```
src/
├── components/
│   └── carousel/
│       └── HomeCarousel.tsx          # Main carousel component
├── data/
│   └── carouselData.json             # Carousel content data
├── config/
│   └── featureFlags.ts               # Feature flag definition
└── screens/
    └── HomeScreen.tsx                # Integration point
```

## Implementation Details

### Carousel Component (HomeCarousel.tsx)

- **Dimensions**: 85% of screen width per item
- **Height**: 240px per slide
- **Image Section**: 140px height
- **Content Section**: 100px height
- **Auto-play**: 4 second intervals
- **Loop**: Infinite scrolling

### Styling Features

- Rounded corners (16px)
- Drop shadows for depth
- Border styling
- Responsive pagination dots
- Theme-aware colors

## Usage in HomeScreen

```typescript
import HomeCarousel from '@components/carousel/HomeCarousel';
import { getFeatureFlagValue } from '@config/featureFlags';

const isCarouselEnabled = getFeatureFlagValue('ENABLE_HOME_CAROUSEL');

{
  isCarouselEnabled && (
    <View style={styles.section}>
      <View style={styles.sectionTitleContainer}>
        <Icon name="star" size={24} color={theme.text.link} />
        <Heading3>Featured</Heading3>
      </View>
      <HomeCarousel />
    </View>
  );
}
```

## Customization Options

### 1. **Update Carousel Content**

Edit `src/data/carouselData.json`:

```json
{
  "id": "6",
  "title": "Your Custom Title",
  "description": "Your description here",
  "imageUrl": "https://example.com/image.jpg",
  "backgroundColor": "#FF5733"
}
```

### 2. **Change Auto-play Speed**

In `HomeCarousel.tsx`:

```typescript
autoplayInterval={4000}  // Change to desired milliseconds
```

### 3. **Adjust Carousel Size**

```typescript
const ITEM_WIDTH = Math.round(viewportWidth * 0.85); // Adjust 0.85 (85%)
```

### 4. **Toggle Feature**

In `src/config/featureFlags.ts`:

```typescript
ENABLE_HOME_CAROUSEL: {
  enabled: false,  // Set to false to disable
}
```

## Data Structure

### CarouselItem Interface

```typescript
interface CarouselItem {
  id: string; // Unique identifier
  title: string; // Slide title
  description: string; // Slide description
  imageUrl: string; // Optional image URL (empty = placeholder)
  backgroundColor: string; // Background color (hex)
}
```

## Placeholder Behavior

| Condition                  | Behavior                                        |
| -------------------------- | ----------------------------------------------- |
| `imageUrl` is empty string | Shows Merck logo placeholder                    |
| `imageUrl` is null         | Shows Merck logo placeholder                    |
| `imageUrl` has value       | Attempts to load image from URL                 |
| Image fails to load        | React Native's Image component handles fallback |

## Performance Considerations

1. **Lazy Loading**: Images load on demand
2. **Smooth Scrolling**: Optimized snap behavior
3. **Memory Efficient**: Only renders visible slides + 1 on each side
4. **Minimal Re-renders**: Uses proper React hooks and memoization

## Accessibility

- Touch-responsive pagination
- Swipe gestures supported
- Auto-play can be controlled
- Theme-aware for visibility

## Future Enhancements

Potential improvements:

- [ ] Add video support
- [ ] Remote data fetching from API
- [ ] Analytics tracking for slide views
- [ ] Deep linking to specific slides
- [ ] Custom transitions
- [ ] CTA buttons on slides
- [ ] Progress bar instead of dots
- [ ] Parallax effects

## Summary

✅ **Feature Flag Controlled** - Easy to enable/disable
✅ **JSON Configured** - Update content without code changes
✅ **Placeholder Support** - Graceful handling of missing images
✅ **Theme Integrated** - Dark/light mode support
✅ **Auto-play** - Engaging user experience
✅ **Touch Responsive** - Interactive pagination
✅ **Production Ready** - Polished and performant

The carousel is now fully integrated and ready for use! 🎉
