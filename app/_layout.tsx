import { useColorScheme } from 'react-native';
import 'react-native-gesture-handler';

import { createNativeStackNavigator } from '@react-navigation/native-stack';

import {
  IconButton,
  MD3DarkTheme,
  MD3LightTheme,
  PaperProvider,
} from 'react-native-paper';

import PantryScreen from '@/app/index';
import ScannerScreen from '@/app/scanner';
import SettingsScreen from '@/app/settings';

import Navbar from '@/components/navbar';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

const Stack = createNativeStackNavigator();

export default function RootLayout() {
  const scheme = useColorScheme();
  const theme =
    scheme === 'dark'
      ? {
          ...MD3DarkTheme,
          mode: 'adaptive' as const,
        }
      : MD3LightTheme;

  return (
    <PaperProvider theme={theme}>
      <Stack.Navigator
        initialRouteName='Pantry'
        screenOptions={{
          header: (props) => <Navbar {...props} />,
        }}
      >
        <Stack.Screen
          component={PantryScreen}
          name='Pantry'
          options={({ navigation }) => ({
            title: 'Pantry',
            headerRight: () => (
              <>
                <IconButton
                  icon='barcode-scan'
                  onPress={() => navigation.navigate('Scanner')}
                />
                <IconButton
                  icon='cog-outline'
                  onPress={() => navigation.navigate('Settings')}
                />
              </>
            ),
          })}
        />
        <Stack.Screen name='Settings' component={SettingsScreen} />
        <Stack.Screen
          name='Scanner'
          component={ScannerScreen}
          options={{ presentation: 'modal', title: 'Scanner' }}
        />
      </Stack.Navigator>
    </PaperProvider>
  );
}
