import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

export const ArrowLeftIcon: React.FC<IconComponentProps> = ({
  color = '#000',
  size = 16,
  ...props
}) => (
  <Svg
    width={size * 0.4375} // Maintain aspect ratio 7:16
    height={size}
    viewBox="0 0 7 16"
    fill="none"
    {...props}
  >
    <Path
      d="M6 1L1.22546 8L6 15"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ArrowRightIcon: React.FC<IconComponentProps> = ({
  color = '#000',
  size = 16,
  ...props
}) => (
  <Svg
    width={size * 0.4375} // Maintain aspect ratio 7:16
    height={size}
    viewBox="0 0 7 16"
    fill="none"
    {...props}
  >
    <Path
      d="M1 1L5.77454 8L1 15"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ArrowLeftSmallIcon: React.FC<IconComponentProps> = ({
  color = '#000',
  size = 12,
  ...props
}) => (
  <Svg
    width={size * 0.5} // Maintain aspect ratio 6:12
    height={size}
    viewBox="0 0 6 12"
    fill="none"
    {...props}
  >
    <Path
      d="M5 1L1.5 6L5 11"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const ArrowRightSmallIcon: React.FC<IconComponentProps> = ({
  color = '#000',
  size = 12,
  ...props
}) => (
  <Svg
    width={size * 0.5} // Maintain aspect ratio 6:12
    height={size}
    viewBox="0 0 6 12"
    fill="none"
    {...props}
  >
    <Path
      d="M1 1L4.5 6L1 11"
      stroke={color}
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
