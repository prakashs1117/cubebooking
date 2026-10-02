import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

/**
 * Filter Icon - Funnel/filter shape
 */
const FilterIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = 'currentColor',
  ...props
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
      <Path
        d="M4 4h16M4 4l6 7v7l4 2v-9l6-7"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
};

export default FilterIcon;
