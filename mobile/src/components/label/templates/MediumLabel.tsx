/**
 * Medium label template — 100 × 30 mm
 *
 * Same 3-col structure as Big. Key difference from Ionic medium-actual-label:
 * fill date, notes, disclaimer are INSIDE the left title-barcode block
 * (not in separate sub-blocks below), making it compact for the smaller height.
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

const MediumLabel: React.FC<LabelTemplateProps> = ({
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
  const fillLine = [amount, unit].filter(Boolean).join(' ');
  const qrValue = `https://www.sigmaaldrich.com/catalog/product/${materialNumber}`;
  const qrSize = 26;
  const pictoSize = 20;
  const noPicto = hazardPictogramIcons.length === 0;
  const hazardLines = [...hazardStatements, ...otherHazards].join('; ');

  return (
    <View ref={viewRef} style={s.card}>
      <View style={s.row}>

        {/* ── LEFT col ── */}
        <View style={[s.leftCol, noPicto && s.leftColWide]}>
          <View style={s.safetyInfo}>
            {/* title-barcode: CAS + name + fill date + notes + disclaimer stacked */}
            <View style={s.titleBarcode}>
              {!!casNumber && (
                <CustomText style={s.casNo} numberOfLines={1}>
                  CAS-No: {casNumber}
                </CustomText>
              )}
              <CustomText style={s.productName} numberOfLines={3}>
                {articleName}
              </CustomText>
              {!!(fillDate || revisionDate) && (
                <CustomText style={s.fillDate} numberOfLines={1}>
                  {FILL_DATE_LABEL}: {fillDate ?? revisionDate}
                </CustomText>
              )}
              {!!extraText && (
                <CustomText style={s.notes} numberOfLines={1}>
                  {NOTES_LABEL}: {extraText}
                </CustomText>
              )}
              <CustomText style={s.disclaimer} numberOfLines={2}>
                {DISCLAIMER_LABEL}: {DISCLAIMER_TEXT}
              </CustomText>
            </View>
            {/* barcode */}
            <View style={s.barcodeCol}>
              {!!fillLine && (
                <CustomText style={s.quantity} numberOfLines={1}>
                  {fillLine}
                </CustomText>
              )}
              <View style={s.qrWrap}>
                <QRCodeSVG value={qrValue} size={qrSize} color="#000000" bgColor="#FFFFFF" />
              </View>
              {!!articleNumber && (
                <CustomText style={s.articleNo} numberOfLines={1}>
                  {articleNumber}
                </CustomText>
              )}
            </View>
          </View>
        </View>

        {/* ── CENTER col: pictograms ── */}
        {!noPicto && (
          <View style={s.pictoCol}>
            <PictogramColumn codes={hazardPictogramIcons} pictoSize={pictoSize} overlap={1} />
          </View>

        )}

        {/* ── RIGHT col: signal word + hazard text ── */}
        <View style={[s.dangerCol, noPicto && s.dangerColWide]}>
          {(!!signalWord || !!hazardLines) && (
              <CustomText style={s.hazardText} numberOfLines={4}>
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
    width: 280,
    height: 84,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 2,
    overflow: 'hidden',
    padding: 3,
  },
  row: { flex: 1, flexDirection: 'row' },
  leftCol: { flex: 56, flexDirection: 'column', paddingRight: 2 },
  leftColWide: { flex: 80 },
  safetyInfo: { flex: 1, flexDirection: 'row' },
  titleBarcode: { flex: 3, flexDirection: 'column' },
  barcodeCol: { flex: 2, flexDirection: 'column', alignItems: 'flex-start', paddingLeft: 2 },
  pictoCol: { width: 24, alignItems: 'center', justifyContent: 'flex-start' },
  dangerCol: { flex: 60, paddingLeft: 2 },
  dangerColWide: { flex: 60 },
  casNo: { fontSize: 7, lineHeight: 8, color: '#1C1C1E', marginBottom: 1 },
  productName: { fontSize: 8, lineHeight: 9, fontWeight: '700', color: '#1C1C1E' },
  quantity: { fontSize: 7, lineHeight: 8, fontWeight: '600', color: '#1C1C1E', marginBottom: 1 },
  qrWrap: { borderWidth: 0.5, borderColor: '#E5E7EB', marginBottom: 1 },
  articleNo: { fontSize: 7, lineHeight: 8, color: '#1C1C1E' },
  fillDate: { fontSize: 7, lineHeight: 8, color: '#1C1C1E', marginTop: 1 },
  notes: { fontSize: 7, lineHeight: 8, color: '#1C1C1E', marginTop: 1 },
  disclaimer: { fontSize: 6, lineHeight: 8, color: '#1C1C1E', marginTop: 1 },
  hazardText: { fontSize: 7, lineHeight: 8, color: '#1C1C1E' },
});

export default MediumLabel;
