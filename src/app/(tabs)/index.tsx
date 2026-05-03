import { useStore } from '@tanstack/react-store';
import { Link, router } from 'expo-router';
import { useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { FAB, Text } from 'react-native-paper';
import Card from '@/components/card';
import Screen from '@/components/screen';
import { impactHaptic, selectionHaptic } from '@/lib/haptics';
import { appStore } from '@/lib/store/appStore';

export default function PantryScreen() {
  const { width } = useWindowDimensions();
  const products = useStore(appStore, (state) => state.products);
  const [state, setState] = useState({ open: false });
  const contentPadding = width < 380 ? 12 : width < 768 ? 16 : 24;

  const onStateChange = ({ open }: { open: boolean }) => {
    selectionHaptic();
    setState({ open });
  };
  const { open } = state;
  return (
    <Screen>
      <FlatList
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={[
          styles.listContent,
          { padding: contentPadding },
        ]}
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
            onPress: () => {
              impactHaptic();
              router.push('/create');
            },
          },
          {
            icon: 'barcode-scan',
            label: 'Scan',
            onPress: () => {
              impactHaptic();
              router.push('/scanner');
            },
          },
        ]}
        onStateChange={onStateChange}
      />
    </Screen>
  );
}

const Separator = () => <View style={styles.separator} />;

const Welcome = () => {
  const { width } = useWindowDimensions();
  const imageSize = Math.min(width * 0.26, 120);

  return (
    <View style={styles.emptyState}>
      <Image
        style={[styles.emptyImage, { width: imageSize, height: imageSize }]}
        resizeMode='contain'
        source={require('@/assets/images/icon.png')}
      />

      <View style={styles.emptyTextBlock}>
        <Text style={styles.emptyTitle}>Welcome to Pantrly!</Text>
        <Text style={styles.emptySubtitle}>Your current pantry is empty.</Text>

        <Link href='/scanner' style={styles.emptyLink}>
          <Text>Let&apos;s start by scanning some items!</Text>
        </Link>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  listContent: {
    flexGrow: 1,
  },
  separator: {
    height: 16,
  },
  emptyState: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  emptyImage: {
    marginBottom: 16,
  },
  emptyTextBlock: {
    alignItems: 'center',
    maxWidth: 360,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptySubtitle: {
    textAlign: 'center',
  },
  emptyLink: {
    marginTop: 16,
    textDecorationLine: 'underline',
  },
});
