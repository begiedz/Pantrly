import { Tabs } from 'expo-router';
import { Icon } from 'react-native-paper';

import Header from '@/components/header';
import TabBar from '@/components/tabBar';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        header: (props) => <Header {...props} />,
      }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Pantry',
          tabBarLabel: 'Pantry',
          tabBarIcon: ({ color, size }) => (
            <Icon source='fridge-outline' color={color} size={size} />
          ),
        }}
      />

      <Tabs.Screen
        name='settings'
        options={{
          title: 'Settings',
          tabBarLabel: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Icon source='cog-outline' color={color} size={size} />
          ),
        }}
      />
    </Tabs>
  );
}
