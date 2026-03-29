import { useStore } from '@tanstack/react-store';
import { Link, router } from 'expo-router';
import { FlatList, StyleSheet, Text, View } from 'react-native';
import { FAB } from 'react-native-paper';
import Card from '@/components/card';
import Screen from '@/components/screen';
import { appStore } from '@/store/appStore';

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
  const products = useStore(appStore, (state) => state.products);
console.log('AppStore Products:',products);
  return (
    <Screen>
      <FlatList
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={{ margin: 16 }}
        data={products}
        renderItem={({item}) => <Card product={item} />}
        keyExtractor={(product) => product.id}
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
