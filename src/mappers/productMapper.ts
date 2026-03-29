import type { ApiProductResponse, ProductEntity } from '@/types';

export default function mapApiProductToEntity(
  response: ApiProductResponse,
): ProductEntity | null {
  if (response.status !== 1 || !response.product) {
    return null;
  }

  return {
    id: crypto.randomUUID(),
    barcode: response.code,
    name: response.product.product_name,
    description: response.product.compared_to_category,
    brand: response.product.brands_tags[0],
    categories: response.product.categories_tags ?? [],
    imageUrl: response.product.image_front_url,
  };
}
