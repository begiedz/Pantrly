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

export function updateProduct(product: ProductEntity) {
  let nextProducts: ProductEntity[] = [];

  appStore.setState((state) => {
    nextProducts = state.products.map((item) =>
      item.id === product.id ? product : item,
    );

    return {
      ...state,
      products: nextProducts,
    };
  });

  void savePantryItems(nextProducts);
}

export async function removeProduct(productId: string) {
  const product = getProductById(productId);
  let nextProducts: ProductEntity[] = [];

  appStore.setState((state) => {
    nextProducts = state.products.filter((item) => item.id !== productId);

    return {
      ...state,
      products: nextProducts,
    };
  });

  await Promise.all([
    savePantryItems(nextProducts),
    deleteProductImage(product?.localImageUri),
  ]);
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
