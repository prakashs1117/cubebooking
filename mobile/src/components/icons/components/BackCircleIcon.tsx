import React from 'react';
import Svg, { G, Path } from 'react-native-svg';
import { IconComponentProps } from '../types';

export const BackCircleIcon: React.FC<IconComponentProps> = ({
  size = 24,
  color = '#000',
  ...props
}) => (
  <Svg width={size} height={size} viewBox="0 0 54 54" fill={color} {...props}>
    <G>
      <G>
        <Path d="M27,0C12.112,0,0,12.112,0,27s12.112,27,27,27s27-12.112,27-27S41.888,0,27,0z M27,52C13.215,52,2,40.785,2,27S13.215,2,27,2s25,11.215,25,25S40.785,52,27,52z" />
        <Path d="M30.85,15.793c-0.391-0.391-1.023-0.391-1.414,0l-10.5,10.5c-0.391,0.391-0.391,1.023,0,1.414l10.5,10.5c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293c0.391-0.391,0.391-1.023,0-1.414L21.057,27l9.793-9.793C31.24,16.816,31.24,16.184,30.85,15.793z" />
      </G>
    </G>
  </Svg>
);
