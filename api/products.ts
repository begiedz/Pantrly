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

  const response = await fetch(endpoint.toString(), {
    headers: { Authorization: `Basic ${btoa('off:off')}` },
  });
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}`);
  }

  return response.json();
}
