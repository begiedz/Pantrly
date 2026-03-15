import { router, Stack } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { Pressable } from 'react-native';
import { Icon } from '@/components/ui/icon';

export default function PantryLayout() {
  return (
    <Stack>
      <Stack.Screen
        name='index'
        options={{
          title: 'Pantrly',
          headerLargeTitleEnabled: true,
          headerSearchBarOptions: {
            placeholder: 'Search products',
          },
          headerRight: () => (
            <Pressable onPress={() => router.push('/settings')}>
              <Icon as={Settings} size={20} />
            </Pressable>
          ),
        }}
      />
    </Stack>
  );
}
