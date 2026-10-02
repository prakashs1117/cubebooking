import React from 'react';
import Svg, { G, Path, Rect } from 'react-native-svg';
import { IconComponentProps } from '@components/icons/types';

const IconTorch: React.FC<IconComponentProps> = ({
  color = '#000000',
  size = 24,
  ...props
}) => (
  <Svg
    width={size}
    height={size}
    viewBox="0 0 492.308 492.308"
    fill={color}
    {...props}
  >
    <G>
      <G>
        <Path d="M91.569,0v89.6l66.954,104.369v298.338h173.292V193.969L400.738,89.6V0H91.569z M313.108,189.046v283.569H179.2V189.046l-64-99.446h261.908L313.108,189.046z M380.062,69.908h-268.8V19.692h268.8V69.908z" />
      </G>
    </G>
    <G>
      <G>
        <Path d="M212.677,182.154v114.215h66.954V182.154H212.677z M259.938,276.677h-27.569v-74.831h27.569V276.677z" />
      </G>
    </G>
    <G>
      <G>
        <Rect x="222.523" y="402.708" width="47.262" height="19.692" />
      </G>
    </G>
    <G>
      <G>
        <Rect x="222.523" y="361.354" width="47.262" height="19.692" />
      </G>
    </G>
  </Svg>
);

export default IconTorch;
