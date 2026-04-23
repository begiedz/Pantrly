import { router } from 'expo-router';
import { Avatar, Card, IconButton } from 'react-native-paper';
import { getProductImageUri } from '@/lib/images/productImages';
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
      onPress={() =>
        router.push({
          pathname: '/product/[id]',
          params: { id },
        })
      }
    />
  );
};

export default function PantryCard({ product }: PantryCardProps) {
  const title = product.name || product.brand;
  const subtitle =
    [product.name ? product.brand : null, product.bestBefore]
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
      {/* <Card.Content>
        <Text variant='titleLarge'>Card title</Text>
        <Text variant='bodyMedium'>Card content</Text>
      </Card.Content> */}
    </Card>
  );
}
