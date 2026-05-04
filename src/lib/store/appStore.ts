import { createStore } from '@tanstack/react-store';
import {
  deleteProductImage,
  deleteProductImagesDirectory,
} from '@/lib/images/productImages';
import {
  clearPantryItems,
  loadPantryItems,
  savePantryItems,
} from '@/lib/storage/storage';
import type { AppStore, ProductEntity } from '@/types';

export const appStore = createStore<AppStore>({
  products: [],
});

let isHydrated = false;

function setProducts(products: ProductEntity[]) {
  appStore.setState(() => ({ products }));
  return products;
}

export async function hydrateProducts() {
  if (isHydrated) {
    return;
  }

  setProducts(await loadPantryItems());
  isHydrated = true;
}

export function addProduct(product: ProductEntity) {
  const nextProducts = setProducts([...appStore.state.products, product]);
  void savePantryItems(nextProducts);
}

export function updateProduct(product: ProductEntity) {
  const nextProducts = setProducts(
    appStore.state.products.map((item) =>
      item.id === product.id ? product : item,
    ),
  );
  void savePantryItems(nextProducts);
}

export async function removeProduct(productId: string) {
  const product = getProductById(productId);
  const nextProducts = setProducts(
    appStore.state.products.filter((item) => item.id !== productId),
  );

  await Promise.all([
    savePantryItems(nextProducts),
    deleteProductImage(product?.localImageUri),
  ]);
}

export async function clearProducts() {
  await clearPantryItems();
  await deleteProductImagesDirectory();
  setProducts([]);
}

export function getProductById(id: string) {
  return appStore.state.products.find((p) => p.id === id);
}
