/**
 * MerckConnect color palette
 * Dark-first design system extracted from MerckConnect Standalone.html
 */

export const MerckConnectColors = {
  // Brand primary
  primary: '#2ED9A0',
  primaryDark: '#0E9F6E',
  primaryLight: '#4FEBB5',

  // App backgrounds (dark)
  bgApp: '#11201A',
  bgDeep: '#0A1410',
  bgCard: '#16271F',
  bgSurface: '#1A3A2A',
  bgSurfaceAlt: '#1E3A2A',
  bgDrawer: '#0A1410',

  // Borders
  borderDefault: '#21372C',
  borderMuted: '#2D4A3E',

  // Text (on dark)
  textPrimary: '#EAF3EC',
  textSecondary: '#E7EDE4',
  textMuted: '#8AA89A',
  textFaint: '#4A7A65',

  // Accent colors
  accentAmber: '#FBBF40',
  accentBlue: '#2E7DF6',
  accentCoral: '#FF6A3D',
  accentCoralLight: '#FF8A63',
  accentPink: '#D6298E',
  accentPinkLight: '#FF6FB5',
  accentCyan: '#34D6D6',
  accentCyanLight: '#22d3ee',
  accentIndigo: '#5B5BD6',
  accentIndigoLight: '#6366f1',
  accentPurple: '#6C5CE7',
  accentViolet: '#a855f7',
  accentLime: '#a3e635',
  accentBlueLight: '#5AA0FF',

  // Semantic
  success: '#0E9F6E',
  error: '#E5484D',
  errorLight: '#ff8a80',
  warning: '#FBBF40',
  info: '#2E7DF6',

  // Neutrals
  white: '#FFFFFF',
  black: '#000000',

  // Light theme surfaces (for light mode support)
  lightBg: '#F4F7F2',
  lightCard: '#FFFFFF',
  lightBorder: '#E2ECE7',
  lightTextPrimary: '#0A1410',
  lightTextSecondary: '#2D4A3E',
} as const;

// Gradient presets matching the design
export const Gradients = {
  tealCyan: ['#008A63', '#0ea5e9'] as [string, string],
  cyanIndigo: ['#0ea5e9', '#6366f1'] as [string, string],
  green: ['#34d399', '#10b981'] as [string, string],
  cyanIndigoAlt: ['#22d3ee', '#6366f1'] as [string, string],
  purplePink: ['#a855f7', '#ec4899'] as [string, string],
  orangePink: ['#f59e0b', '#ec4899'] as [string, string],
  orange: ['#fb923c', '#f59e0b'] as [string, string],
  pinkPurple: ['#f472b6', '#a855f7'] as [string, string],
  coral: ['#fb923c', '#ef4444'] as [string, string],
  purplePinkAlt: ['#6C5CE7', '#ec4899'] as [string, string],
} as const;

// Avatar gradient set (index 0-5 maps to gradients for user avatars)
export const AvatarGradients: [string, string][] = [
  ['#008A63', '#0ea5e9'],
  ['#0ea5e9', '#6366f1'],
  ['#34d399', '#10b981'],
  ['#22d3ee', '#6366f1'],
  ['#a855f7', '#ec4899'],
  ['#f59e0b', '#ec4899'],
];

// Dark theme (primary/default for MerckConnect)
export const DarkTheme = {
  background: {
    primary: MerckConnectColors.bgApp,
    secondary: MerckConnectColors.bgDeep,
    tertiary: MerckConnectColors.bgCard,
    card: MerckConnectColors.bgCard,
    surface: MerckConnectColors.bgSurface,
    muted: MerckConnectColors.bgSurface,    // legacy alias
    modal: MerckConnectColors.bgCard,
    overlay: 'rgba(0, 0, 0, 0.6)',
    drawer: MerckConnectColors.bgDrawer,
  },

  text: {
    primary: MerckConnectColors.textPrimary,
    secondary: MerckConnectColors.textSecondary,
    tertiary: MerckConnectColors.textMuted,
    placeholder: MerckConnectColors.textFaint,
    inverse: MerckConnectColors.bgApp,
    link: MerckConnectColors.primary,
    success: MerckConnectColors.success,
    error: MerckConnectColors.error,
    warning: MerckConnectColors.warning,
  },

  border: {
    primary: MerckConnectColors.borderDefault,
    secondary: MerckConnectColors.borderMuted,
    focus: MerckConnectColors.primary,
    error: MerckConnectColors.error,
    success: MerckConnectColors.success,
  },

  button: {
    primary: {
      background: MerckConnectColors.primary,
      text: MerckConnectColors.bgApp,
      border: MerckConnectColors.primary,
    },
    secondary: {
      background: MerckConnectColors.bgSurface,
      text: MerckConnectColors.textPrimary,
      border: MerckConnectColors.borderDefault,
    },
    outline: {
      background: 'transparent',
      text: MerckConnectColors.primary,
      border: MerckConnectColors.primary,
    },
    ghost: {
      background: 'transparent',
      text: MerckConnectColors.textSecondary,
      border: 'transparent',
    },
    success: {
      background: MerckConnectColors.success,
      text: MerckConnectColors.white,
      border: MerckConnectColors.success,
    },
    error: {
      background: MerckConnectColors.error,
      text: MerckConnectColors.white,
      border: MerckConnectColors.error,
    },
    warning: {
      background: MerckConnectColors.warning,
      text: MerckConnectColors.bgApp,
      border: MerckConnectColors.warning,
    },
    info: {
      background: MerckConnectColors.info,
      text: MerckConnectColors.white,
      border: MerckConnectColors.info,
    },
    danger: {
      background: MerckConnectColors.error,
      text: MerckConnectColors.white,
      border: MerckConnectColors.error,
    },
  },

  tabBar: {
    background: MerckConnectColors.bgApp,
    border: MerckConnectColors.borderDefault,
    activeTint: MerckConnectColors.primary,
    inactiveTint: MerckConnectColors.textFaint,
  },

  statusBar: 'light-content' as const,
} as const;

