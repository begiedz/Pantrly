import { createStore } from '@tanstack/react-store';
import type { PantryStore } from '@/types';

export const pantryStore = createStore<PantryStore>({
  products: [],
});
