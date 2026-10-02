import React, { useMemo } from 'react';
import { View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  G,
  Path,
  Polygon,
  Rect,
  Symbol,
  Use,
} from 'react-native-svg';

// ─── Template types ───────────────────────────────────────────────────────────

export type TemplateKey = 'big' | 'medium' | 'small' | 'milliseq';

export const TEMPLATE_OPTIONS: {
  key: TemplateKey;
  labelKey: string;
  width: number;
  height: number;
}[] = [
  { key: 'big',      labelKey: '155 × 50 mm (Big)',         width: 248, height: 80  },
  { key: 'medium',   labelKey: '100 × 30 mm (Medium)',      width: 180, height: 54  },
  { key: 'small',    labelKey: '29 × 25 mm (Small)',        width: 100, height: 86  },
  { key: 'milliseq', labelKey: '28.5 × 43.5 mm (Milli-Seq)', width: 100, height: 156 },
];

export const ROTATION_OPTIONS = [0, 90, 180, 270] as const;
export type RotationDegree = (typeof ROTATION_OPTIONS)[number];

// ─── Shared label props ───────────────────────────────────────────────────────

export interface LabelTemplateProps {
  // Article identifiers
  articleName: string;
  materialNumber: string;
  /** sds.header.articleNumber with ### replaced by space */
  articleNumber?: string;
  /** sds.section_one.cas */
  casNumber?: string;

  // SDS hazard data
  /** sds.section_two.hazardPictogramIcons e.g. ["GHS07"] */
  hazardPictogramIcons?: string[];
  /** sds.section_two.signalWord[0] e.g. "Warning" */
  signalWord?: string;
  /** sds.section_two.hazardStatements */
  hazardStatements?: string[];
  /** sds.section_two.otherHazards */
  otherHazards?: string[];

  // User-entered via Update Label modal
  amount?: string;
  unit?: string;
  /** sds.header.revisionDate */
  revisionDate?: string;
  /** User-selected fill/preparation date */
  fillDate?: string;
  /** Additional information from modal */
  extraText?: string;

  // Capture ref for react-native-view-shot
  viewRef?: React.RefObject<View>;
}

// ─── Scale helper ─────────────────────────────────────────────────────────────

export function getScale(key: TemplateKey): number {
  switch (key) {
    case 'big':      return 1;
    case 'medium':   return 0.72;
    case 'small':    return 0.55;
    case 'milliseq': return 0.58;
  }
}

/** Scaled font size — never smaller than 5pt */
export function fs(base: number, scale: number): number {
  return Math.max(5, Math.round(base * scale));
}

// ─── QR Code SVG ─────────────────────────────────────────────────────────────

export interface QRCodeSVGProps {
  value: string;
  size: number;
  color: string;
  bgColor: string;
}

export const QRCodeSVG: React.FC<QRCodeSVGProps> = ({
  value,
  size,
  color,
  bgColor,
}) => {
  const modules = useMemo(() => {
    const GRID = 21;
    const grid: boolean[][] = Array.from({ length: GRID }, () =>
      Array(GRID).fill(false),
    );
    const drawFinder = (r: number, c: number) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          const onBorder = i === 0 || i === 6 || j === 0 || j === 6;
          const onInner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
          if (r + i < GRID && c + j < GRID) {
            grid[r + i][c + j] = onBorder || onInner;
          }
        }
      }
    };
    drawFinder(0, 0);
    drawFinder(0, 14);
    drawFinder(14, 0);
    for (let i = 8; i < 13; i++) {
      grid[6][i] = i % 2 === 0;
      grid[i][6] = i % 2 === 0;
    }
    let seed = 0;
    for (let k = 0; k < value.length; k++) {
      seed = Math.imul(seed ^ value.charCodeAt(k), 0x9e3779b9);
    }
    let rng = seed >>> 0;
    const xorshift = () => {
      rng ^= rng * 0x7f4a7c13;
      rng ^= rng * 0x7f4a7c15;
      rng ^= rng * 0x7f4a7c17;
      rng = rng >>> 0;
      return rng > 0x7fffffff;
    };
    for (let r = 0; r < GRID; r++) {
      for (let c = 0; c < GRID; c++) {
        if (!grid[r][c]) {
          const skip =
            (r < 9 && c < 9) ||
            (r < 9 && c > 12) ||
            (r > 12 && c < 9) ||
            r === 6 ||
            c === 6;
          if (!skip) grid[r][c] = xorshift();
        }
      }
    }
    return grid;
  }, [value]);

  const cellSize = size / 21;
  return (
    <Svg width={size} height={size}>
      <Rect width={size} height={size} fill={bgColor} />
      {modules.map((row, r) =>
        row.map((on, c) =>
          on ? (
            <Rect
              key={`${r}-${c}`}
              x={c * cellSize}
              y={r * cellSize}
              width={cellSize}
              height={cellSize}
              fill={color}
            />
          ) : null,
        ),
      )}
    </Svg>
  );
};

