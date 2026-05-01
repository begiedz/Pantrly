import { Stack, useLocalSearchParams } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Avatar, Card, Divider, Text } from 'react-native-paper';

import Screen from '@/components/screen';
import { getProductImageUri } from '@/lib/images/productImages';
import { getProductById } from '@/lib/store/appStore';
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
  const { id } = useLocalSearchParams<{ id: string }>();

  const product = getProductById(id);
  const imageUri = getProductImageUri(product);
  const title = product?.name || product?.brand || 'Product Details';
  const subtitle = product?.brand ? product.brand : null;
  const bestBeforeDate = product?.bestBefore
    ? new Date(product.bestBefore).toLocaleDateString('en-GB')
    : undefined;

  const categories = normalizeCategories(product?.categories);

  const detailRows = product
    ? [
        { label: 'Best before', value: bestBeforeDate },
        { label: 'Barcode', value: product.barcode },
        { label: 'Categories', value: categories },
      ].filter((row): row is { label: string; value: string } =>
        Boolean(row.value),
      )
    : [];

  return (
    <>
      <Stack.Screen
        options={{
          title,
        }}
      />
      <Screen style={styles.screen}>
        {!product ? (
          <View style={styles.emptyState}>
            <Text variant='headlineSmall'>Product not found</Text>
            <Text variant='bodyMedium' style={styles.emptyStateText}>
              This item is no longer available in your pantry.
            </Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            <Card mode='contained' style={styles.card}>
              {imageUri ? (
                <Card.Cover source={{ uri: imageUri }} style={styles.cover} />
              ) : (
                <View style={styles.coverPlaceholder}>
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
  screen: {
    padding: 16,
  },
  content: {
    paddingBottom: 24,
  },
  card: {
    overflow: 'hidden',
  },
  cover: {
    height: 240,
  },
  coverPlaceholder: {
    height: 240,
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
