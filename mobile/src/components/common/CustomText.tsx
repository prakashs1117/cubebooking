import React from 'react';
import { Text, TextProps } from 'react-native';
import { FontStyles, combineWithFontStyle } from '@utils/fonts';

export interface CustomTextProps extends TextProps {
  /**
   * Predefined font style to apply
   */
  variant?: keyof FontStyles;
  /**
   * Text color override
   */
  color?: string;
  /**
   * Font size override
   */
  fontSize?: number;
}

/**
 * Custom Text component with built-in font support
 */
export const CustomText: React.FC<CustomTextProps> = ({
  variant = 'bodyMedium',
  color,
  fontSize,
  style,
  children,
  ...props
}) => {
  const fontStyle = combineWithFontStyle(variant, {
    ...(color && { color }),
    ...(fontSize && { fontSize }),
  });

  const combinedStyle = [fontStyle, style];

  return (
    <Text style={combinedStyle} {...props}>
      {children}
    </Text>
  );
};

/**
 * Pre-configured text components for common use cases
 */
export const Heading1: React.FC<Omit<CustomTextProps, 'variant'>> = props => (
  <CustomText variant="h1" {...props} />
);

export const Heading2: React.FC<Omit<CustomTextProps, 'variant'>> = props => (
  <CustomText variant="h2" {...props} />
);

export const Heading3: React.FC<Omit<CustomTextProps, 'variant'>> = props => (
  <CustomText variant="h3" {...props} />
);

export const Heading4: React.FC<Omit<CustomTextProps, 'variant'>> = props => (
  <CustomText variant="h4" {...props} />
);

export const BodyText: React.FC<Omit<CustomTextProps, 'variant'>> = props => (
  <CustomText variant="bodyMedium" {...props} />
);

export const CaptionText: React.FC<
  Omit<CustomTextProps, 'variant'>
> = props => <CustomText variant="caption" {...props} />;

export const ButtonText: React.FC<Omit<CustomTextProps, 'variant'>> = props => (
  <CustomText variant="button" {...props} />
);

export const SubtitleText: React.FC<
  Omit<CustomTextProps, 'variant'>
> = props => <CustomText variant="subtitle" {...props} />;

// Default export for convenience
export default CustomText;
