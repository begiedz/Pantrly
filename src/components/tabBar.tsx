import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { BottomNavigation } from 'react-native-paper';
import { softHaptic } from '@/lib/haptics';

export default function TabBar({
  navigation,
  state,
  descriptors,
  insets,
}: BottomTabBarProps) {
  return (
    <BottomNavigation.Bar
      navigationState={state}
      safeAreaInsets={insets}
      onTabPress={({ route, preventDefault }) => {
        const event = navigation.emit({
          type: 'tabPress',
          target: route.key,
          canPreventDefault: true,
        });
        const isFocused = state.routes[state.index]?.key === route.key;

        if (event.defaultPrevented) {
          preventDefault();
        } else {
          if (!isFocused) {
            softHaptic();
          }
          navigation.navigate(route.name, route.params);
        }
      }}
      renderIcon={({ route, focused, color }) => {
        const { options } = descriptors[route.key];

        if (typeof options.tabBarIcon === 'function') {
          return options.tabBarIcon({
            focused,
            color,
            size: 24,
          });
        }

        return null;
      }}
      getLabelText={({ route }) => {
        const { options } = descriptors[route.key];

        if (typeof options.tabBarLabel === 'string') {
          return options.tabBarLabel;
        }

        if (typeof options.title === 'string') {
          return options.title;
        }

        return route.name;
      }}
    />
  );
}
