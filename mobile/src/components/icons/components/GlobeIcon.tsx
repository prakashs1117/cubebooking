import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

/**
 * Globe Icon Component (Language/International)
 */
export const GlobeIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" {...props}>
    <Circle
      cx="12"
      cy="12"
      r="10"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M2 12H22"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 2C14.5013 4.73835 15.9228 8.29203 16 12C15.9228 15.708 14.5013 19.2616 12 22C9.49872 19.2616 8.07725 15.708 8 12C8.07725 8.29203 9.49872 4.73835 12 2Z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

/**
 * Globe Outline Icon (same as Globe)
 */
export const GlobeOutlineIcon: React.FC<IconComponentProps> = GlobeIcon;

/**
 * Language Icon (Alias for Globe)
 */
export const LanguageIcon: React.FC<IconComponentProps> = GlobeIcon;
