import React from 'react';
import Svg, { G, Path, Rect, Circle } from 'react-native-svg';

/**
 * FEGlyph — FluentEdge single-color stroke/fill icon set.
 * Ported 1:1 from design/fe/fe-icons.jsx (same 24×24 path data).
 */
export interface FEGlyphProps {
  name: string;
  size?: number;
  color?: string;
  /** Stroke width */
  sw?: number;
}

export default function FEGlyph({ name, size = 22, color = '#fff', sw = 1.9 }: FEGlyphProps) {
  const s = {
    fill: 'none',
    stroke: color,
    strokeWidth: sw,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  };
  const F = { fill: color, stroke: 'none' };

  let g: React.ReactNode = null;
  switch (name) {
    case 'mic':
      g = (
        <G {...s}>
          <Rect x="9" y="2.6" width="6" height="10.6" rx="3" fill={color} strokeWidth={0} />
          <Path d="M5.8 11.2a6.2 6.2 0 0 0 12.4 0" />
          <Path d="M12 17.6v3.4" />
        </G>
      );
      break;
    case 'flame':
      g = <Path {...F} d="M12 2.4c.7 3.1-.7 4.8-2.3 6.4C7.9 10.6 6.2 12.4 6.2 15.1a5.8 5.8 0 0 0 11.6 0c0-1.9-.9-3.3-1.9-4.5-.4 1-.9 1.7-1.9 2.1.7-3.3-.3-6.9-2-10.3z" />;
      break;
    case 'trophy':
      g = (
        <G {...s}>
          <Path d="M8 3.6h8v5.6a4 4 0 0 1-8 0V3.6z" />
          <Path d="M8 5.2H5.4c0 2.6 1.1 4.1 2.9 4.4" />
          <Path d="M16 5.2h2.6c0 2.6-1.1 4.1-2.9 4.4" />
          <Path d="M12 13.2v3.4" />
          <Path d="M8.6 20.4h6.8" />
          <Path d="M10.2 16.6h3.6" />
        </G>
      );
      break;
    case 'calendar':
      g = (
        <G {...s}>
          <Rect x="3.6" y="4.8" width="16.8" height="15.6" rx="3" />
          <Path d="M3.6 9.6h16.8" />
          <Path d="M8.2 2.8v3.6" />
          <Path d="M15.8 2.8v3.6" />
          <Circle cx="8.4" cy="13.6" r="1.1" fill={color} strokeWidth={0} />
          <Circle cx="12" cy="13.6" r="1.1" fill={color} strokeWidth={0} />
        </G>
      );
      break;
    case 'users':
      g = (
        <G {...s}>
          <Circle cx="9" cy="8.4" r="3.2" />
          <Path d="M3.4 19.4c.5-3.3 2.7-5.2 5.6-5.2s5.1 1.9 5.6 5.2" />
          <Circle cx="16.6" cy="9" r="2.5" />
          <Path d="M16.4 14.4c2.3.3 3.9 2 4.3 4.6" />
        </G>
      );
      break;
    case 'chat':
      g = <Path {...s} d="M12 3.8c-4.7 0-8.4 2.9-8.4 6.6 0 2.1 1.2 4 3 5.2 0 1.2-.5 2.4-1.5 3.4 1.7 0 3.1-.6 4.2-1.5.9.2 1.8.3 2.7.3 4.7 0 8.4-2.9 8.4-6.6S16.7 3.8 12 3.8z" />;
      break;
    case 'book':
      g = (
        <G {...s}>
          <Path d="M4.6 5A2.6 2.6 0 0 1 7.2 2.4h12.2V17.6H7.2a2.6 2.6 0 0 0-2.6 2.6V5z" />
          <Path d="M4.6 20.2a2.6 2.6 0 0 1 2.6-2.6h12.2v3.8H7.2" />
        </G>
      );
      break;
    case 'chart':
      g = (
        <G {...s} strokeWidth={2.4}>
          <Path d="M5 20.4v-6.8" />
          <Path d="M10 20.4V7.6" />
          <Path d="M15 20.4v-9.6" />
          <Path d="M20 20.4V4.4" />
        </G>
      );
      break;
    case 'timer':
      g = (
        <G {...s}>
          <Circle cx="12" cy="13.4" r="7.2" />
          <Path d="M12 13.4l3.1-3.1" />
          <Path d="M9.6 2.6h4.8" />
          <Path d="M12 2.6v3.4" />
        </G>
      );
      break;
    case 'star':
      g = <Path {...F} d="M12 2.6l2.9 5.9 6.5.9-4.7 4.6 1.1 6.4L12 17.4l-5.8 3 1.1-6.4L2.6 9.4l6.5-.9z" />;
      break;
    case 'target':
      g = (
        <G {...s}>
          <Circle cx="12" cy="12" r="8.4" />
          <Circle cx="12" cy="12" r="4.6" />
          <Circle cx="12" cy="12" r="1.4" fill={color} strokeWidth={0} />
        </G>
      );
      break;
    case 'bulb':
      g = (
        <G {...s}>
          <Path d="M12 2.8a6.2 6.2 0 0 0-3.5 11.3c.8.6 1.3 1.4 1.5 2.4h4c.2-1 .7-1.8 1.5-2.4A6.2 6.2 0 0 0 12 2.8z" />
          <Path d="M10 19.6h4" />
          <Path d="M10.8 22h2.4" />
        </G>
      );
      break;
    case 'bell':
      g = (
        <G {...s}>
          <Path d="M12 3a6 6 0 0 0-6 6c0 4.5-1.6 6-1.6 6h15.2S18 13.5 18 9a6 6 0 0 0-6-6z" />
          <Path d="M10.3 19.6a2 2 0 0 0 3.4 0" />
        </G>
      );
      break;
    case 'route':
      g = (
        <G {...s}>
          <Circle cx="5.6" cy="5.6" r="2.6" />
          <Circle cx="18.4" cy="18.4" r="2.6" />
          <Path d="M5.6 8.2v4.2a4 4 0 0 0 4 4h5.2" />
        </G>
      );
      break;
    case 'cert':
      g = (
        <G {...s}>
          <Circle cx="12" cy="9" r="5.4" />
          <Path d="M9.2 13.6 7.6 21l4.4-2.5L16.4 21l-1.6-7.4" />
        </G>
      );
      break;
    case 'heart':
      g = <Path {...F} d="M12 20.6s-8.4-5.3-8.4-11A4.6 4.6 0 0 1 12 6.5a4.6 4.6 0 0 1 8.4 3.1c0 5.7-8.4 11-8.4 11z" />;
      break;
    case 'heartO':
      g = <Path {...s} d="M12 20s-7.9-5-7.9-10.3A4.3 4.3 0 0 1 12 6.8a4.3 4.3 0 0 1 7.9 2.9C19.9 15 12 20 12 20z" />;
      break;
    case 'search':
      g = (
        <G {...s}>
          <Circle cx="11" cy="11" r="6.6" />
          <Path d="M15.9 15.9 21 21" />
        </G>
      );
      break;
    case 'gear':
      g = (
        <G {...s}>
          <Circle cx="12" cy="12" r="3.1" />
          <Path d="M12 2.8v2.6M12 18.6v2.6M2.8 12h2.6M18.6 12h2.6M5.5 5.5l1.8 1.8M16.7 16.7l1.8 1.8M18.5 5.5l-1.8 1.8M7.3 16.7l-1.8 1.8" />
        </G>
      );
      break;
    case 'sun':
      g = (
        <G {...s}>
          <Circle cx="12" cy="12" r="4" fill={color} strokeWidth={0} />
          <Path d="M12 2.6v2.2M12 19.2v2.2M2.6 12h2.2M19.2 12h2.2M5.2 5.2l1.6 1.6M17.2 17.2l1.6 1.6M18.8 5.2l-1.6 1.6M6.8 17.2l-1.6 1.6" />
        </G>
      );
      break;
    case 'moon':
      g = <Path {...F} d="M20.4 14.6A8.7 8.7 0 0 1 9.4 3.6 8.2 8.2 0 1 0 20.4 14.6z" />;
      break;
    case 'home':
      g = (
        <G {...s}>
          <Path d="M4.4 10.4 12 3.4l7.6 7v8.1a2 2 0 0 1-2 2H6.4a2 2 0 0 1-2-2v-8.1z" />
          <Path d="M9.7 20.5v-5.2h4.6v5.2" />
        </G>
      );
      break;
    case 'person':
      g = (
        <G {...s}>
          <Circle cx="12" cy="8" r="3.9" />
          <Path d="M4.6 20.4c.7-4 3.6-6.2 7.4-6.2s6.7 2.2 7.4 6.2" />
        </G>
      );
      break;
    case 'plus':
      g = (
        <G {...s} strokeWidth={2.4}>
          <Path d="M12 5.2v13.6" />
          <Path d="M5.2 12h13.6" />
        </G>
      );
      break;
    case 'check':
      g = <Path {...s} strokeWidth={2.6} d="M4.8 12.6l4.6 4.6L19.2 7" />;
      break;
    case 'chev':
      g = <Path {...s} strokeWidth={2.2} d="M9 5.6l6.8 6.4L9 18.4" />;
      break;
    case 'back':
      g = <Path {...s} strokeWidth={2.2} d="M15 5.6 8.2 12l6.8 6.4" />;
      break;
    case 'clock':
      g = (
        <G {...s}>
          <Circle cx="12" cy="12" r="8.4" />
          <Path d="M12 7.4V12l3 2.1" />
        </G>
      );
      break;
    case 'pin':
      g = (
        <G {...s}>
          <Path d="M12 21.4s7-5.7 7-10.9a7 7 0 1 0-14 0c0 5.2 7 10.9 7 10.9z" />
          <Circle cx="12" cy="10.2" r="2.6" />
        </G>
      );
      break;
    case 'zap':
      g = <Path {...F} d="M13.2 2.4 4.6 13.4h6L10.8 21.6 19.4 10.6h-6z" />;
      break;
    case 'crown':
      g = <Path {...F} d="M3.4 7.2 8 10.8l4-6.2 4 6.2 4.6-3.6-1.7 11.4H5.1z" />;
      break;
    case 'arrowR':
      g = (
        <G {...s} strokeWidth={2.2}>
          <Path d="M4.4 12h15.2" />
          <Path d="M13.8 6.4 19.6 12l-5.8 5.6" />
        </G>
      );
      break;
    case 'x':
      g = (
        <G {...s} strokeWidth={2.2}>
          <Path d="M6 6l12 12" />
          <Path d="M18 6 6 18" />
        </G>
      );
      break;
    case 'lock':
      g = (
        <G {...s}>
          <Rect x="5.6" y="10.6" width="12.8" height="9.4" rx="2.6" />
          <Path d="M8.6 10.6V8a3.4 3.4 0 0 1 6.8 0v2.6" />
        </G>
      );
      break;
    case 'trend':
      g = (
        <G {...s}>
          <Path d="M3.6 17.4 9 12l3.5 3.5L20.4 7.2" />
          <Path d="M15.6 7.2h4.8V12" />
        </G>
      );
      break;
    case 'megaphone':
      g = (
        <G {...s}>
          <Path d="M3.6 10.4v3.2a2 2 0 0 0 2 2h1.6l1 4.6h2.4l-1-4.6h1.6l7.6 3.8V5L11.2 8.8H5.6a2 2 0 0 0-2 1.6z" />
        </G>
      );
      break;
    case 'fileText':
      g = (
        <G {...s}>
          <Path d="M6 2.8h8.4L19 7.4V21.2H6V2.8z" />
          <Path d="M14 3.2V8h4.6" />
          <Path d="M9 12.4h6M9 16h6" />
        </G>
      );
      break;
    case 'logout':
      g = (
        <G {...s}>
          <Path d="M9.4 3.4H6a2 2 0 0 0-2 2v13.2a2 2 0 0 0 2 2h3.4" />
          <Path d="M9.6 12h10.6" />
          <Path d="M16 7.6 20.4 12 16 16.4" />
        </G>
      );
      break;
    // ── FluentEdge additions ──
    case 'wave':
      g = (
        <G {...s} strokeWidth={2.1}>
          <Path d="M3 12h2" />
          <Path d="M7 8.5v7" />
          <Path d="M10.5 5v14" />
          <Path d="M14 8v8" />
          <Path d="M17.5 10v4" />
          <Path d="M21 11.5v1" />
        </G>
      );
      break;
    case 'play':
      g = <Path {...F} d="M7 4.6c0-.9 1-1.5 1.8-1L19 9.9c.8.5.8 1.7 0 2.2L8.8 18.4c-.8.5-1.8-.1-1.8-1V4.6z" transform="translate(-1 0)" />;
      break;
    case 'pause':
      g = (
        <G {...F}>
          <Rect x="6.5" y="4.5" width="4" height="15" rx="1.4" />
          <Rect x="13.5" y="4.5" width="4" height="15" rx="1.4" />
        </G>
      );
      break;
    case 'sparkle':
      g = (
        <G {...F}>
          <Path d="M12 2.4l1.7 4.6 4.6 1.7-4.6 1.7L12 15l-1.7-4.6L5.7 8.7l4.6-1.7z" />
          <Path d="M18.4 14.2l.8 2.1 2.1.8-2.1.8-.8 2.1-.8-2.1-2.1-.8 2.1-.8z" />
        </G>
      );
      break;
    case 'headphones':
      g = (
        <G {...s}>
          <Path d="M4.4 14v-2a7.6 7.6 0 0 1 15.2 0v2" />
          <Rect x="3" y="13.4" width="4" height="6.6" rx="2" />
          <Rect x="17" y="13.4" width="4" height="6.6" rx="2" />
        </G>
      );
      break;
    case 'shield':
      g = (
        <G {...s}>
          <Path d="M12 2.6 4.8 5.4v5.2c0 4.6 3 8.3 7.2 9.8 4.2-1.5 7.2-5.2 7.2-9.8V5.4z" />
          <Path strokeWidth={2.2} d="M9 12l2 2 4-4.2" />
        </G>
      );
      break;
    case 'refresh':
      g = (
        <G {...s}>
          <Path d="M20 6.5v4.5h-4.5" />
          <Path d="M19 11a7.2 7.2 0 1 0-1.6 6.6" />
        </G>
      );
      break;
    case 'send':
      g = <Path {...s} d="M21 4 3 11.2l6.6 2.4L12 20l3.2-6.4L21 4z" />;
      break;
    case 'grad':
      g = (
        <G {...s}>
          <Path d="M2.6 8.4 12 4.6l9.4 3.8L12 12.2z" />
          <Path d="M6.4 10.6v4.2c0 1.7 2.5 3 5.6 3s5.6-1.3 5.6-3v-4.2" />
          <Path d="M21.4 8.4v5.4" />
        </G>
      );
      break;
    case 'layers':
      g = (
        <G {...s}>
          <Path d="M12 3.2 3.4 8 12 12.8 20.6 8z" />
          <Path d="M3.4 12.4 12 17.2l8.6-4.8" />
          <Path d="M3.4 16.6 12 21.4l8.6-4.8" />
        </G>
      );
      break;
    case 'pulse':
      g = <Path {...s} strokeWidth={2.1} d="M2.6 12.6h4L9 6.4l3.4 11.6 2.4-6.4h4.6" />;
      break;
    case 'link':
      g = (
        <G {...s}>
          <Path d="M9 15l6-6" />
          <Path d="M11 6.8l1.6-1.6a3.8 3.8 0 0 1 5.4 5.4L16.4 12" />
          <Path d="M13 17.2l-1.6 1.6A3.8 3.8 0 0 1 6 13.4L7.6 12" />
        </G>
      );
      break;
    default:
      g = <Circle cx="12" cy="12" r="8" {...s} />;
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {g}
    </Svg>
  );
}
