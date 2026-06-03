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
let hydratingPromise: Promise<void> | null = null;

function setProducts(products: ProductEntity[]) {
  appStore.setState(() => ({ products }));
  return products;
}

export async function hydrateProducts() {
  if (isHydrated) {
    return;
  }

  if (!hydratingPromise) {
    // share one hydration promise so multiple screens can request startup data without racing each other or overwriting state with duplicate reads
    hydratingPromise = (async () => {
      setProducts(await loadPantryItems());
      isHydrated = true;
    })();
  }

  return hydratingPromise;
}

export function addProduct(product: ProductEntity) {
  const nextProducts = setProducts([...appStore.state.products, product]);
  // persist after the in-memory update so the ui stays responsive and storage failures do not block the add flow
  void savePantryItems(nextProducts);
}

export function updateProduct(product: ProductEntity) {
  const nextProducts = setProducts(
    appStore.state.products.map(item =>
      item.id === product.id ? product : item,
    ),
  );
  // updates follow the same pattern as add: state first for instant feedback, storage second because the app can handle a delayed write
  void savePantryItems(nextProducts);
}

export async function removeProduct(productId: string) {
  const product = getProductById(productId);
  const nextProducts = setProducts(
    appStore.state.products.filter(item => item.id !== productId),
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
  return appStore.state.products.find(p => p.id === id);
}
