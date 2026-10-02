import React from 'react';
import { useDeviceType } from '@hooks/useDeviceType';

interface ResponsiveViewProps {
  /** Rendered on phones (width < 768). */
  phone: React.ReactElement;
  /** Rendered on tablets and larger (width >= 768). Falls back to `phone` if omitted. */
  tablet?: React.ReactElement;
  /** Rendered on desktop / external displays (width >= 1024). Falls back to `tablet` or `phone`. */
  desktop?: React.ReactElement;
}

/**
 * Drop-in layout switch.  Pick the right subtree for the current device size;
 * callers never need to branch on `isTablet` themselves.
 *
 * @example
 * <ResponsiveView
 *   phone={<PhoneLayout />}
 *   tablet={<TabletLayout />}
 * />
 */
const ResponsiveView: React.FC<ResponsiveViewProps> = ({
  phone,
  tablet,
  desktop,
}) => {
  const { isTablet, isDesktop } = useDeviceType();

  if (isDesktop && (desktop ?? tablet ?? phone)) {
    return desktop ?? tablet ?? phone;
  }

  if (isTablet && (tablet ?? phone)) {
    return tablet ?? phone;
  }

  return phone;
};

export { useDeviceType };
export default ResponsiveView;
