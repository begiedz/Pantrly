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

jest.mock('@/components/card', () => ({
  __esModule: true,
  default: ({ product }: { product: { id: string; name: string } }) => {
    const { Text } = require('react-native');
    return <Text>{product.name}</Text>;
  },
}));

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
    expect(screen.getByText('Your current pantry is empty.')).toBeTruthy();
    expect(
      screen.getByText("Let's start by scanning some items!"),
    ).toBeTruthy();
  });

  it('render pantry items when products exist instead of CTA', () => {
    mockUseStore.mockReturnValue([
      { id: '1', name: 'Milk' },
      { id: '2', name: 'Bread' },
    ]);

    render(<PantryScreen />);

    expect(screen.getByText('Milk')).toBeTruthy();
    expect(screen.getByText('Bread')).toBeTruthy();

    expect(screen.queryByText('Welcome to Pantrly!')).toBeNull();
    expect(screen.queryByText('Your current pantry is empty.')).toBeNull();
    expect(
      screen.queryByText("Let's start by scanning some items!"),
    ).toBeNull();
  });
});
