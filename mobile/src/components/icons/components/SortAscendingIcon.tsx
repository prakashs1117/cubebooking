import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

/**
 * Sort Ascending Icon - Lines with arrow pointing up
 */
const SortAscendingIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = 'currentColor',
  ...props
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M3 6h10M3 12h7M3 18h4"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M18 20V7m0 0l-3 3m3-3l3 3"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default SortAscendingIcon;
