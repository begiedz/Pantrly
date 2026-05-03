import 'react-native-gesture-handler';
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { PaperProvider, Portal } from 'react-native-paper';
import Header from '@/components/header';
import { pantrlyDarkTheme, pantrlyLightTheme } from '@/config/themes';
import { hydrateProducts } from '@/lib/store/appStore';

export { ErrorBoundary } from 'expo-router';
export default function RootLayout() {
  const scheme = useColorScheme();
  const theme =
    scheme === 'dark'
      ? { ...pantrlyDarkTheme, mode: 'adaptive' as const }
      : pantrlyLightTheme;

  useEffect(() => {
    void hydrateProducts();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <PaperProvider theme={theme}>
        <Portal.Host>
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
                presentation: 'containedModal',
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
        </Portal.Host>
      </PaperProvider>
    </GestureHandlerRootView>
  );
}
