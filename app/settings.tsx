import { ScrollView, View } from 'react-native';
import ThemeToggle from '@/components/ThemeToggle';
import { Text } from '@/components/ui/text';

export default function SettingsScreen() {
  return (
    <ScrollView contentInsetAdjustmentBehavior='automatic' className='flex-1'>
      <View className='p-4 gap-6'>
        <View className='rounded-2xl border border-border bg-card p-2 flex-1 flex-row items-center justify-between'>
          <Text>Toggle theme</Text>
          <ThemeToggle />
        </View>
      </View>
    </ScrollView>
  );
}
