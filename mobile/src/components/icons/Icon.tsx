import React from 'react';
import { IconProps, IconName } from './types';
import { getIconComponent } from './iconRegistry';

const Icon: React.FC<IconProps> = ({
  name,
  size = 24,
  color = '#000',
  style,
  ...props
}) => {
  const IconComponent = getIconComponent(name);

  return <IconComponent size={size} color={color} style={style} {...props} />;
};

export default Icon;
export type { IconProps, IconName };
