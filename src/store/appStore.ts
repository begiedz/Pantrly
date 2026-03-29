import { createStore } from '@tanstack/react-store';
import type { AppStore, ProductEntity } from '@/types';

export const appStore = createStore<AppStore>({
  products: [
    {
      id: '1',
      barcode: 'bardoce',
      name: 'Name',
      brand: 'Brand',
      categories: ['dairy', 'beverage'],
      imageUrl:
        'https://fastly.picsum.photos/id/468/200/200.jpg?hmac=ebOvOZemklGsjJmYIRJ4_YWUDCNNpt5bE0B7EjYJfEA',
    },
  ],
});

export function addProduct(product: ProductEntity) {
  appStore.setState(state => ({
    ...state,
    products: [...state.products, product],
  }));
}
