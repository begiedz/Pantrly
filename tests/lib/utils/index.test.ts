import { normalizeCategoryList } from '@/lib/utils';

describe('normalizeCategoryList', () => {
  it('returns undefined when there is no categories', () => {
    expect(normalizeCategoryList()).toBeUndefined();
  });

  it('returns undefined when no valid category labels remain after normalization', () => {
    expect(normalizeCategoryList(['', '   ', 'en:'])).toBeUndefined();
  });

  it('returns category list when there are categories passed', () => {
    const categories: string[] = ['en:chips', 'en:salty-snacks'];
    expect(normalizeCategoryList(categories)).toEqual([
      'Chips',
      'Salty snacks',
    ]);
  });
});
