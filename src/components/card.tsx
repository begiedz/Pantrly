import { Avatar, type AvatarIconProps, Button, Card } from 'react-native-paper';
import type { ProductEntity } from '@/types';

const LeftContent = ({product, size }: {product:ProductEntity, size?: number }) => (
  <Avatar.Image source={{uri:product.imageUrl}} size={size} />
);

type PantryCardProps = {
  product: ProductEntity;
};

export default function PantryCard({ product }: PantryCardProps) {
  return (
    <Card mode='contained'>
      <Card.Title
        title={product.name}
        subtitle={product.brand}
        left={({size})=> <LeftContent product={product} size={size}/>}
      />
      {/* <Card.Content>
      <Text variant='titleLarge'>Card title</Text>
      <Text variant='bodyMedium'>Card content</Text>
    </Card.Content>
    <Card.Cover source={{ uri: 'https://picsum.photos/700' }} /> */}
      {/* <Card.Actions>
        <Button>Edit</Button>
        <Button>Ok</Button>
      </Card.Actions> */}
    </Card>
  );
}
