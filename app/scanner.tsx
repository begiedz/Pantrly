import {
  type BarcodeScanningResult,
  CameraView,
  useCameraPermissions,
} from 'expo-camera';
import { useState } from 'react';
import { Alert, Pressable, View } from 'react-native';
import { Text } from '@/components/ui/text';

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
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 24,
        }}
      >
        <Text>Loading camera permission...</Text>
      </View>
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
        <Text className='mb-4 text-center'>
          We need camera permission to scan barcodes.
        </Text>

        <Pressable
          onPress={requestPermission}
          className='rounded-xl bg-black px-4 py-3 dark:bg-white'
        >
          <Text className='text-white dark:text-black'>Grant permission</Text>
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
          <Pressable
            onPress={() => setScanned(false)}
            className='rounded-xl bg-black/80 px-4 py-3'
          >
            <Text className='text-white'>Scan again</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
