import { useStore } from '@tanstack/react-store';
import { Stack, router, useLocalSearchParams } from 'expo-router';
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
  value?: string;
  isLast?: boolean;
};

function DetailRow({ label, value, isLast = false }: DetailRowProps) {
  if (!value) {
    return null;
  }

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
  const imageUri = getProductImageUri(product);
  const title = product?.name || product?.brand || 'Product Details';
  const subtitle = product?.brand ? product.brand : null;
  const bestBeforeDate = product?.bestBefore
    ? new Date(product.bestBefore).toLocaleDateString('en-GB')
    : undefined;

  const categories = normalizeCategories(product?.categories);
  const horizontalPadding = width < 380 ? 12 : width < 768 ? 16 : 24;
  const coverHeight = Math.min(Math.max(width * 0.55, 200), 320);

  const detailRows = product
    ? [
        { label: 'Best before', value: bestBeforeDate },
        { label: 'Barcode', value: product.barcode },
        { label: 'Categories', value: categories },
      ].filter((row): row is { label: string; value: string } =>
        Boolean(row.value),
      )
    : [];

  const handleEdit = () => {
    if (!product) {
      return;
    }

    impactHaptic();
    router.push({
      pathname: '/create',
      params: { id: product.id },
    });
  };

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
      <Screen style={[styles.screen, { padding: horizontalPadding }]}>
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
                subtitle={subtitle}
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
          </ScrollView>
        )}
      </Screen>
    </>
  );
}

const styles = StyleSheet.create({
  screen: {},
  scrollView: {
    width: '100%',
  },
  content: {
    flexGrow: 1,
    paddingBottom: 24,
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
