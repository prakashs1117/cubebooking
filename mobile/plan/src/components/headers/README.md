# Header Components System

This directory contains three different header types that can be switched dynamically based on platform configuration.

## Header Types

### HeaderType1 - Full Gradient Header

- **File**: `HeaderType1.tsx`
- **Description**: Complete header with gradient background showing full event information
- **Features**:
  - Event name and theme
  - Venue location with icon
  - Event dates with calendar icon
  - Colored background (uses theme primary color)
  - RTL language support
- **Props**: Requires `eventData` object
- **Use Case**: Main events screen with full branding

### HeaderType2 - Minimal Header

- **File**: `HeaderType2.tsx`
- **Description**: Minimal header with only drawer menu button
- **Features**:
  - Hamburger menu icon only
  - No background color
  - Transparent design
  - Minimal padding
- **Props**: None required
- **Use Case**: Clean, distraction-free interface

### HeaderType3 - No Header

- **File**: `HeaderType3.tsx`
- **Description**: Empty component that renders nothing
- **Features**:
  - Returns null
  - Completely hides header
  - Maximum screen space
- **Props**: None
- **Use Case**: Full-screen immersive experiences

## Configuration

Headers are controlled via the platform configuration file:

**File**: `config/eva/platformconfig.json`

```json
{
  "ui": {
    "headerType": "type1" // Options: "type1", "type2", "type3"
  }
}
```

### Available Options:

- `"type1"` - Full gradient header (default)
- `"type2"` - Minimal header with menu only
- `"type3"` - No header

## Usage

### In Screens

```typescript
import { getHeaderComponent } from '@utils/headerSelector';
import { EventData } from '@services/eventsService';

// Inside your component
const MyScreen = () => {
  const [eventData, setEventData] = useState<EventData | null>(null);

  return (
    <View style={styles.container}>
      {/* Header will automatically render based on config */}
      {getHeaderComponent(eventData)}

      {/* Rest of your content */}
    </View>
  );
};
```

### Using the Hook

```typescript
import { useHeaderComponent } from '@utils/headerSelector';

const MyScreen = () => {
  const [eventData, setEventData] = useState<EventData | null>(null);
  const header = useHeaderComponent({ eventData });

  return (
    <View style={styles.container}>
      {header}
      {/* Rest of your content */}
    </View>
  );
};
```

## How It Works

1. **Configuration**: The header type is set in `platformconfig.json`
2. **Selection**: `headerSelector.tsx` reads the config and returns the appropriate component
3. **Rendering**: The screen renders the selected header dynamically
4. **Runtime Switch**: Change the config value to switch headers without code changes

## Utility Functions

### `getHeaderType()`

**File**: `src/utils/platformConfig.ts`

```typescript
const headerType = getHeaderType(); // Returns: 'type1' | 'type2' | 'type3'
```

### `getHeaderComponent(eventData?)`

**File**: `src/utils/headerSelector.tsx`

```typescript
const header = getHeaderComponent(eventData); // Returns React component
```

### `useHeaderComponent(props?)`

**File**: `src/utils/headerSelector.tsx`

```typescript
const header = useHeaderComponent({ eventData }); // React hook version
```

## Adding New Header Types

To add a new header type:

1. Create new component: `src/components/headers/HeaderType4.tsx`
2. Export from: `src/components/headers/index.ts`
3. Update type in: `src/utils/platformConfig.ts`
   ```typescript
   export interface PlatformUI {
     headerType: 'type1' | 'type2' | 'type3' | 'type4';
   }
   ```
4. Add case in: `src/utils/headerSelector.tsx`
   ```typescript
   case 'type4':
     return <HeaderType4 {...props} />;
   ```
5. Document the new type in this README

## Implementation Example

Current implementation in `EventsScreen.tsx`:

```typescript
import { getHeaderComponent } from '@utils/headerSelector';

const EventsScreen = () => {
  const [eventData, setEventData] = useState<EventData | null>(null);

  return (
    <View style={styles.container}>
      {/* Configurable header - switches based on platformConfig */}
      {getHeaderComponent(eventData)}

      {/* Statistics */}
      <View style={styles.statsContainer}>{/* ... */}</View>

      {/* Rest of content */}
    </View>
  );
};
```

## Testing Different Headers

To test different header types, simply change the value in `platformconfig.json`:

1. Open: `config/eva/platformconfig.json`
2. Modify:
   ```json
   "ui": {
     "headerType": "type2"  // Change to "type1", "type2", or "type3"
   }
   ```
3. Reload the app (no code changes needed!)

## Benefits

- **Flexibility**: Easy to switch headers without code changes
- **Maintainability**: Each header type in separate file
- **Reusability**: Can use same headers across multiple screens
- **Configuration-Driven**: Control via platform config
- **Type Safety**: Full TypeScript support
- **Scalability**: Easy to add new header types
