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
  View,
} from 'react-native';
import { Button } from 'react-native-paper';

import { getProductByBarcode } from '@/api/products';
import Screen from '@/components/screen';
import { baseUrl, fields } from '@/config';
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

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [isImporting, setIsImporting] = useState(false);
  const [selectedLens, setSelectedLens] = useState<string>();
  const isScanningRef = useRef(false);

  const unlockScanner = useCallback(() => {
    isScanningRef.current = false;
  }, []);

  const navigateToCreate = useCallback(
    ({
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
    }) => {
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
    },
    [],
  );

  const showRequestError = useCallback(() => {
    Alert.alert('Request failed', 'Could not fetch product data.', [
      { text: 'OK', onPress: unlockScanner },
    ]);
  }, [unlockScanner]);

  const showProductNotFound = useCallback(() => {
    Alert.alert('Not found', 'No product found for this barcode.', [
      { text: 'OK', onPress: unlockScanner },
    ]);
  }, [unlockScanner]);

  const showMappedProductError = useCallback(() => {
    Alert.alert('Error', 'Could not map product data.', [
      { text: 'OK', onPress: unlockScanner },
    ]);
  }, [unlockScanner]);

  const resolveScannedBarcode = useCallback(
    async ({ data, type }: Pick<BarcodeScanningResult, 'data' | 'type'>) => {
      try {
        const response = await getProductByBarcode(baseUrl, data, fields);

        console.log(`Scan successful\nType: ${type}\nData: ${data}`);
        console.log(JSON.stringify(response, null, 2));

        if (response?.status !== 1) {
          showProductNotFound();
          return;
        }

        const product = mapApiProductToEntity(response);

        if (!product) {
          showMappedProductError();
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
        showRequestError();
      }
    },
    [
      navigateToCreate,
      showMappedProductError,
      showProductNotFound,
      showRequestError,
    ],
  );

  const handleBarcodeScanned = async ({
    data,
    type,
  }: BarcodeScanningResult) => {
    if (isScanningRef.current) return;

    isScanningRef.current = true;
    await resolveScannedBarcode({ data, type });
  };

  const handleImportBarcode = useCallback(async () => {
    if (isImporting) {
      return;
    }

    setIsImporting(true);

    try {
      if (Platform.OS === 'ios') {
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
        Alert.alert(
          'Permission needed',
          'Allow photo access to import a barcode image.',
        );
        return;
      }

      console.error('Barcode image scan failed:', error);
      Alert.alert('Import failed', 'Could not scan a barcode from that image.');
    } finally {
      setIsImporting(false);
    }
  }, [isImporting, resolveScannedBarcode]);

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
          paddingHorizontal: 24,
        }}
      >
        <Text>Loading camera permission...</Text>
        <Button mode='text' onPress={handleImportBarcode} loading={isImporting}>
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
          paddingHorizontal: 24,
        }}
      >
        <Text>We need camera permission to scan barcodes.</Text>

        <Pressable onPress={requestPermission}>
          <Text>Grant permission</Text>
        </Pressable>
        <Button mode='text' onPress={handleImportBarcode} loading={isImporting}>
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
        <View style={styles.topShade}>
          <Text style={styles.overlayTitle}>Scan barcode</Text>
          <Text style={styles.overlayHint}>
            Align the barcode inside the frame
          </Text>
        </View>
        <View style={styles.scanRow}>
          <View style={styles.sideShade} />
          <View style={styles.scanFrame}>
            <View style={[styles.corner, styles.cornerTopLeft]} />
            <View style={[styles.corner, styles.cornerTopRight]} />
            <View style={[styles.corner, styles.cornerBottomLeft]} />
            <View style={[styles.corner, styles.cornerBottomRight]} />
          </View>
          <View style={styles.sideShade} />
        </View>
        <View style={styles.bottomShade} />
      </View>
      <View style={styles.actions}>
        {Platform.OS !== 'ios' && (
          <Button
            mode='contained-tonal'
            icon='image'
            onPress={handleImportBarcode}
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
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 28,
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
    flex: 1,
    height: 220,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  scanFrame: {
    width: 280,
    height: 220,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.35)',
  },
  corner: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderColor: '#fff',
  },
  cornerTopLeft: {
    top: 16,
    left: 16,
    borderTopWidth: 4,
    borderLeftWidth: 4,
  },
  cornerTopRight: {
    top: 16,
    right: 16,
    borderTopWidth: 4,
    borderRightWidth: 4,
  },
  cornerBottomLeft: {
    bottom: 16,
    left: 16,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
  },
  cornerBottomRight: {
    right: 16,
    bottom: 16,
    borderRightWidth: 4,
    borderBottomWidth: 4,
  },
  bottomShade: {
    flex: 1.2,
    backgroundColor: 'rgba(0, 0, 0, 0.52)',
  },
  actions: {
    position: 'absolute',
    left: 16,
    right: 16,
    bottom: 24,
  },
});
