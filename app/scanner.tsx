import {
  type BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { useState } from 'react';
import { Alert, Pressable, Text, View } from 'react-native';
import Screen from '@/components/screen';

export default function Scanner() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  const handleBarcodeScanned = (result: BarcodeScanningResult) => {
    if (scanned) return;

    setScanned(true);

    Alert.alert('Scanned', `Type: ${result.type}\nData: ${result.data}`, [
      {
        text: 'Scan again',
        onPress: () => setScanned(false),
      },
    ]);
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
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
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

      {scanned && (
        <View
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 40,
            alignItems: 'center',
          }}
        >
          <Pressable onPress={() => setScanned(false)}>
            <Text>Scan again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
