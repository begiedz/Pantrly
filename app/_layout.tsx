import '@/global.css';

import { ThemeProvider } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { PortalHost } from '@rn-primitives/portal';
import { StatusBar } from 'expo-status-bar';
import { ScanLine, Settings } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import { Pressable, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import pantry from '@/app/pantry';
import scanner from '@/app/scanner';
import settings from '@/app/settings';
import { Icon } from '@/components/ui/icon';
import { NAV_THEME } from '@/lib/theme';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export default function RootLayout() {
  const { colorScheme } = useColorScheme();
  const Stack = createNativeStackNavigator();

  return (
    <SafeAreaProvider>
      <ThemeProvider value={NAV_THEME[colorScheme ?? 'light']}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
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
                <View className='flex-row'>
                  <Pressable
                    onPress={() => navigation.navigate('Scanner')}
                    hitSlop={8}
                    className='mx-3'
                  >
                    <Icon as={ScanLine} size={20} />
                  </Pressable>

                  <Pressable
                    onPress={() => navigation.navigate('Settings')}
                    hitSlop={8}
                    className='mx-3'
                  >
                    <Icon as={Settings} size={20} />
                  </Pressable>
                </View>
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
        <PortalHost />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
