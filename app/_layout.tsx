import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { Pressable, Text } from 'react-native';
import {
  MD3LightTheme as DefaultTheme,
  PaperProvider,
} from 'react-native-paper';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import pantry from '@/app/pantry';
import scanner from '@/app/scanner';
import settings from '@/app/settings';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const Stack = createNativeStackNavigator();

  return (
    <PaperProvider theme={DefaultTheme}>
      <SafeAreaProvider>
        <Stack.Navigator>
          <Stack.Screen
            name='Pantry'
            component={pantry}
            options={({ navigation }) => ({
              title: 'Pantry',
              headerLargeTitleEnabled: true,
              headerSearchBarOptions: {
                placeholder: 'Search products',
              },
              headerRight: () => (
                <>
                  <Pressable
                    onPress={() => navigation.navigate('Scanner')}
                    hitSlop={8}
                  >
                    <Text>Scan</Text>
                  </Pressable>

                  <Pressable
                    onPress={() => navigation.navigate('Settings')}
                    hitSlop={8}
                  >
                    <Text>Settings</Text>
                  </Pressable>
                </>
              ),
            })}
          />
          <Stack.Screen
            name='Settings'
            component={settings}
            options={{ headerShown: true }}
          />
          <Stack.Screen
            name='Scanner'
            component={scanner}
            options={{ presentation: 'modal', title: 'Scanner' }}
          />
        </Stack.Navigator>
      </SafeAreaProvider>
    </PaperProvider>
  );
}
