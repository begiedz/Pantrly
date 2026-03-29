import { createStore } from '@tanstack/react-store';
import type { PantryStore, ProductEntity } from '@/types';

export const pantryStore = createStore<PantryStore>({
  products: [],
});

export function addProduct(product: ProductEntity) {
  pantryStore.setState(state => ({
    ...state,
    products: [...state.products, product],
  }));
}
