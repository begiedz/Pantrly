import { Avatar, type AvatarIconProps, Button, Card } from 'react-native-paper';

const LeftContent = (props: AvatarIconProps) => (
  <Avatar.Icon {...props} icon='folder' />
);

const MyComponent = ({ item }: any) => (
  <Card>
    <Card.Title
      title={item.title}
      subtitle={`${item.id} item subtitle`}
      left={LeftContent}
    />
    {/* <Card.Content>
      <Text variant='titleLarge'>Card title</Text>
      <Text variant='bodyMedium'>Card content</Text>
    </Card.Content>
    <Card.Cover source={{ uri: 'https://picsum.photos/700' }} /> */}
    <Card.Actions>
      <Button>Edit</Button>
      <Button>Ok</Button>
    </Card.Actions>
  </Card>
);

export default MyComponent;
