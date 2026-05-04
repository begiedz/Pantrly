import { useStore } from '@tanstack/react-store';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import {
  ScrollView,
  StyleSheet,
  useWindowDimensions,
  View,
} from 'react-native';
import { Avatar, Button, Card, Divider, Text } from 'react-native-paper';

import Screen from '@/components/screen';
import { impactHaptic } from '@/lib/haptics';
import { getProductImageUri } from '@/lib/images/productImages';
import { appStore } from '@/lib/store/appStore';
import { normalizeCategories } from '@/lib/utils';

type DetailRowProps = {
  label: string;
  value: string;
  isLast?: boolean;
};

function DetailRow({ label, value, isLast = false }: DetailRowProps) {
  return (
    <View>
      <View style={styles.detailRow}>
        <Text variant='labelMedium' style={styles.detailLabel}>
          {label}
        </Text>
        <Text variant='bodyLarge' style={styles.detailValue}>
          {value}
        </Text>
      </View>
      {!isLast ? <Divider /> : null}
    </View>
  );
}

export default function ProductDetailsScreen() {
  const { width } = useWindowDimensions();
  const { id } = useLocalSearchParams<{ id: string }>();

  const product = useStore(appStore, (state) =>
    state.products.find((item) => item.id === id),
  );

  const title = product?.name || product?.brand || 'Product Details';
  const imageUri = getProductImageUri(product);
  const categories = product
    ? normalizeCategories(product.categories)
    : undefined;

  const isWideLayout = width >= 768;
  const contentPadding = width < 380 ? 16 : width < 768 ? 20 : 24;
  const coverHeight = Math.min(Math.max(width * 0.55, 200), 320);

  const detailRows = product
    ? ([
        product.bestBefore && {
          label: 'Best before',
          value: new Date(product.bestBefore).toLocaleDateString('en-GB'),
        },
        product.barcode && { label: 'Barcode', value: product.barcode },
        categories && {
          label: 'Categories',
          value: categories,
        },
      ].filter(Boolean) as { label: string; value: string }[])
    : [];

  function handleEdit() {
    if (!product) {
      return;
    }

    impactHaptic();
    router.push({
      pathname: '/create',
      params: { id: product.id },
    });
  }

  return (
    <>
      <Stack.Screen
        options={{
          title,
          headerRight: product
            ? () => (
                <Button compact mode='text' icon='pencil' onPress={handleEdit}>
                  Edit
                </Button>
              )
            : undefined,
        }}
      />

      <Screen style={[styles.screen, { paddingHorizontal: contentPadding }]}>
        {!product ? (
          <View style={styles.emptyState}>
            <Text variant='headlineSmall'>Product not found</Text>
            <Text variant='bodyMedium' style={styles.emptyStateText}>
              This item is no longer available in your pantry.
            </Text>
          </View>
        ) : (
          <ScrollView
            style={styles.scrollView}
            contentContainerStyle={styles.content}
          >
            <View style={isWideLayout && styles.contentWide}>
              <Card mode='contained' style={styles.card}>
                {imageUri ? (
                  <Card.Cover
                    source={{ uri: imageUri }}
                    style={[styles.cover, { height: coverHeight }]}
                  />
                ) : (
                  <View
                    style={[styles.coverPlaceholder, { height: coverHeight }]}
                  >
                    <Avatar.Icon icon='image-outline' size={56} />
                  </View>
                )}

                <Card.Title
                  title={title}
                  subtitle={product.brand ?? null}
                  titleVariant='headlineSmall'
                  subtitleVariant='bodyMedium'
                />

                <Card.Content style={styles.cardContent}>
                  {detailRows.map((row, index) => (
                    <DetailRow
                      key={row.label}
                      label={row.label}
                      value={row.value}
                      isLast={index === detailRows.length - 1}
                    />
                  ))}
                </Card.Content>
              </Card>
            </View>
          </ScrollView>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
  scrollView: {
    width: '100%',
  },
  content: {
    flexGrow: 1,
    paddingBottom: 24,
  },
  contentWide: {
    alignSelf: 'center',
    maxWidth: 720,
    width: '100%',
  },
  card: {
    overflow: 'hidden',
    width: '100%',
  },
  cover: {
    width: '100%',
  },
  coverPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardContent: {
    paddingTop: 8,
    gap: 0,
  },
  detailRow: {
    paddingVertical: 14,
    gap: 6,
  },
  detailLabel: {
    opacity: 0.7,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  detailValue: {
    lineHeight: 24,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  emptyStateText: {
    marginTop: 8,
    textAlign: 'center',
    opacity: 0.72,
  },
});
