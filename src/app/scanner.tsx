import {
  type AvailableLenses,
  type BarcodeScanningResult,
  type BarcodeType,
  CameraView,
  scanFromURLAsync,
  useCameraPermissions,
} from 'expo-camera';
import { router } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import {
  Alert,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import { Button } from 'react-native-paper';

import { getProductByBarcode } from '@/api/products';
import Screen from '@/components/screen';
import { baseUrl, fields } from '@/config';
import {
  errorHaptic,
  impactHaptic,
  successHaptic,
  warningHaptic,
} from '@/lib/haptics';
import { pickImageFromLibrary } from '@/lib/images/imagePicker';
import mapApiProductToEntity from '@/lib/mappers/productMapper';

const supportedBarcodeTypes: BarcodeType[] = [
  'ean13',
  'ean8',
  'upc_a',
  'upc_e',
  'qr',
  'code128',
  'code39',
];

function getPreferredBackLens(lenses: string[]) {
  const normalizedLenses = lenses.map((lens) => ({
    original: lens,
    normalized: lens.toLowerCase(),
  }));

  return (
    normalizedLenses.find(({ normalized }) => normalized === 'back camera')
      ?.original ??
    normalizedLenses.find(
      ({ normalized }) =>
        normalized.includes('wide') && !normalized.includes('ultra'),
    )?.original ??
    normalizedLenses.find(
      ({ normalized }) =>
        !normalized.includes('ultra') &&
        !normalized.includes('telephoto') &&
        !normalized.includes('front') &&
        !normalized.includes('true depth'),
    )?.original
  );
}

function showAlert(title: string, message: string, onPress?: () => void) {
  Alert.alert(title, message, onPress ? [{ text: 'OK', onPress }] : undefined);
}

export default function Scanner() {
  const { width, height } = useWindowDimensions();
  const [permission, requestPermission] = useCameraPermissions();
  const [isImporting, setIsImporting] = useState(false);
  const [selectedLens, setSelectedLens] = useState<string>();
  const isScanningRef = useRef(false);
  const isLandscape = width > height;
  const horizontalPadding = width < 380 ? 16 : 24;
  const frameWidth = Math.min(width * (isLandscape ? 0.45 : 0.72), 360);
  const frameHeight = Math.min(height * (isLandscape ? 0.42 : 0.24), 240);
  const sideShadeWidth = Math.max(0, (width - frameWidth) / 2);
  const topShadeHeight = Math.max(
    0,
    (height - frameHeight) * (isLandscape ? 0.44 : 0.46),
  );
  const bottomShadeHeight = Math.max(0, height - frameHeight - topShadeHeight);
  const cornerInset = Math.max(12, Math.min(frameWidth, frameHeight) * 0.08);
  const cornerSize = Math.max(28, Math.min(frameWidth, frameHeight) * 0.15);

  const unlockScanner = useCallback(() => {
    isScanningRef.current = false;
  }, []);

  function navigateToCreate({
    barcode,
    name,
    brand,
    categories,
    imageUrl,
  }: {
    barcode?: string;
    name?: string;
    brand?: string;
    categories?: string[];
    imageUrl?: string;
  }) {
    successHaptic();
    router.replace({
      pathname: '/create',
      params: {
        barcode,
        name,
        brand,
        categories: categories?.join(', '),
        imageUrl,
        source: 'scan',
      },
    });
  }

  function showScannerError(
    title: string,
    message: string,
    haptic: () => void,
  ) {
    haptic();
    showAlert(title, message, unlockScanner);
  }

  async function resolveScannedBarcode({
    data,
    type,
  }: Pick<BarcodeScanningResult, 'data' | 'type'>) {
    try {
      const response = await getProductByBarcode(baseUrl, data, fields);

      console.log(`Scan successful\nType: ${type}\nData: ${data}`);
      console.log(JSON.stringify(response, null, 2));

      if (response.status !== 1) {
        showScannerError(
          'Not found',
          'No product found for this barcode.',
          warningHaptic,
        );
        return;
      }

      const product = mapApiProductToEntity(response);

      if (!product) {
        showScannerError('Error', 'Could not map product data.', errorHaptic);
        return;
      }

      navigateToCreate({
        barcode: product.barcode,
        name: product.name,
        brand: product.brand,
        categories: product.categories,
        imageUrl: product.imageUrl,
      });
    } catch (error) {
      console.error('Barcode lookup failed:', error);
      showScannerError(
        'Request failed',
        'Could not fetch product data.',
        errorHaptic,
      );
    }
  }

  const handleBarcodeScanned = async ({
    data,
    type,
  }: BarcodeScanningResult) => {
    if (isScanningRef.current) return;

    isScanningRef.current = true;
    await resolveScannedBarcode({ data, type });
  };

  async function handleImportBarcode() {
    if (isImporting) {
      return;
    }

    setIsImporting(true);

    try {
      if (Platform.OS === 'ios') {
        warningHaptic();
        Alert.alert(
          'Limited on iPhone',
          'Scanning from gallery only supports QR codes on iOS. Product barcodes still need the live camera.',
        );
        return;
      }

      const uri = await pickImageFromLibrary({
        allowsEditing: false,
        quality: 1,
      });

      if (!uri) {
        return;
      }

      const results = await scanFromURLAsync(uri, supportedBarcodeTypes);
      const match = results[0];

      if (!match) {
        warningHaptic();
        Alert.alert(
          'No barcode found',
          'Try another photo where the barcode is larger and clearer.',
        );
        return;
      }

      isScanningRef.current = true;
      await resolveScannedBarcode(match);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === 'PHOTO_PERMISSION_DENIED'
      ) {
        warningHaptic();
        Alert.alert(
          'Permission needed',
          'Allow photo access to import a barcode image.',
        );
        return;
      }

      console.error('Barcode image scan failed:', error);
      errorHaptic();
      Alert.alert('Import failed', 'Could not scan a barcode from that image.');
    } finally {
      setIsImporting(false);
    }
  }

  const handleAvailableLensesChanged = useCallback(
    ({ lenses }: AvailableLenses) => {
      const preferredLens = getPreferredBackLens(lenses);

      setSelectedLens((currentLens) =>
        currentLens === preferredLens ? currentLens : preferredLens,
      );
    },
    [],
  );

  if (!permission) {
    return (
      <Screen
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: horizontalPadding,
        }}
      >
        <Text>Loading camera permission...</Text>
        <Button
          mode='text'
          onPress={() => {
            impactHaptic();
            void handleImportBarcode();
          }}
          loading={isImporting}
        >
          Scan from gallery
        </Button>
      </Screen>
    );
  }

  if (!permission.granted) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: horizontalPadding,
        }}
      >
        <Text>We need camera permission to scan barcodes.</Text>

        <Pressable
          onPress={() => {
            impactHaptic();
            void requestPermission();
          }}
        >
          <Text>Grant permission</Text>
        </Pressable>
        <Button
          mode='text'
          onPress={() => {
            impactHaptic();
            void handleImportBarcode();
          }}
          loading={isImporting}
        >
          Scan from gallery
        </Button>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        facing='back'
        selectedLens={selectedLens}
        onBarcodeScanned={handleBarcodeScanned}
        onAvailableLensesChanged={handleAvailableLensesChanged}
        barcodeScannerSettings={{
          barcodeTypes: supportedBarcodeTypes,
        }}
      />
      <View pointerEvents='none' style={styles.overlay}>
        <View
          style={[
            styles.topShade,
            {
              height: topShadeHeight,
              paddingHorizontal: horizontalPadding,
            },
            isLandscape && styles.topShadeLandscape,
          ]}
        >
          <Text style={styles.overlayTitle}>Scan barcode</Text>
          <Text style={styles.overlayHint}>
            Align the barcode inside the frame
          </Text>
        </View>
        <View style={styles.scanRow}>
          <View
            style={[
              styles.sideShade,
              { width: sideShadeWidth, height: frameHeight },
            ]}
          />
          <View
            style={[
              styles.scanFrame,
              { width: frameWidth, height: frameHeight },
            ]}
          >
            <View
              style={[
                styles.corner,
                styles.cornerTopLeft,
                {
                  width: cornerSize,
                  height: cornerSize,
                  top: cornerInset,
                  left: cornerInset,
                },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.cornerTopRight,
                {
                  width: cornerSize,
                  height: cornerSize,
                  top: cornerInset,
                  right: cornerInset,
                },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.cornerBottomLeft,
                {
                  width: cornerSize,
                  height: cornerSize,
                  bottom: cornerInset,
                  left: cornerInset,
                },
              ]}
            />
            <View
              style={[
                styles.corner,
                styles.cornerBottomRight,
                {
                  width: cornerSize,
                  height: cornerSize,
                  bottom: cornerInset,
                  right: cornerInset,
                },
              ]}
            />
          </View>
          <View
            style={[
              styles.sideShade,
              { width: sideShadeWidth, height: frameHeight },
            ]}
          />
        </View>
        <View style={[styles.bottomShade, { height: bottomShadeHeight }]} />
      </View>
      <View style={styles.actions}>
        {Platform.OS !== 'ios' && (
          <Button
            mode='contained-tonal'
            icon='image'
            onPress={() => {
              impactHaptic();
              void handleImportBarcode();
            }}
            loading={isImporting}
          >
            Scan from gallery
          </Button>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  topShade: {
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: 28,
  },
  topShadeLandscape: {
    justifyContent: 'center',
    paddingBottom: 16,
  },
  overlayTitle: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  overlayHint: {
    marginTop: 8,
    color: 'rgba(255, 255, 255, 0.82)',
    fontSize: 15,
    textAlign: 'center',
  },
  scanRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sideShade: {
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  scanFrame: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  corner: {
    position: 'absolute',
    borderColor: '#fff',
  },
  cornerTopLeft: {
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  bottomShade: {
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  actions: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
});
