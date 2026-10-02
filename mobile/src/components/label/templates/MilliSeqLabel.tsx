/**
 * Milli-Seq label template — 28.5 × 43.5 mm (portrait)
 *
 * 2-column horizontal layout matching Ionic milli-actual-label:
 *   LEFT col (30mm): product name · CAS-No · fill date · notes
 *                    └─ bottom: signal word + disclaimer (absolute bottom)
 *   CENTER col (13mm): pictogram stack
 *   RIGHT sub-col (barcode): qty + QR + article no
 *
 * No right "danger" text column (hazard statements omitted — too small).
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

const MilliSeqLabel: React.FC<LabelTemplateProps> = ({
  articleName,
  materialNumber,
  articleNumber,
  casNumber,
  hazardPictogramIcons = [],
  signalWord,
  amount,
  unit,
  revisionDate,
  fillDate,
  extraText,
  viewRef,
}) => {
  const fillLine = [amount, unit].filter(Boolean).join(' ');
  const qrValue = `https://www.sigmaaldrich.com/catalog/product/${materialNumber}`;
  const qrSize = 22;
  const noPicto = hazardPictogramIcons.length === 0;

  return (
    <View ref={viewRef} style={s.card}>
      <View style={s.row}>

        {/* ── LEFT col: text content ── */}
        <View style={[s.leftCol, noPicto && s.leftColWide]}>
          {/* sub-block-1: name + CAS + fill date */}
          <View style={s.subBlock1}>
            <CustomText style={s.productName} numberOfLines={3}>
              {articleName}
            </CustomText>
            {!!casNumber && (
              <CustomText style={s.casNo} numberOfLines={1}>
                CAS-No: {casNumber}
              </CustomText>
            )}
            {!!(fillDate || revisionDate) && (
              <CustomText style={s.fillDate} numberOfLines={1}>
                {FILL_DATE_LABEL}: {fillDate ?? revisionDate}
              </CustomText>
            )}
          </View>

          {/* sub-block-2: notes */}
          {!!extraText && (
            <CustomText style={s.notes} numberOfLines={2}>
              {NOTES_LABEL}: {extraText}
            </CustomText>
          )}

          {/* submerge (pinned bottom): signal word + disclaimer + pictograms */}
          <View style={s.submerge}>
            {!!signalWord && (
              <CustomText style={s.signalWord} numberOfLines={1}>
                {signalWord}
              </CustomText>
            )}
            <CustomText style={s.disclaimer} numberOfLines={2}>
              {DISCLAIMER_LABEL}: {DISCLAIMER_TEXT}
            </CustomText>
            {!noPicto && (
              <View style={s.bottomPictoRow}>
                <PictogramColumn codes={hazardPictogramIcons} pictoSize={10} overlap={0.5} />
              </View>
            )}
          </View>
        </View>

        {/* ── BARCODE col: qty + QR + article no ── */}
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
            <CustomText style={s.articleNo} numberOfLines={2}>
              {articleNumber}
            </CustomText>
          )}
        </View>

      </View>
    </View>
  );
};

const s = StyleSheet.create({
  card: {
    width: 100,
    height: 156,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CCCCCC',
    borderRadius: 2,
    overflow: 'hidden',
    padding: 3,
  },
  row: { flex: 1, flexDirection: 'row' },
  leftCol: { flex: 30, flexDirection: 'column', justifyContent: 'space-between', paddingRight: 2 },
  leftColWide: { flex: 43 },
  subBlock1: { flexDirection: 'column' },
  submerge: { marginTop: 'auto' as any },
  bottomPictoRow: { marginTop: 1, alignItems: 'center' },
  barcodeCol: { flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start' },
  productName: { fontSize: 7, lineHeight: 9, fontWeight: '700', color: '#1C1C1E' },
  casNo: { fontSize: 6, lineHeight: 7, color: '#1C1C1E', marginTop: 1 },
  fillDate: { fontSize: 6, lineHeight: 7, color: '#1C1C1E', marginTop: 1 },
  notes: { fontSize: 6, lineHeight: 7, color: '#1C1C1E', marginTop: 1 },
  signalWord: { fontSize: 7, lineHeight: 8, fontWeight: '700', color: '#1C1C1E' },
  disclaimer: { fontSize: 6, lineHeight: 7, color: '#1C1C1E', marginTop: 1 },
  quantity: { fontSize: 6, lineHeight: 7, color: '#1C1C1E', fontWeight: '600', marginBottom: 2 },
  qrWrap: { borderWidth: 0.5, borderColor: '#E5E7EB', marginBottom: 1, justifyContent: 'center', alignItems: 'center' },
  articleNo: { fontSize: 6, lineHeight: 7, color: '#1C1C1E' },
});

export default MilliSeqLabel;
