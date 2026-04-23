import { Stack, useLocalSearchParams } from 'expo-router';
import { Image, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Screen from '@/components/screen';
import { getProductImageUri } from '@/lib/images/productImages';
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
  const imageUri = getProductImageUri(product);

  return (
    <>
      <Stack.Screen
        options={{
          title: product?.name || product?.brand || 'Product Details',
        }}
      />
      <Screen style={{ padding: 16 }}>
        {imageUri ? (
          <Image
            source={{ uri: imageUri }}
            style={styles.image}
            resizeMode='cover'
          />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text variant='bodyMedium'>No image</Text>
          </View>
        )}
        <Text>{product?.name}</Text>
        <Text>{product?.brand}</Text>
        <Text>{product?.barcode}</Text>
        <Text>{product?.bestBefore}</Text>
        <Text>{product?.categories?.join(', ')}</Text>
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 160,
    height: 160,
    borderRadius: 12,
    marginBottom: 16,
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#e5e7eb',
  },
});
