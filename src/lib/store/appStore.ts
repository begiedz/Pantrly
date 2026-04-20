import { createStore } from '@tanstack/react-store';
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

  appStore.setState(state => ({
    ...state,
    products,
  }));

  isHydrated = true;
}

export function addProduct(product: ProductEntity) {
  let nextProducts: ProductEntity[] = [];

  appStore.setState(state => {
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

  appStore.setState(state => ({
    ...state,
    products: [],
  }));
}
