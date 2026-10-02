/**
 * Big label template — 155 × 50 mm
 *
 * 3-column horizontal layout matching Ionic big-actual-label:
 *   LEFT  (56mm): CAS-No · product name · [qty+QR+articleNo] · fill date · notes · disclaimer
 *   CENTER(21mm): GHS pictogram stack
 *   RIGHT (73mm): signal word + hazard statements + otherHazards
 *
 * No-pictogram variant widens left→70mm, right→80mm, drops center col.
 */
import React from 'react';
import { StyleSheet, View } from 'react-native';
import { CustomText } from '@components/common/CustomText';
import {
  LabelTemplateProps,
  QRCodeSVG,
  PictogramColumn,
  DISCLAIMER_TEXT,
  DISCLAIMER_LABEL,
  FILL_DATE_LABEL,
  NOTES_LABEL,
} from '@components/label/shared/LabelShared';

const SC = 1;
const BigLabel: React.FC<LabelTemplateProps> = ({
  articleName,
  materialNumber,
  articleNumber,
  casNumber,
  hazardPictogramIcons = [],
  signalWord,
  hazardStatements = [],
  otherHazards = [],
  amount,
  unit,
  revisionDate,
  fillDate,
  extraText,
  viewRef,
}) => {
  const fillLine = [amount, unit].filter(Boolean).join(' ');
  const qrValue = `https://www.sigmaaldrich.com/catalog/product/${materialNumber}`;
  const qrSize = Math.round(36 * SC);
  const pictoSize = Math.round(18 * SC);
  const noPicto = hazardPictogramIcons.length === 0;

  // Hazard text: signal word + all hazard statements + otherHazards joined
  const hazardLines = [
    ...hazardStatements,
    ...otherHazards,
  ].join(' ');

  return (
    <View ref={viewRef} style={s.card}>
      <View style={s.row}>
        {/* ── LEFT col: title + sub-blocks ── */}
        <View style={[s.leftCol, noPicto && s.leftColWide]}>
          {/* sub-block-1: safety-info = title-barcode + barcode */}
          <View style={s.safetyInfo}>
            {/* title-barcode */}
            <View style={s.titleBarcode}>
              <CustomText style={[s.productName, { fontSize: 8, lineHeight: 8 }]} numberOfLines={4}>
                {articleName}
              </CustomText>
              {!!casNumber && (
                <CustomText style={[s.casNo, { fontSize: 8 }]} numberOfLines={1}>
                  CAS-No: {casNumber}
                </CustomText>
              )}
            </View>
            {/* barcode: qty + QR + article no */}
            <View style={s.barcodeCol}>
              {!!fillLine && (
                <CustomText style={[s.quantity, { fontSize: 7 }]} numberOfLines={1} >{ fillLine}</CustomText>
              )}
              <View style={s.qrWrap}>
                <QRCodeSVG value={qrValue} size={qrSize} color="#000000" bgColor="#FFFFFF" />
              </View>
              {!!articleNumber && (
                <CustomText style={[s.articleNo, { fontSize: 8 }]} numberOfLines={1}>
                  {articleNumber}
                </CustomText>
              )}
            </View>
          </View>

          {/* sub-block-2: fill date + notes */}
          {!!(fillDate || revisionDate) && (
            <CustomText style={[s.fillDate, { fontSize: 8 }]} numberOfLines={1}>
              {FILL_DATE_LABEL}: {fillDate ?? revisionDate}
            </CustomText>
          )}
          {!!extraText && (
            <CustomText style={[s.notes, { fontSize: 8 }]} numberOfLines={2}>
              {NOTES_LABEL}: {extraText}
            </CustomText>
          )}

          {/* sub-block-3: disclaimer */}
          <CustomText style={[s.disclaimer, { fontSize: 6, lineHeight: 10 }]} numberOfLines={2}>
            {DISCLAIMER_LABEL}: {DISCLAIMER_TEXT}
          </CustomText>
        </View>

        {/* ── CENTER col: pictograms (hidden when none) ── */}
        {!noPicto && (
          <View style={s.pictoCol}>
            <PictogramColumn codes={hazardPictogramIcons} pictoSize={pictoSize} overlap={2} />
          </View>
        )}

        {/* ── RIGHT col: signal word + hazard text ── */}
        <View style={[s.dangerCol, noPicto && s.dangerColWide]}>
          {(!!signalWord || !!hazardLines) && (
            <CustomText style={[s.dangerText, { fontSize: 8 }]} numberOfLines={10}>
              {signalWord}: {hazardLines}
            </CustomText>
          )}
        </View>

      </View>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    width: 320,
    height: 130,
    backgroundColor: '#FFFFFF',
    borderRadius: 2,
    overflow: 'hidden',
    padding: 6,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
  },
  // LEFT column — 56mm proportion flex:56
  leftCol: { flex: 80, flexDirection: 'column', justifyContent: 'space-between', paddingRight: 2 },
  leftColWide: { flex: 70 },
  safetyInfo: { flex: 1, flexDirection: 'row' },
  titleBarcode: { flex: 3, flexDirection: 'column' },
  barcodeCol: { flex: 2, flexDirection: 'column', alignItems: 'flex-end', paddingLeft: 2 },
  // CENTER column — 21mm
  pictoCol: { width: 32, alignItems: 'center', justifyContent: 'flex-start' },
  // RIGHT column — 73mm
  dangerCol: { flex: 35, paddingLeft: 1, justifyContent: 'flex-start' },
  dangerColWide: { flex: 50 },
  // Text
  casNo: { color: '#1C1C1E', marginBottom: 1 },
  productName: { fontWeight: '700', color: '#1C1C1E' },
  quantity: { fontWeight: '600', color: '#1C1C1E', marginBottom: 0, lineHeight: 7},
  qrWrap: { borderWidth: 0.5, borderColor: '#E5E7EB', marginBottom: 1 },
  articleNo: { color: '#1C1C1E', textAlign: 'left' },
  fillDate: { color: '#1C1C1E', marginTop: 2 },
  notes: { color: '#1C1C1E', marginTop: 1 },
  disclaimer: { color: '#1C1C1E', marginTop: 2 },
  dangerText: { color: '#1C1C1E', lineHeight: 9 },
});

export default BigLabel;
