import * as FileSystem from 'expo-file-system/legacy';
import type { ProductEntity } from '@/types';

function getProductImagesDirectory() {
  if (!FileSystem.documentDirectory) {
    throw new Error('App document storage is not available.');
  }

  return `${FileSystem.documentDirectory}product-images/`;
}

function getImageExtension(uri: string) {
  const cleanUri = uri.split(/[?#]/)[0];
  const extension = cleanUri.split('.').pop()?.toLowerCase();

  if (!extension || extension.length > 5 || extension.includes('/')) {
    return 'jpg';
  }

  return extension;
}

export function getProductImageUri(product?: ProductEntity | null) {
  return product?.localImageUri ?? product?.imageUrl;
}

export async function copyProductImageToStorage(
  sourceUri: string,
  productId: string,
) {
  const productImagesDirectory = getProductImagesDirectory();

  await FileSystem.makeDirectoryAsync(productImagesDirectory, {
    intermediates: true,
  });

  const extension = getImageExtension(sourceUri);
  const destinationUri = `${productImagesDirectory}${productId}.${extension}`;

  await FileSystem.copyAsync({
    from: sourceUri,
    to: destinationUri,
  });

  return destinationUri;
}

export async function downloadProductImageToStorage(
  sourceUrl: string,
  productId: string,
) {
  const productImagesDirectory = getProductImagesDirectory();

  await FileSystem.makeDirectoryAsync(productImagesDirectory, {
    intermediates: true,
  });

  const extension = getImageExtension(sourceUrl);
  const destinationUri = `${productImagesDirectory}${productId}.${extension}`;

  await FileSystem.downloadAsync(sourceUrl, destinationUri);

  return destinationUri;
}

export async function deleteProductImagesDirectory() {
  if (!FileSystem.documentDirectory) {
    return;
  }

  await FileSystem.deleteAsync(getProductImagesDirectory(), {
    idempotent: true,
  });
}
