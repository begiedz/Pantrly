import { Link, router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { FAB } from 'react-native-paper';
import Card from '@/components/card';
import Screen from '@/components/screen';

const DATA = [
  { id: '1', title: 'Item 1' },
  { id: '2', title: 'Item 2' },
  { id: '3', title: 'Item 3' },
  { id: '4', title: 'Item 4' },
  { id: '5', title: 'Item 5' },
  { id: '6', title: 'Item 6' },
  { id: '7', title: 'Item 7' },
  { id: '8', title: 'Item 8' },
  { id: '9', title: 'Item 9' },
  { id: '10', title: 'Item 10' },
  { id: '11', title: 'Item 11' },
  { id: '12', title: 'Item 12' },
  { id: '13', title: 'Item 13' },
  { id: '14', title: 'Item 14' },
  { id: '15', title: 'Item 15' },
  { id: '16', title: 'Item 16' },
  { id: '17', title: 'Item 17' },
  { id: '18', title: 'Item 18' },
  { id: '19', title: 'Item 19' },
  { id: '20', title: 'Item 20' },
  { id: '21', title: 'Item 21' },
  { id: '22', title: 'Item 22' },
  { id: '23', title: 'Item 23' },
  { id: '24', title: 'Item 24' },
];

const Separator = () => <View style={{ height: 16 }} />;

const Welcome = () => (
  <View>
    <Text>Ply</Text>

    <View>
      <Text>Welcome to Pantrly!</Text>
      <Text>Your current pantry is empty.</Text>

      <Link href='/scanner'>
        <Text>Let&apos;s start by scanning some items!</Text>
      </Link>
    </View>
  </View>
);

export default function PantryScreen() {
  return (
    <Screen>
      <FlatList
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={{ margin: 16 }}
        data={DATA}
        renderItem={({ item }) => <Card item={item} />}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={Separator}
        ListEmptyComponent={Welcome}
      />
      <FAB
        icon='barcode-scan'
        onPress={() => router.push('/scanner')}
        style={styles.fab}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
