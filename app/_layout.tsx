import { Stack } from 'expo-router';
import { useColorScheme } from 'react-native';
import { MD3DarkTheme, MD3LightTheme, PaperProvider } from 'react-native-paper';
import Header from '@/components/header';

export { ErrorBoundary } from 'expo-router';
export default function RootLayout() {
  const scheme = useColorScheme();
  const theme =
    scheme === 'dark'
      ? { ...MD3DarkTheme, mode: 'adaptive' as const }
      : MD3LightTheme;
  return (
    <PaperProvider theme={theme}>
      <Stack>
        <Stack.Screen name='(tabs)' options={{ headerShown: false }} />
        <Stack.Screen
          name='scanner'
          options={{
            title: 'Scanner',
            presentation: 'modal',
            header: (props) => <Header {...props} paperTheme={theme} />,
          }}
        />
        <Stack.Screen
          name='+not-found'
          options={{
            title: 'Oops!',
            header: (props) => <Header {...props} paperTheme={theme} />,
          }}
        />
      </Stack>
    </PaperProvider>
  );
}