// Light theme (secondary — for light mode support)
export const LightTheme = {
  background: {
    primary: '#F5F6F7',
    secondary: '#ECEDEF',
    tertiary: '#E2E5E9',
    card: MerckConnectColors.lightCard,
    surface: '#F0F1F3',
    muted: '#EAECEF',
    modal: MerckConnectColors.lightCard,
    overlay: 'rgba(0, 0, 0, 0.4)',
    drawer: '#FFFFFF',
  },

  text: {
    primary: '#111827',
    secondary: '#374151',
    tertiary: '#6B7280',
    placeholder: '#9CA3AF',
    inverse: MerckConnectColors.white,
    link: MerckConnectColors.primaryDark,
    success: MerckConnectColors.success,
    error: MerckConnectColors.error,
    warning: '#B45309',
  },

  border: {
    primary: '#E2E5E9',
    secondary: '#CDD2D9',
    focus: MerckConnectColors.primaryDark,
    error: MerckConnectColors.error,
    success: MerckConnectColors.success,
  },

  button: {
    primary: {
      background: MerckConnectColors.primaryDark,
      text: MerckConnectColors.white,
      border: MerckConnectColors.primaryDark,
    },
    secondary: {
      background: '#E2ECE7',
      text: MerckConnectColors.lightTextPrimary,
      border: MerckConnectColors.lightBorder,
    },
    outline: {
      background: 'transparent',
      text: MerckConnectColors.primaryDark,
      border: MerckConnectColors.primaryDark,
    },
    ghost: {
      background: 'transparent',
      text: MerckConnectColors.lightTextSecondary,
      border: 'transparent',
    },
    success: {
      background: MerckConnectColors.success,
      text: MerckConnectColors.white,
      border: MerckConnectColors.success,
    },
    error: {
      background: MerckConnectColors.error,
      text: MerckConnectColors.white,
      border: MerckConnectColors.error,
    },
    warning: {
      background: MerckConnectColors.warning,
      text: MerckConnectColors.bgApp,
      border: MerckConnectColors.warning,
    },
    info: {
      background: MerckConnectColors.info,
      text: MerckConnectColors.white,
      border: MerckConnectColors.info,
    },
    danger: {
      background: MerckConnectColors.error,
      text: MerckConnectColors.white,
      border: MerckConnectColors.error,
    },
  },

  tabBar: {
    background: MerckConnectColors.lightCard,
    border: MerckConnectColors.lightBorder,
    activeTint: MerckConnectColors.primaryDark,
    inactiveTint: '#7A9E90',
  },

  statusBar: 'dark-content' as const,
} as const;

// Type definitions — widened so both LightTheme and DarkTheme satisfy ThemeColors
export type ThemeColors = {
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    card: string;
    surface: string;
    muted: string;
    modal: string;
    overlay: string;
    drawer: string;
  };
  text: {
    primary: string;
    secondary: string;
    tertiary: string;
    placeholder: string;
    inverse: string;
    link: string;
    success: string;
    error: string;
    warning: string;
  };
  border: {
    primary: string;
    secondary: string;
    focus: string;
    error: string;
    success: string;
  };
  button: {
    primary: { background: string; text: string; border: string };
    secondary: { background: string; text: string; border: string };
    outline: { background: string; text: string; border: string };
    ghost: { background: string; text: string; border: string };
    success: { background: string; text: string; border: string };
    error: { background: string; text: string; border: string };
    warning: { background: string; text: string; border: string };
    info: { background: string; text: string; border: string };
    danger: { background: string; text: string; border: string };
  };
  tabBar: {
    background: string;
    border: string;
    activeTint: string;
    inactiveTint: string;
  };
  statusBar: 'light-content' | 'dark-content';
};
export type ColorKeys = keyof ThemeColors;
export type BackgroundColorKeys = keyof ThemeColors['background'];
export type TextColorKeys = keyof ThemeColors['text'];
export type BorderColorKeys = keyof ThemeColors['border'];
export type ButtonColorKeys = keyof ThemeColors['button'];

// Legacy BaseColors alias — adds back old property names for backward compatibility
export const BaseColors = {
  ...MerckConnectColors,
  // Legacy Merck purple aliases (used by auth components)
  merckPurple: '#503291',
  merckPurpleDark: '#3A2463',
  merckPurpleLight: '#6B44B8',
  // Other legacy aliases
  gray50: '#F8F9FA',
  gray100: '#F1F3F4',
  gray200: '#E9ECEF',
  gray300: '#DEE2E6',
  gray400: '#CED4DA',
  gray500: '#ADB5BD',
  gray600: '#6C757D',
  gray700: '#495057',
  gray800: '#343A40',
  gray900: '#212529',
  white: '#FFFFFF',
  black: '#000000',
} as const;
