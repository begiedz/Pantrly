import { clearPantryItems } from '@/lib/storage/storage';
import type { ProductEntity } from '@/types';

jest.mock('@/lib/storage/storage', () => ({
  savePantryItems: jest.fn(),
  loadPantryItems: jest.fn(),
  clearPantryItems: jest.fn(),
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
      expect(storage.savePantryItems).toHaveBeenCalledTimes(1);
      expect(storage.savePantryItems).toHaveBeenCalledWith([newProduct]);
    });
  });

  it('loads pantry items and stores them in store', async () => {
    const storedProducts: ProductEntity[] = [
      {
        id: '1',
        name: 'Milk',
      },
    ];
    const storage = require('@/lib/storage/storage');
    const storeModule = require('@/lib/store/appStore');

    storage.loadPantryItems.mockResolvedValue(storedProducts);
    await storeModule.hydrateProducts();

    expect(storage.loadPantryItems).toHaveBeenCalledTimes(1);
    expect(storeModule.appStore.state.products).toEqual(storedProducts);
  });

  it('clears pantry items in store', async () => {
    const storedProducts: ProductEntity[] = [
      {
        id: '1',
        name: 'Milk',
      },
      {
        id: '2',
        name: 'Bread',
      },
    ];

    const storage = require('@/lib/storage/storage');
    const storeModule = require('@/lib/store/appStore');

    storeModule.appStore.setState(() => ({
      products: [storedProducts],
    }));

    await storeModule.clearProducts();

    expect(storeModule.appStore.state.products).toEqual([]);
    expect(storage.clearPantryItems).toHaveBeenCalledTimes(1);
  });
});
