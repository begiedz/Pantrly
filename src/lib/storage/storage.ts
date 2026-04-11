import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ProductEntity } from '@/types';
import { STORAGE_KEYS } from './keys';

export async function loadPantryItems(): Promise<ProductEntity[]> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.pantryItems);

    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as ProductEntity[]) : [];
  } catch (error) {
    console.error('Failed to read pantry items', error);
    return [];
  }
}

export async function savePantryItems(items: ProductEntity[]): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.pantryItems, JSON.stringify(items));
  } catch (error) {
    console.error('Failed to save pantry items', error);
  }
}

export async function clearPantryItems(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.pantryItems);
  } catch (error) {
    console.error('Failed to clear pantry items', error);
  }
}
