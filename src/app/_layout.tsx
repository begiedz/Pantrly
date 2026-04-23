import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import Header from '@/components/header';
import { hydrateProducts } from '@/lib/store/appStore';

export { ErrorBoundary } from 'expo-router';
export default function RootLayout() {
  const scheme = useColorScheme();
  const theme =
    scheme === 'dark'
      ? { ...MD3DarkTheme, mode: 'adaptive' as const }
      : MD3LightTheme;

  useEffect(() => {
    void hydrateProducts();
  }, []);

  return (
    <PaperProvider theme={theme}>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen
          name='product/[id]'
          options={{
            title: 'Details',
            header: (props) => <Header {...props} />,
          }}
        />
        <Stack.Screen
          name='scanner'
          options={{
            title: 'Scanner',
            presentation: 'modal',
            header: (props) => <Header {...props} />,
          }}
        />
        <Stack.Screen
          name='create'
          options={{
            title: 'New product',
            presentation: 'card',
            header: (props) => <Header {...props} />,
          }}
        />
        <Stack.Screen
          name='+not-found'
          options={{
            title: 'Oops!',
            header: (props) => <Header {...props} />,
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
