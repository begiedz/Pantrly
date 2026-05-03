import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Avatar, Card, IconButton, Text } from 'react-native-paper';
import { impactHaptic } from '@/lib/haptics';
import { getProductImageUri } from '@/lib/images/productImages';
import { capitalize, getCategory } from '@/lib/utils';
import type { ProductEntity } from '@/types';

type PantryCardProps = {
  product: ProductEntity;
};

const LeftContent = ({
  imageUri,
  size,
}: {
  imageUri?: string;
  size?: number;
}) =>
  imageUri ? (
    <Avatar.Image source={{ uri: imageUri }} size={size} />
  ) : (
    <Avatar.Icon icon='image-outline' size={size} />
  );

export default function PantryCard({ product }: PantryCardProps) {
  const title = product.name || product.brand;

  const bestBeforeDate = product?.bestBefore
    ? new Date(product.bestBefore).toLocaleDateString('en-GB')
    : undefined;

  // gets last category without "en:" prefix
  const category = capitalize(getCategory(product?.categories));
  const company = product.name ? product.brand : undefined;

  const handlePress = () => {
    impactHaptic();
    router.push({
      pathname: '/product/[id]',
      params: { id: product.id },
    });
  };

  return (
    <Card mode='contained' onPress={handlePress}>
      <Card.Content style={styles.content}>
        <View style={styles.row}>
          <View style={styles.left}>
            <LeftContent imageUri={getProductImageUri(product)} size={56} />
          </View>

          <View style={styles.body}>
            {title && (
              <Text variant='titleMedium' numberOfLines={1}>
                {title}
              </Text>
            )}

            {company && (
              <Text variant='bodySmall' style={styles.meta}>
                {company}
              </Text>
            )}

            {category && (
              <Text variant='bodySmall' style={styles.meta}>
                {category}
              </Text>
            )}

            {bestBeforeDate && (
              <Text variant='bodySmall' style={styles.meta}>
                {bestBeforeDate}
              </Text>
            )}
          </View>

          <View style={styles.right}>
            <IconButton icon='chevron-right' />
          </View>
        </View>
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 14,
  },
  row: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  left: {
    marginRight: 16,
  },
  body: {
    flex: 1,
    gap: 2,
  },
  right: {
    marginLeft: 8,
  },
  meta: {
    opacity: 0.78,
  },
});
