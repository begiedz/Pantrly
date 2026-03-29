import { createStore } from '@tanstack/react-store';
import type { AppStore, ProductEntity } from '@/types';

export const appStore = createStore<AppStore>({
  products: [],
});

export function addProduct(product: ProductEntity) {
  appStore.setState(state => ({
    ...state,
    products: [...state.products, product],
  }));
}
