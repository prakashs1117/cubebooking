# HorizontalDatePicker - Quick Start Guide

## 🚀 5-Minute Setup

### 1. Import the Component

```tsx
import { HorizontalDatePicker } from '@components/common/HorizontalDatePicker';
```

### 2. Basic Usage

```tsx
function MyScreen() {
  const [selectedDate, setSelectedDate] = useState(new Date());

  return (
    <HorizontalDatePicker
      onDateSelect={setSelectedDate}
      initialDate={new Date()}
    />
  );
}
```

### 3. With Event Filtering

```tsx
import { EventListWithDatePicker } from '@components/events';

function EventsScreen() {
  return (
    <EventListWithDatePicker
      events={myEvents}
      onEventPress={event => console.log(event)}
    />
  );
}
```

## 📋 Props Cheat Sheet

| Prop             | Type                   | Default      | Example                       |
| ---------------- | ---------------------- | ------------ | ----------------------------- |
| `onDateSelect`   | `(date: Date) => void` | -            | `(date) => setSelected(date)` |
| `initialDate`    | `Date`                 | `new Date()` | `new Date('2026-06-15')`      |
| `daysToShow`     | `number`               | `60`         | `90`                          |
| `showMonthLabel` | `boolean`              | `true`       | `false`                       |
| `containerStyle` | `ViewStyle`            | -            | `{ margin: 16 }`              |

## 🎨 Common Configurations

### Default (Recommended)

```tsx
<HorizontalDatePicker onDateSelect={handleSelect} />
```

### Compact (No Month Label)

```tsx
<HorizontalDatePicker showMonthLabel={false} containerStyle={{ height: 70 }} />
```

### Extended Range

```tsx
<HorizontalDatePicker daysToShow={180} />
```

### Event Date

```tsx
<HorizontalDatePicker initialDate={new Date(event.startTime)} />
```

## 📱 Example Screens

Check these files for working examples:

- `src/screens/AllEventsScreen.tsx` - Production example
- `src/screens/examples/DatePickerExample.tsx` - 4 demo examples

## ✅ Features Included

- ✅ Auto-scrolls to today
- ✅ Sticky month label
- ✅ Today indicator (dot)
- ✅ Month transitions
- ✅ Theme support
- ✅ Performant FlatList
- ✅ Accessible (60x66pt targets)

## 📚 Full Documentation

See `HORIZONTAL_DATE_PICKER.md` for complete details.