// ─── GHS Pictogram SVG ────────────────────────────────────────────────────────

const GHS_COLORS: Record<string, { fill: string; symbol: string }> = {
  GHS01: { fill: '#E53E3E', symbol: 'explosion' },
  GHS02: { fill: '#DD6B20', symbol: 'flame' },
  GHS03: { fill: '#D69E2E', symbol: 'oxidizer' },
  GHS04: { fill: '#3182CE', symbol: 'gas' },
  GHS05: { fill: '#744210', symbol: 'corrosive' },
  GHS06: { fill: '#1A202C', symbol: 'skull' },
  GHS07: { fill: '#E53E3E', symbol: 'exclamation' },
  GHS08: { fill: '#553C9A', symbol: 'health' },
  GHS09: { fill: '#276749', symbol: 'environment' },
};

export interface GHSPictogramProps {
  code: string;
  size: number;
}

export const GHSPictogram: React.FC<GHSPictogramProps> = ({ code, size }) => {
  const meta = GHS_COLORS[code] ?? { fill: '#E53E3E', symbol: 'exclamation' };
  const s = size;
  const half = s / 2;

  const renderSymbol = () => {
    switch (meta.symbol) {
      case 'flame':
        return (
          <Path
            d={`M${half - 4} ${s * 0.72} Q${half} ${s * 0.55} ${half + 3} ${s * 0.62} Q${half + 1} ${s * 0.48} ${half + 4} ${s * 0.38} Q${half + 2} ${s * 0.52} ${half} ${s * 0.42} Q${half + 2} ${s * 0.28} ${half - 1} ${s * 0.24} Q${half - 3} ${s * 0.35} ${half - 5} ${s * 0.52} Q${half - 6} ${s * 0.62} ${half - 4} ${s * 0.72} Z`}
            fill={meta.fill}
            stroke="none"
          />
        );
      case 'exclamation':
        return (
          <G>
            <Rect x={half - 2} y={s * 0.24} width={4} height={s * 0.34} rx={2} fill={meta.fill} />
            <Circle cx={half} cy={s * 0.7} r={2.5} fill={meta.fill} />
          </G>
        );
      case 'skull':
        return (
          <G>
            <Circle cx={half} cy={s * 0.36} r={s * 0.14} fill={meta.fill} />
            <Rect x={half - s * 0.08} y={s * 0.5} width={s * 0.16} height={s * 0.16} fill={meta.fill} />
            <Circle cx={half - s * 0.07} cy={s * 0.34} r={3} fill="white" />
            <Circle cx={half + s * 0.07} cy={s * 0.34} r={3} fill="white" />
          </G>
        );
      case 'corrosive':
        return (
          <G>
            <Path d={`M${half - 8} ${s * 0.28} Q${half - 4} ${s * 0.38} ${half - 8} ${s * 0.52} L${half - 2} ${s * 0.72}`} stroke={meta.fill} strokeWidth={2.5} fill="none" />
            <Path d={`M${half + 8} ${s * 0.28} Q${half + 4} ${s * 0.38} ${half + 8} ${s * 0.52} L${half + 2} ${s * 0.72}`} stroke={meta.fill} strokeWidth={2.5} fill="none" />
          </G>
        );
      case 'health':
        return (
          <G>
            <Path d={`M${half} ${s * 0.68} Q${half - 12} ${s * 0.52} ${half - 10} ${s * 0.38} Q${half - 10} ${s * 0.24} ${half} ${s * 0.34} Q${half + 10} ${s * 0.24} ${half + 10} ${s * 0.38} Q${half + 12} ${s * 0.52} ${half} ${s * 0.68} Z`} fill={meta.fill} />
          </G>
        );
      case 'environment':
        return (
          <G>
            <Path d={`M${half} ${s * 0.68} Q${half - 10} ${s * 0.44} ${half - 8} ${s * 0.28} Q${half} ${s * 0.36} ${half + 8} ${s * 0.28} Q${half + 10} ${s * 0.44} ${half} ${s * 0.68} Z`} fill={meta.fill} />
          </G>
        );
      case 'explosion':
        return (
          <Polygon
            points={`${half},${s * 0.22} ${half + 5},${s * 0.4} ${half + 12},${s * 0.36} ${half + 7},${s * 0.52} ${half + 10},${s * 0.72} ${half},${s * 0.58} ${half - 10},${s * 0.72} ${half - 7},${s * 0.52} ${half - 12},${s * 0.36} ${half - 5},${s * 0.4}`}
            fill={meta.fill}
          />
        );
      case 'oxidizer':
        return (
          <G>
            <Circle cx={half} cy={half} r={s * 0.2} fill="none" stroke={meta.fill} strokeWidth={2} />
            <Path d={`M${half - 4} ${s * 0.32} L${half} ${s * 0.48} L${half + 4} ${s * 0.32}`} stroke={meta.fill} strokeWidth={2} fill="none" />
          </G>
        );
      case 'gas':
      default:
        return (
          <Circle cx={half} cy={half} r={s * 0.22} fill="none" stroke={meta.fill} strokeWidth={2.5} />
        );
    }
  };

  return (
    <Svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
      <Defs>
        <Symbol id={`diamond-${code}-${s}`} viewBox="0 0 100 100">
          <Polygon points="50,2 98,50 50,98 2,50" fill="white" stroke="#CC0000" strokeWidth="5" />
        </Symbol>
      </Defs>
      <Use href={`#diamond-${code}-${s}`} x={0} y={0} width={s} height={s} />
      {renderSymbol()}
    </Svg>
  );
};

// ─── Pictogram column — shared stacking layout ────────────────────────────────

interface PictogramColumnProps {
  codes: string[];
  pictoSize: number;
  /** negative margin overlap between stacked pictograms (positive value = overlap) */
  overlap?: number;
}

export const PictogramColumn: React.FC<PictogramColumnProps> = ({
  codes,
  pictoSize,
  overlap = 2,
}) => {
  if (!codes.length) return null;
  return (
    <View style={{ flexDirection: 'column', alignItems: 'center' }}>
      {codes.slice(0, 9).map((code, i) => (
        <View key={code} style={i > 0 ? { marginTop: -overlap } : undefined}>
          <GHSPictogram code={code} size={pictoSize} />
        </View>
      ))}
    </View>
  );
};

// ─── Disclaimer text constant ─────────────────────────────────────────────────

export const DISCLAIMER_TEXT =
  'The safety tag is not a replacement of the original label';
export const DISCLAIMER_LABEL = 'Disclaimer';
export const FILL_DATE_LABEL = 'Fill Date';
export const NOTES_LABEL = 'Notes';
