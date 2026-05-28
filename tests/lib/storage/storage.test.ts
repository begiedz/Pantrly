import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { loadPantryItems } from '@/lib/storage/storage';

// it's mocking real AsyncStorage so all the functions from '@/lib/storage/storage' uses this mocked one
jest.mock('@react-native-async-storage/async-storage', () => ({
  // __esModule and default because it is imported as default in prod
  __esModule: true,
  default: {
    // these are the mocked functions
    getItem: jest.fn(),
  },
}));

describe('loadPantryItems', () => {
  it('returns an empty list when pantry storage has no saved items', async () => {
    // .mockResolvedValueOnce(null) returns Promise.resolve(null)
    (AsyncStorage.getItem as jest.Mock).mockResolvedValueOnce(null);

    // call real loadPantryItems it should return empty arr
    // (if (!raw) {return [];})
    await expect(loadPantryItems()).resolves.toEqual([]);
    // checks if mock was called with correct storage key
    expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.pantryItems);
  });
});
