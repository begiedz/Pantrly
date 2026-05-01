export function capitalize(val?: string) {
  if (!val) return '';

  const trimmed = val.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

export function normalizeCategories(categories?: string[]) {
  if (!categories) return undefined;

  return categories
    .map(category => category.replaceAll('-', ' ').split(':')[1])
    .join(', ');
}

// gets last category without "en:" prefix
export function getCategory(categories?: string[]) {
  if (!categories) return undefined;

  return categories?.at(-1)?.split(':').at(-1)?.replaceAll('-', ' ');
}
