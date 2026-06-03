import mapApiProductToEntity from '@/lib/mappers/productMapper';
import type { ApiProductResponse } from '@/types';

describe('mapApiProductToEntity', () => {
  it('returns null when API response status in not successful', () => {
    const response: ApiProductResponse = {
      status: 0,
    };
    expect(mapApiProductToEntity(response)).toBeNull();
  });

  it('returns null when API response status has no product', () => {
    const response: ApiProductResponse = {
      status: 1,
    };
    expect(mapApiProductToEntity(response)).toBeNull();
  });
});
