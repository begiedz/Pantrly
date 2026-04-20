import * as Crypto from 'expo-crypto';
import type { ApiProductResponse, ProductEntity } from '@/types';

export default function mapApiProductToEntity(
  response: ApiProductResponse,
): ProductEntity | null {
  if (response.status !== 1 || !response.product) {
    return null;
  }

  return {
    id: Crypto.randomUUID(),
    barcode: response.code,
    name: response.product.product_name,
    brand: response.product.brands,
    categories: response.product.categories_tags ?? [],
    imageUrl: response.product.image_front_url,
  };
}
