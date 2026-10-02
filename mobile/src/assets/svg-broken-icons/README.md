# SVG Broken Icons

This folder contains 84 React Native SVG icons converted from SVG files.

## Usage

### Import Individual Icons

```tsx
import { AddSquareIcon, BellIcon, CameraIcon } from '@assets/svg-broken-icons';

// Use in your component
<AddSquareIcon width={24} height={24} color="#000" />
<BellIcon width={32} height={32} color="#007AFF" />
<CameraIcon /> // Uses defaults: width=24, height=24, color="#1C274C"
```

### Icon Props

All icons accept the following props:

```tsx
interface SvgProps {
  width?: number;      // Default: 24
  height?: number;     // Default: 24
  color?: string;      // Default: "#1C274C"
  ...otherSvgProps     // Any other react-native-svg props
}
```

### View All Icons

To see all available icons, navigate to the **Icon Gallery** tab in the app. The gallery provides:

- Visual preview of all 84 icons
- Search functionality to find icons by name
- Code snippets for easy copy-paste
- Interactive selection to see icon details

## Available Icons

All icons are exported from `index.ts` with descriptive names:

- **Actions**: AddSquareIcon, CloseSquareIcon, CheckSquareIcon, ForwardIcon, UndoRightIcon
- **Alerts**: DangerIcon, DangerCircleIcon, DangerTriangleIcon, ForbiddenCircleIcon, InfoSquareIcon
- **Archive**: ArchiveIcon, ArchiveCheckIcon, ArchiveDownIcon, ArchiveUpIcon
- **Communication**: BellIcon, BellBingIcon, BellOffIcon, ChatRoundCheckIcon, FeedIcon
- **Documents**: DocumentAddIcon, DocumentMedicineIcon, ClipboardAddIcon
- **Gallery**: GalleryAddIcon, GalleryCircleIcon, GalleryRemoveIcon, AlbumIcon
- **Location**: MapPointAddIcon, MapPointRemoveIcon, MapPointSearchIcon
- **Media**: CameraIcon, ClapperboardPlayIcon, MutedIcon, StreamIcon
- **Navigation**: RoundArrowLeftIcon, RoundArrowRightIcon, RoundArrowDownIcon, RoundArrowRightUpIcon
- **Security**: LockKeyholeUnlockedIcon, KeySquareIcon, ShieldPlusIcon, ShieldUserIcon, IncognitoIcon
- **Tools**: MagnifierIcon, MagnifierZoomInIcon, MagnifierZoomOutIcon, CodeScanIcon, EyeScanIcon
- **UI Elements**: WidgetIcon, Widget4Icon, Widget5Icon, MaximizeIcon, MaximizeSquareIcon
- **And many more...**

## Icon Format

All icons are created as TypeScript React components with proper typing:

```tsx
import * as React from 'react';
import Svg, { Path } from 'react-native-svg';

interface SvgProps {
  width?: number;
  height?: number;
  color?: string;
}

function SvgComponent({
  width = 24,
  height = 24,
  color = '#1C274C',
  ...props
}: SvgProps) {
  return (
    <Svg
      width={width}
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      {...props}
    >
      <Path d="..." stroke={color} strokeWidth={1.5} />
    </Svg>
  );
}

export default SvgComponent;
```

## Notes

- Icons default to 24x24px size (mobile-friendly)
- Icons use stroke-based rendering (not fill)
- All colors are customizable via the `color` prop
- Icons maintain their aspect ratio from the original 0 0 24 24 viewBox
