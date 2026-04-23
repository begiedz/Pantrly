import { Stack, useLocalSearchParams } from 'expo-router';
import { Image } from 'react-native';
import { Text } from 'react-native-paper';
import Screen from '@/components/screen';
import { getProductById } from '@/lib/store/appStore';

export default function ProductDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const product = getProductById(id); // const load = useCallback(async () => {
  //   try {
  //     const n = await getNote(id);
  //     if (!n) return Alert.alert('Not found');
  //     setProduct(n);
  //   } catch (e: any) {
  //     Alert.alert('Error', e?.message ?? String(e));
  //   }
  // }, [id]);

  return (
    <>
      <Stack.Screen
        options={{
          title: product?.name || product?.brand || 'Product Details',
        }}
      />
      <Screen style={{ padding: 16 }}>
        <Text>{product?.imageUrl}</Text>
        <Image src={product?.imageUrl} style={{ width: 100, height: 100 }} />
        <Text>{product?.name}</Text>
        <Text>{product?.brand}</Text>
        <Text>{product?.barcode}</Text>
        <Text>{product?.bestBefore}</Text>
        <Text>{product?.categories}</Text>
      </Screen>
    </>
  );
}
