export function capitalize(val?: string) {
  if (!val) return '';

  const trimmed = val.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}

function formatCategoryLabel(category: string) {
  const formatted = capitalize(
    category.split(':').at(-1)?.replaceAll('-', ' ').trim() ?? '',
  );
  return formatted;
}

export function normalizeCategories(categories?: string[]) {
  if (!categories) return undefined;

  const normalized = categories
    .map(formatCategoryLabel)
    .filter(Boolean)
    .join(', ');

  return normalized || undefined;
}

// gets last category without "en:" prefix
export function getCategory(categories?: string[]) {
  if (!categories) return undefined;

  const category = categories.at(-1);
  return category ? formatCategoryLabel(category) : undefined;
}
