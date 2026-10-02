import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

interface HeaderSearchIconProps extends IconComponentProps {
  secondaryColor?: string;
}

export const HeaderSearchIcon: React.FC<HeaderSearchIconProps> = ({
  color = '#3688FF',
  secondaryColor = '#5F6379',
  size = 24,
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 1024 1024" fill="none" {...props}>
    <Path
      d="M492.5 917.7c-247 0-447.9-200.9-447.9-447.9s200.9-448 447.9-448 447.9 200.9 447.9 447.9-200.9 448-447.9 448zm0-810.6c-200 0-362.6 162.7-362.6 362.6s162.7 362.6 362.6 362.6 362.6-162.7 362.6-362.6-162.6-362.6-362.6-362.6z"
      fill={color}
    />
    <Path
      d="M951.1 971c-10.9 0-21.8-4.2-30.2-12.5l-96-96c-16.7-16.7-16.7-43.7 0-60.3 16.6-16.7 43.7-16.7 60.3 0l96 96c16.7 16.7 16.7 43.7 0 60.3-8.2 8.4-19.2 12.5-30.1 12.5z"
      fill={secondaryColor}
    />
  </Svg>
);
