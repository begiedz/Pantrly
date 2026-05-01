import { router } from 'expo-router';
import { Avatar, Card, IconButton } from 'react-native-paper';
import { getProductImageUri } from '@/lib/images/productImages';
import { impactHaptic } from '@/lib/haptics';
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

const RightContent = ({ id }: { id: string }) => {
  return (
    <IconButton
      icon={'chevron-right'}
      onPress={() => {
        impactHaptic();
        router.push({
          pathname: '/product/[id]',
          params: { id },
        });
      }}
    />
  );
};

export default function PantryCard({ product }: PantryCardProps) {
  const title = product.name || product.brand;

  const bestBeforeDate = product?.bestBefore
    ? new Date(product.bestBefore).toLocaleDateString('en-GB')
    : undefined;

  // gets last category without "en:" prefix
  const category = capitalize(getCategory(product?.categories));

  const subtitle =
    [product.name ? product.brand : null, bestBeforeDate, category]
      .filter(Boolean)
      .join(' | ') || undefined;

  return (
    <Card mode='contained'>
      <Card.Title
        titleVariant='titleMedium'
        title={title}
        subtitle={subtitle}
        left={({ size }) => (
          <LeftContent imageUri={getProductImageUri(product)} size={size} />
        )}
        right={() => <RightContent id={product.id} />}
      />
    </Card>
  );
}
