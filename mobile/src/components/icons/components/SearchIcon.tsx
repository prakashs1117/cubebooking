import React from 'react';
import Svg, { G, Path, Circle, Defs, ClipPath } from 'react-native-svg';
import { IconComponentProps } from '../types';

/**
 * Search Icon Component
 */
export const SearchIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <G clipPath="url(#clip0_15_152)">
      <Path fill="none" d="M0 0H24V24H0z" />
      <Circle
        cx={10.5}
        cy={10.5}
        r={6.5}
        stroke={color}
        strokeLinejoin="round"
      />
      <Path
        d="M19.646 20.354a.5.5 0 00.708-.708l-.708.708zm.708-.708l-5-5-.708.708 5 5 .708-.708z"
        fill={color}
      />
    </G>
    <Defs>
      <ClipPath id="clip0_15_152">
        <Path fill={color} d="M0 0H24V24H0z" />
      </ClipPath>
    </Defs>
  </Svg>
);

/**
 * Search Icon Outline (same as filled for this icon)
 */
export const SearchOutlineIcon: React.FC<IconComponentProps> = SearchIcon;
