import { Text, View } from 'react-native';

type ItemProps = { title: string };
export default function Item({ title }: ItemProps) {
  return (
    <View>
      <Text>{title}</Text>
    </View>
  );
}
