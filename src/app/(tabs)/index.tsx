import { useStore } from '@tanstack/react-store';
import { Link, router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import Card from '@/components/card';
import Screen from '@/components/screen';
import { appStore } from '@/lib/store/appStore';

export default function PantryScreen() {
  const products = useStore(appStore, (state) => state.products);

  return (
    <Screen>
      <FlatList
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={{ flexGrow: 1, margin: 16 }}
        data={products}
        renderItem={({ item }) => <Card product={item} />}
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

const Separator = () => <View style={{ height: 16 }} />;

const Welcome = () => (
  <View
    style={{
      alignItems: 'center',
      flex: 1,
      justifyContent: 'center',
    }}
  >
    <Text>Ply</Text>

    <View style={{ alignItems: 'center' }}>
      <Text>Welcome to Pantrly!</Text>
      <Text>Your current pantry is empty.</Text>

      <Link
        href='/scanner'
        style={{
          textDecorationLine: 'underline',
        }}
      >
        <Text>Let&apos;s start by scanning some items!</Text>
      </Link>
    </View>
  </View>
);

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
