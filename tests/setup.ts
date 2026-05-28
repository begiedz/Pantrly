// it's mocking real AsyncStorage so all the functions from '@/lib/storage/storage' uses this mocked one
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);
