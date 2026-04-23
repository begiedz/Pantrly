import { createStore } from '@tanstack/react-store';
import { deleteProductImagesDirectory } from '@/lib/images/productImages';
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

export async function hydrateProducts() {
  if (isHydrated) {
    return;
  }

  const products = await loadPantryItems();

  appStore.setState((state) => ({
    ...state,
    products,
  }));

  isHydrated = true;
}

export function addProduct(product: ProductEntity) {
  let nextProducts: ProductEntity[] = [];

  appStore.setState((state) => {
    nextProducts = [...state.products, product];

    return {
      ...state,
      products: nextProducts,
    };
  });

  void savePantryItems(nextProducts);
}

export async function clearProducts() {
  await clearPantryItems();
  await deleteProductImagesDirectory();

  appStore.setState((state) => ({
    ...state,
    products: [],
  }));
}

export function getProductById(id: string) {
  return appStore.state.products.find((p) => p.id === id);
}
