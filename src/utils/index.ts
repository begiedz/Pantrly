export function capitalize(val?: string) {
  if (!val) return '';

  const trimmed = val.trim();
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
