import { router } from 'expo-router';
import { Avatar, Card, IconButton } from 'react-native-paper';
import type { ProductEntity } from '@/types';

type PantryCardProps = {
  product: ProductEntity;
};

const LeftContent = ({
  imageUrl,
  size,
}: {
  imageUrl?: string;
  size?: number;
}) => <Avatar.Image source={{ uri: imageUrl }} size={size} />;

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
          <LeftContent imageUrl={product.imageUrl} size={size} />
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
