import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

export const PlayIcon: React.FC<IconComponentProps> = ({
  color = '#09090B',
  size = 24,
  width,
  height,
  ...props
}) => (
  <Svg
    width={width || size}
    height={height || size}
    viewBox="0 0 24 24"
    fill={color}
    {...props}
  >
    <Path d="M8 5.14v14l11-7-11-7z" />
  </Svg>
);
