import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import {
  Camera,
  useCameraDevice,
  useCameraPermission,
  useCodeScanner,
} from 'react-native-vision-camera';
import { useTheme } from '@theme/index';
import { CaptionText, BodyText } from '@components/common/CustomText';
import Icon from '@components/icons/Icon';
import { BaseColors } from '@theme/colors';
import { parseGS1 } from '@utils/gs1Parser';
import { searchArticles } from '@services/api/atlasSearch.service';
import type { ArticleNavParam } from '@/types/navigation';
import { analytics } from '@services/analyticsService';

const RETICLE_SIZE = 240;

const BarcodeScreen: React.FC = () => {
  const { t } = useTranslation();
  const { theme, isDark } = useTheme();
  const navigation = useNavigation<any>();
  const insets = useSafeAreaInsets();
  const { hasPermission, requestPermission } = useCameraPermission();

  const device = useCameraDevice('back');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannedRef = useRef(false);

  // Request camera permission on mount
  useEffect(() => {
    if (hasPermission === false) {
      requestPermission();
    }
  }, [hasPermission, requestPermission]);

  // Enable scanning when screen is focused
  useFocusEffect(
    useCallback(() => {
      setIsScanning(true);
      scannedRef.current = false;
      setError(null);
      return () => {
        setIsScanning(false);
      };
    }, []),
  );

  // Code scanner with debounce
  const codeScanner = useCodeScanner({
    codeTypes: ['qr', 'data-matrix', 'ean-13', 'ean-8', 'code-128', 'code-39'],
    onCodeScanned: codes => {
      // Debounce: only process if we haven't scanned yet
      if (scannedRef.current || !isScanning || codes.length === 0) {
        return;
      }

      scannedRef.current = true;
      const code = codes[0];
      const rawValue = code.value ?? '';
      console.log('[Scanner] Code detected — type:', code.type, '| value:', JSON.stringify(rawValue));
      handleScanResult(rawValue);
    },
  });

  const handleScanResult = async (rawValue: string) => {
    const scanStartTime = Date.now();
    try {
      setIsLoading(true);
      setError(null);

      console.log('[Scanner] Raw scanned value:', JSON.stringify(rawValue));
      console.log('[Scanner] Raw value hex:', [...rawValue].map(c => c.charCodeAt(0).toString(16).padStart(2,'0')).join(' '));

      // Parse GS1 or use raw value
      const articleNumber = parseGS1(rawValue) ?? rawValue;

      console.log('[Scanner] Parsed articleNumber:', articleNumber);

      if (!articleNumber) {
        throw new Error(t('scanner.notFound'));
      }

      // Search for article using the material number
      const { results } = await searchArticles(articleNumber, 1);
      const scanTime = Date.now() - scanStartTime;

      if (!results || results.length === 0) {
        console.log('[Scanner] No results found for query:', articleNumber);
        // Log barcode scan failure
        analytics.logBarcodeScanned({
          barcode_value: rawValue,
          barcode_format: 'ean-128',
          scan_result: 'not_found',
          validity_area: 'EU',
          scan_time_ms: scanTime,
        });
        throw new Error(t('scanner.notFound'));
      }

      console.log('[Scanner] API returned', results.length, 'result(s)');

      const article = results[0];

      console.log('[Scanner] First article:', JSON.stringify(article));

      // Log successful barcode scan
      analytics.logBarcodeScanned({
        barcode_value: rawValue,
        barcode_format: 'ean-128',
        scan_result: 'success',
        material_number: article.materialNumber,
        validity_area: 'EU',
        scan_time_ms: scanTime,
      });

      // Navigate to article details
      const navParam: ArticleNavParam = {
        materialNumber: article.materialNumber,
        articleName: article.articleName,
        articleNumber: article.articleNumber,
        casNumber: article.casNumber,
        substance: article.substance,
      };

      // Use replace to avoid returning to scanner
      navigation.replace('ArticleDetail', { article: navParam });
    } catch (err) {
      // Allow retry on error
      scannedRef.current = false;
      setIsLoading(false);

      // Set error message
      const errorMsg =
        err instanceof Error ? err.message : t('scanner.notFound');
      setError(errorMsg);
    }
  };

  const handleClose = useCallback(() => {
    navigation.goBack();
  }, [navigation]);

  const handleTorchToggle = useCallback(() => {
    setTorchEnabled(!torchEnabled);
  }, [torchEnabled]);

  const handleOpenSettings = useCallback(() => {
    if (Platform.OS === 'ios') {
      Linking.openURL('app-settings:');
    } else {
      Linking.openSettings();
    }
  }, []);

  const styles = getStyles(theme, isDark);

  // Permission denied state
  if (hasPermission === false) {
    return (
      <View style={styles.root}>
        <View style={styles.permissionContainer}>
          <Icon name="scanner" size={64} color={theme.text.tertiary} />
          <BodyText
            style={[styles.permissionTitle, { color: theme.text.primary }]}
          >
            {t('scanner.permissionDenied')}
          </BodyText>
          <CaptionText
            style={[styles.permissionHint, { color: theme.text.secondary }]}
          >
            {t('scanner.permissionDeniedHint')}
          </CaptionText>
          <TouchableOpacity
            style={[
              styles.settingsBtn,
              { backgroundColor: BaseColors.merckPurple },
            ]}
            onPress={handleOpenSettings}
          >
            <BodyText style={styles.settingsBtnText}>
              {t('scanner.openSettings')}
            </BodyText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Simulator fallback
  if (!device) {
    return (
      <View style={styles.root}>
        <View style={styles.permissionContainer}>
          <Icon name="alert-circle" size={64} color={theme.text.tertiary} />
          <BodyText
            style={[styles.permissionTitle, { color: theme.text.primary }]}
          >
            Camera Not Available
          </BodyText>
          <CaptionText
            style={[styles.permissionHint, { color: theme.text.secondary }]}
          >
            Camera is not available on simulator. Test on a real device.
          </CaptionText>
          <TouchableOpacity
            style={[
              styles.settingsBtn,
              { backgroundColor: BaseColors.merckPurple },
            ]}
            onPress={handleClose}
          >
            <BodyText style={styles.settingsBtnText}>Go Back</BodyText>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      {/* Full-screen camera */}
      <Camera
        style={StyleSheet.absoluteFill}
        device={device}
        isActive={isScanning && !isLoading}
        torch={torchEnabled ? 'on' : 'off'}
        codeScanner={codeScanner}
      />

      {/* Dark overlay with reticle cutout */}
      <View style={styles.overlay}>
        {/* Top area */}
        <View style={styles.topArea} />

        {/* Middle row with left, reticle, right */}
        <View style={styles.middleRow}>
          {/* Left side */}
          <View style={styles.side} />

          {/* Reticle */}
          <View style={[styles.reticle, { borderColor: '#FFFFFF' }]}>
            {/* Corner accents */}
            <View
              style={[
                styles.corner,
                styles.topLeft,
                { borderColor: '#FFFFFF' },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.topRight,
                { borderColor: '#FFFFFF' },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.bottomLeft,
                { borderColor: '#FFFFFF' },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.bottomRight,
                { borderColor: '#FFFFFF' },
              ]}
            />
          </View>

          {/* Right side */}
          <View style={styles.side} />
        </View>

        {/* Bottom area */}
        <View style={styles.bottomArea} />
      </View>

      {/* Close button (top-left) — below safe area */}
      <TouchableOpacity
        style={[styles.closeBtn, { top: insets.top + 12, left: 16 }]}
        onPress={handleClose}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Icon name="close" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Torch button (top-right) — below safe area */}
      <TouchableOpacity
        style={[styles.torchBtn, { top: insets.top + 12, right: 16 }]}
        onPress={handleTorchToggle}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Icon
          name={torchEnabled ? 'flashlight' : 'flashlight'}
          size={24}
          color={torchEnabled ? '#FFD700' : '#FFFFFF'}
        />
      </TouchableOpacity>

      {/* Bottom instruction text */}
      <View style={styles.instructionContainer}>
        <CaptionText style={styles.instructionText}>
          {t('scanner.pointAtBarcode')}
        </CaptionText>
      </View>

      {/* Error banner */}
      {error && (
        <View
          style={[styles.errorBanner, { backgroundColor: BaseColors.error }]}
        >
          <CaptionText style={styles.errorText}>{error}</CaptionText>
          <TouchableOpacity
            onPress={() => {
              scannedRef.current = false;
              setError(null);
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <CaptionText style={styles.retryText}>
              {t('scanner.retry')}
            </CaptionText>
          </TouchableOpacity>
        </View>
      )}

      {/* Loading overlay */}
      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#FFFFFF" />
          <CaptionText style={styles.loadingText}>
            {t('scanner.lookingUp')}
          </CaptionText>
        </View>
      )}
    </View>
  );
};

const getStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    root: {
      flex: 1,
      backgroundColor: '#000000',
    },
    // Overlay
    overlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      flexDirection: 'column',
    },
    topArea: {
      flex: 1,
    },
    middleRow: {
      flexDirection: 'row',
      height: RETICLE_SIZE,
    },
    side: {
      flex: 1,
    },
    reticle: {
      width: RETICLE_SIZE,
      height: RETICLE_SIZE,
      borderWidth: 2,
      borderRadius: 12,
      position: 'relative',
    },
    corner: {
      position: 'absolute',
      width: 20,
      height: 20,
      borderWidth: 3,
    },
    topLeft: {
      top: -2,
      left: -2,
      borderRightWidth: 0,
      borderBottomWidth: 0,
      borderTopLeftRadius: 8,
    },
    topRight: {
      top: -2,
      right: -2,
      borderLeftWidth: 0,
      borderBottomWidth: 0,
      borderTopRightRadius: 8,
    },
    bottomLeft: {
      bottom: -2,
      left: -2,
      borderRightWidth: 0,
      borderTopWidth: 0,
      borderBottomLeftRadius: 8,
    },
    bottomRight: {
      bottom: -2,
      right: -2,
      borderLeftWidth: 0,
      borderTopWidth: 0,
      borderBottomRightRadius: 8,
    },
    bottomArea: {
      flex: 1,
    },
    // Buttons
    closeBtn: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 24,
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    torchBtn: {
      position: 'absolute',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      borderRadius: 24,
      width: 48,
      height: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    // Instruction text
    instructionContainer: {
      position: 'absolute',
      bottom: 80,
      left: 0,
      right: 0,
      alignItems: 'center',
    },
    instructionText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
    },
    // Error banner
    errorBanner: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      paddingHorizontal: 16,
      paddingVertical: 12,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    errorText: {
      color: '#FFFFFF',
      fontSize: 13,
      flex: 1,
    },
    retryText: {
      color: '#FFFFFF',
      fontSize: 12,
      fontWeight: '600',
      marginLeft: 8,
    },
    // Loading overlay
    loadingOverlay: {
      ...StyleSheet.absoluteFill,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    loadingText: {
      color: '#FFFFFF',
      fontSize: 14,
      marginTop: 16,
    },
    // Permission denied
    permissionContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingHorizontal: 32,
    },
    permissionTitle: {
      fontSize: 18,
      fontWeight: '600',
      marginTop: 20,
      marginBottom: 8,
      textAlign: 'center',
    },
    permissionHint: {
      fontSize: 14,
      textAlign: 'center',
      marginBottom: 24,
      lineHeight: 20,
    },
    settingsBtn: {
      paddingHorizontal: 24,
      paddingVertical: 12,
      borderRadius: 24,
      alignItems: 'center',
    },
    settingsBtnText: {
      color: '#FFFFFF',
      fontSize: 15,
      fontWeight: '600',
    },
  });

export default BarcodeScreen;
