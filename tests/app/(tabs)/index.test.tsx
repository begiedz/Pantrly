import { render, screen } from '@testing-library/react-native';
import PantryScreen from '@/app/(tabs)/index';

const mockUseStore = jest.fn();

// passing actual react-store + mocked useStore
jest.mock('@tanstack/react-store', () => {
  const actual = jest.requireActual('@tanstack/react-store');

  return {
    ...actual,
    useStore: (...args: unknown[]) => mockUseStore(...args),
  };
});

// mock lacking <SafeAreaProvider> from FAB
// mock text form react native
// mock required useTheme form rn-paper
jest.mock('react-native-paper', () => {
  const { Text } = require('react-native');

  return {
    Text,
    FAB: {
      Group: () => null,
    },
    useTheme: () => ({
      colors: {
        background: '#fff',
      },
    }),
  };
});

describe('PantryScreen', () => {
  it('shows the empty state CTA when there is no products', () => {
    mockUseStore.mockReturnValue([]);

    render(<PantryScreen />);

    expect(screen.getByText('Welcome to Pantrly!')).toBeTruthy();
  });
});
