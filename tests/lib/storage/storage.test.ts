import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/lib/storage/keys';
import { loadPantryItems } from '@/lib/storage/storage';

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
