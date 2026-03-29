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
import mapApiProductToEntity from '@/mappers/productMapper';
import { addProduct } from '@/store/appStore';

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const scanLockRef = useRef(false);

  const resetScanner = () => {
    scanLockRef.current = false;
  };

  const handleBarcodeScanned = async (result: BarcodeScanningResult) => {
    if (scanLockRef.current) return;

    scanLockRef.current = true;

    const response = await getProductByBarcode(baseUrl, result.data, fields);

    console.log(`Scan Successful\nType: ${result.type}\nData: ${result.data}`);
    console.log(JSON.stringify(response, null, 2));

    if (response && response.status === 1) {
      const product = mapApiProductToEntity(response);

      if (!product) {
        resetScanner();
        return;
      }

      Alert.alert('Scan successful!', `${product.name}\n${product.brand}`, [
        {
          text: 'Scan again',
          onPress: resetScanner,
        },
        {
          text: 'Add to Pantrly',
          onPress: () => {
            addProduct(product);
            router.replace('/');
          },
          isPreferred: true,
        },
      ]);
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
