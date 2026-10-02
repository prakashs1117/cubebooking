/**
 * Small label template — 29 × 25 mm (portrait)
 *
 * Vertical layout matching Ionic small-actual-label:
 *   TOP:    CAS-No (65%) row
 *   MIDDLE: product name (65%) | qty+QR+articleNo (35%)
 *   PICTO:  ≤2 pictograms side-by-side centered, >2 multi-row
 *   BOTTOM: Disclaimer full width
 *
 * No signal word or hazard statements (too small).
 * No fill date shown.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CustomText } from '@components/common/CustomText';
import {
  LabelTemplateProps,
  QRCodeSVG,
  GHSPictogram,
  DISCLAIMER_TEXT,
  DISCLAIMER_LABEL,
} from '@components/label/shared/LabelShared';

const SmallLabel: React.FC<LabelTemplateProps> = ({
  articleName,
  materialNumber,
  articleNumber,
  casNumber,
  hazardPictogramIcons = [],
  amount,
  unit,
  viewRef,
}) => {
  const fillLine = [amount, unit].filter(Boolean).join(' ');
  const qrValue = `https://www.sigmaaldrich.com/catalog/product/${materialNumber}`;
  const qrSize = 17;
  const pictoSize = hazardPictogramIcons.length <= 2 ? 12 : 9;

  const renderPictograms = () => {
    if (!hazardPictogramIcons.length) return null;
    if (hazardPictogramIcons.length <= 2) {
      return (
        <View style={s.pictoRow}>
          {hazardPictogramIcons.map((code, i) => (
            <View key={code} style={i > 0 ? { marginLeft: -3 } : undefined}>
              <GHSPictogram code={code} size={pictoSize} />
            </View>
          ))}
        </View>
      );
    }
    // >2: wrap into rows of 5
    const rows: string[][] = [];
    for (let i = 0; i < hazardPictogramIcons.length; i += 5) {
      rows.push(hazardPictogramIcons.slice(i, i + 5));
    }
    return (
      <View style={s.pictoGrid}>
        {rows.map((row, ri) => (
          <View key={ri} style={s.pictoRow}>
            {row.map((code, ci) => (
              <View key={code} style={ci > 0 ? { marginLeft: -3 } : undefined}>
                <GHSPictogram code={code} size={pictoSize} />
              </View>
            ))}
          </View>
        ))}
      </View>
    );
  };

  return (
    <View ref={viewRef} style={s.card}>
      {/* Safety info row: CAS-No */}
      <View style={s.safetyInfo}>
        {!!casNumber && (
          <CustomText style={[s.casNo, { fontSize: 7 }]} numberOfLines={1}>
            CAS-No: {casNumber}
          </CustomText>
        )}
      </View>

      {/* Product + barcode row */}
      <View style={s.productBarcode}>
        <CustomText style={[s.productName, { fontSize: 8, lineHeight: 10 }]} numberOfLines={5}>
          {articleName}
        </CustomText>
        <View style={s.barcodeDiv}>
          {!!fillLine && (
            <CustomText style={[s.quantity, { fontSize: 8 }]} numberOfLines={1}>
              {fillLine}
            </CustomText>
          )}
          <QRCodeSVG value={qrValue} size={qrSize} color="#000000" bgColor="#FFFFFF" />
          {!!articleNumber && (
            <CustomText style={[s.articleNo, { fontSize: 8 }]} numberOfLines={1}>
              {articleNumber}
            </CustomText>
          )}
        </View>
      </View>

      {/* Pictograms */}
      {renderPictograms()}

      {/* Disclaimer */}
      <CustomText style={[s.disclaimer, { fontSize: 6 }]} numberOfLines={2}>
        {DISCLAIMER_LABEL}: {DISCLAIMER_TEXT}
      </CustomText>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    width: 100,
    height: 86,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 2,
    overflow: 'hidden',
    padding: 3,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  safetyInfo: { flexDirection: 'row', width: '100%' },
  casNo: { color: '#1C1C1E', width: '65%' },
  productBarcode: { flexDirection: 'row', flex: 1 },
  productName: { fontWeight: '700', color: '#1C1C1E', width: '65%' },
  barcodeDiv: { width: '35%', alignItems: 'flex-start', justifyContent: 'flex-start' },
  quantity: { color: '#1C1C1E', fontWeight: '600' },
  articleNo: { color: '#1C1C1E' },
  pictoRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  pictoGrid: { alignItems: 'center' },
  disclaimer: { color: '#1C1C1E', marginTop: 0, lineHeight: 6 },
});

export default SmallLabel;
