import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

interface HeaderBellIconProps extends IconComponentProps {
  secondaryColor?: string;
}

export const HeaderBellIcon: React.FC<HeaderBellIconProps> = ({
  color = '#0074ff',
  secondaryColor = '#ffb300',
  size = 24,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 64 64" fill="none" {...props}>
    {/* Bell body + base bar */}
    <Path
      d="M47.91 45.91H16.09a2 2 0 01-2-2V26.33a17.91 17.91 0 1135.82 0v2.59a2 2 0 01-4 0V26.33a13.91 13.91 0 10-27.82 0V41.91H45.91v-2.4a2 2 0 114 0v4.4a2 2 0 01-2 2z"
      fill={color}
    />
    <Path
      d="M52.49 52.49h-41a2 2 0 01-2-2V43.91a2 2 0 012-2h41a2 2 0 012 2v6.58a2 2 0 01-2 2zm-39-4h37V45.91h-37V48.49z"
      fill={color}
    />
    {/* Bell stem */}
    <Path
      d="M32 12.42a2 2 0 01-2-2v-4a2 2 0 114 0v4a2 2 0 01-2 2z"
      fill={color}
    />
    {/* Clapper ring — amber accent */}
    <Path
      d="M32 59.59A11.78 11.78 0 0120.7 51a2 2 0 011.93-2.54H41.37A2 2 0 0143.3 51 11.78 11.78 0 0132 59.59zm-6.19-7.1a7.73 7.73 0 0012.38 0H25.81z"
      fill={secondaryColor}
    />
  </Svg>
);
