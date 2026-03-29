import { createStore } from '@tanstack/react-store';
import type { PantryStoreState } from '@/types';

export const appStore = createStore<PantryStoreState>({
  products: [],
});
