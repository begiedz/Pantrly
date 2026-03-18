import { router, Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';
import { IconButton, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';

import Header from '@/components/header';

export default function TabsLayout() {
  const scheme = useColorScheme();

  const theme =
    scheme === 'dark'
      ? {
          ...MD3DarkTheme,
          mode: 'adaptive' as const,
        }
      : MD3LightTheme;

  return (
    <Tabs
      screenOptions={{
        header: (props) => <Header {...props} paperTheme={theme} />,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Pantry',
          tabBarLabel: 'Pantry',
          headerRight: () => (
            <IconButton
              icon='barcode-scan'
              iconColor={theme.colors.onSurface}
              onPress={() => router.push('/scanner')}
            />
          ),
        }}
      />

      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
        }}
      />
    </Tabs>
  );
}
