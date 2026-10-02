import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface AppleIconProps {
  size?: number;
  width?: number;
  height?: number;
  fill?: string;
  color?: string;
}

/**
 * Apple Icon Component
 * Apple logo for sign-in buttons
 * Uses a simple, clean design suitable for authentication
 */
const AppleIcon: React.FC<AppleIconProps> = ({
  size = 24,
  width,
  height,
  fill,
  color = '#000000',
}) => {
  const iconWidth = width || size;
  const iconHeight = height || size;
  const iconColor = fill || color;

  return (
    <Svg
      width={iconWidth}
      height={iconHeight}
      viewBox="0 0 24 24"
      fill={iconColor}
    >
      <Path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
    </Svg>
  );
};

export default AppleIcon;
