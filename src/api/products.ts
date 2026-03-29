import { apiGet } from '@/api/http';
import type { ApiProductResponse } from '@/types';

export async function getProductByBarcode(
  url: string,
  barcode: string,
  fields?: string,
): Promise<ApiProductResponse> {
  const endpoint = new URL(`${url}/${barcode}`);

  if (fields) {
    endpoint.searchParams.set('fields', fields);
  }

  return apiGet<ApiProductResponse>(endpoint.toString());
}
