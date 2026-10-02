/**
 * LabelPreview — outer wrapper that picks the correct template component.
 *
 * All shared types, GHSPictogram, QRCodeSVG are now in:
 *   @components/label/shared/LabelShared
 *
 * Template components are in:
 *   @components/label/templates/BigLabel
 *   @components/label/templates/MediumLabel
 *   @components/label/templates/SmallLabel
 *   @components/label/templates/MilliSeqLabel
 */
import React from 'react';
import { View, StyleSheet } from 'react-native';

// Re-export shared types so existing consumers don't break
export type { TemplateKey, RotationDegree, LabelTemplateProps, GHSPictogramProps, QRCodeSVGProps } from '@components/label/shared/LabelShared';
export { TEMPLATE_OPTIONS, ROTATION_OPTIONS, GHSPictogram, QRCodeSVG, getScale } from '@components/label/shared/LabelShared';

import {
  TemplateKey,
  RotationDegree,
  TEMPLATE_OPTIONS,
  LabelTemplateProps,
} from '@components/label/shared/LabelShared';

import BigLabel from '@components/label/templates/BigLabel';
import MediumLabel from '@components/label/templates/MediumLabel';
import SmallLabel from '@components/label/templates/SmallLabel';
import MilliSeqLabel from '@components/label/templates/MilliSeqLabel';

// ─── Props ────────────────────────────────────────────────────────────────────

export interface LabelPreviewProps extends LabelTemplateProps {
  template: TemplateKey;
  rotation?: RotationDegree;
  isDark?: boolean;
  /** Strip outer background/padding — used when rendering inside modals */
  noBackground?: boolean;
}

// ─── Component ────────────────────────────────────────────────────────────────

const LabelPreview: React.FC<LabelPreviewProps> = ({
  template,
  rotation = 0,
  isDark = false,
  noBackground = false,
  ...templateProps
}) => {
  const tmpl = TEMPLATE_OPTIONS.find(o => o.key === template)!;

  const rotateStyle =
    rotation === 90 || rotation === 270
      ? { width: tmpl.height, height: tmpl.width }
      : undefined;

  const templateEl = (() => {
    switch (template) {
      case 'big':      return <BigLabel      {...templateProps} />;
      case 'medium':   return <MediumLabel   {...templateProps} />;
      case 'small':    return <SmallLabel    {...templateProps} />;
      case 'milliseq': return <MilliSeqLabel {...templateProps} />;
    }
  })();

  const wrappedEl = rotation !== 0 ? (
    <View style={[rotateStyle, { transform: [{ rotate: `${rotation}deg` }] }]}>
      {templateEl}
    </View>
  ) : templateEl;

  if (noBackground) return wrappedEl;

  return (
    <View style={[styles.outer, isDark && styles.outerDark]}>
      {wrappedEl}
    </View>
  );
};

const styles = StyleSheet.create({
  outer: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    backgroundColor: '#F5F5F7',
    borderRadius: 12,
  },
  outerDark: { backgroundColor: '#1C1C2E' },
});

export default LabelPreview;
