import { useStore } from '@tanstack/react-store';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Image, View } from 'react-native';
import { FAB, Text } from 'react-native-paper';
import Card from '@/components/card';
import Screen from '@/components/screen';
import { appStore } from '@/lib/store/appStore';

export default function PantryScreen() {
  const products = useStore(appStore, (state) => state.products);
  const [state, setState] = useState({ open: false });

  const onStateChange = ({ open }: { open: boolean }) => setState({ open });
  const { open } = state;
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
      <FAB.Group
        open={open}
        visible
        icon={open ? 'format-list-bulleted' : 'plus'}
        actions={[
          {
            icon: 'pencil',
            label: 'Manual',
            onPress: () => router.push('/create'),
          },
          {
            icon: 'numeric',
            label: 'Barcode',
            onPress: () => {},
          },
          {
            icon: 'image',
            label: 'Image',
            onPress: () =>
              router.push({
                pathname: '/scanner',
                params: { source: 'gallery' },
              }),
          },
          {
            icon: 'barcode-scan',
            label: 'Scan',
            onPress: () => router.push('/scanner'),
          },
        ]}
        onStateChange={onStateChange}
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
    <Image
      style={{ width: 100, height: 100, marginBottom: 16 }}
      resizeMode='contain'
      source={require('@/assets/images/icon.png')}
    />

    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, fontWeight: 600 }}>Welcome to Pantrly!</Text>
      <Text>Your current pantry is empty.</Text>

      <Link
        href='/scanner'
        style={{
          textDecorationLine: 'underline',
          marginTop: 16,
        }}
      >
        <Text>Let&apos;s start by scanning some items!</Text>
      </Link>
    </View>
  </View>
);
