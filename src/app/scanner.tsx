import {
  type BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { router } from 'expo-router';
import { useRef } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';

import { getProductByBarcode } from '@/api/products';
import Screen from '@/components/screen';
import { baseUrl, fields } from '@/config';
import mapApiProductToEntity from '@/lib/mappers/productMapper';
import { addProduct } from '@/lib/store/appStore';
import type { ProductEntity } from '@/types';

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const isScanningRef = useRef(false);

  const unlockScanner = () => {
    isScanningRef.current = false;
  };

  const showRequestError = () => {
    Alert.alert('Request failed', 'Could not fetch product data.', [
      { text: 'OK', onPress: unlockScanner },
    ]);
  };

  const showProductNotFound = () => {
    Alert.alert('Not found', 'No product found for this barcode.', [
      { text: 'OK', onPress: unlockScanner },
    ]);
  };

  const showMappedProductError = () => {
    Alert.alert('Error', 'Could not map product data.', [
      { text: 'OK', onPress: unlockScanner },
    ]);
  };

  const handleSuccess = (product: ProductEntity) => {
    Alert.alert('Scan successful!', `${product.name}\n${product.brand}`, [
      {
        text: 'Scan again',
        onPress: unlockScanner,
      },
      {
        text: 'Add to Pantry',
        isPreferred: true,
        onPress: () => {
          addProduct(product);
          router.replace('/');
        },
      },
    ]);
  };

  const handleBarcodeScanned = async ({
    data,
    type,
  }: BarcodeScanningResult) => {
    if (isScanningRef.current) return;

    isScanningRef.current = true;

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

      handleSuccess(product);
    } catch (error) {
      console.error('Barcode lookup failed:', error);
      showRequestError();
    }
  };

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
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <CameraView
        style={{ flex: 1 }}
        facing='back'
        selectedLens='builtInWideAngleCamera'
        onBarcodeScanned={handleBarcodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: [
            'ean13',
            'ean8',
            'upc_a',
            'upc_e',
            'qr',
            'code128',
            'code39',
          ],
        }}
      />
    </View>
  );
}
