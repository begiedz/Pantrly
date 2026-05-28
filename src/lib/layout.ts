import { useWindowDimensions } from 'react-native';

export const LAYOUT_BREAKPOINTS = {
  mobile: 380,
  tablet: 768,
} as const;

export function useResponsiveLayout() {
  const { width } = useWindowDimensions();
  const isWideLayout = width >= LAYOUT_BREAKPOINTS.tablet;
  const contentPadding =
    width < LAYOUT_BREAKPOINTS.mobile
      ? 16
      : width < LAYOUT_BREAKPOINTS.tablet
        ? 20
        : 24;

  return {
    width,
    isWideLayout,
    contentPadding,
  };
}
