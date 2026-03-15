import { Text, View } from 'react-native';
import ThemeToggle from '@/components/ThemeToggle';

export default function Settings() {
  return (
    <View className='flex-1'>
      <View className='flex-row  items-center'>
        <Text>Toggle theme</Text>
        <ThemeToggle />
      </View>
    </View>
  );
}
