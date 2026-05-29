import type { ProductEntity } from '@/types';

jest.mock('@/lib/storage/storage', () => ({
  savePantryItems: jest.fn(),
  loadPantryItems: jest.fn(),
}));

// mocking the storage - it's dependancy for appStore, appStore is not mocked due to it is actual tested module
// jest.mock('@/lib/store/appStore', () => ({
//   addProduct: jest.fn(),
// }));

describe('appStore', () => {
  describe('addProduct', () => {
    it('adds a product to the store and persists the updated product list', () => {
      const newProduct: ProductEntity = {
        id: '1',
        name: 'Bread',
      };

      const storage = require('@/lib/storage/storage');
      const storeModule = require('@/lib/store/appStore');

      storeModule.appStore.setState(() => ({
        products: [],
      }));

      storeModule.addProduct(newProduct);

      expect(storeModule.appStore.state.products).toEqual([newProduct]);
      expect(storage.savePantryItems).toHaveBeenCalledWith([newProduct]);
    });
  });
  // it('load pantry items', () => {});
  // it('clears pantry items', () => {});
});
