import React from 'react';
import Svg, { Path } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

interface BookmarkIconProps extends IconComponentProps {
  fill?: boolean;
}

export const BookmarkIcon: React.FC<BookmarkIconProps> = ({
  color = '#09090B',
  size = 24,
  width,
  height,
  fill = false,
  ...props
}) => (
  <Svg
    width={width || size}
    height={height || size}
    viewBox="0 0 24 24"
    fill={fill ? color : 'none'}
    {...props}
  >
    <Path
      d="m19 21-7-4-7 4V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);
