import Constants from 'expo-constants';
import { Link } from 'expo-router';
import { ScrollView, View } from 'react-native';
import Logo from '@/components/logo';
import ThemeToggle from '@/components/ThemeToggle';
import { Text } from '@/components/ui/text';

export default function SettingsScreen() {
  const isDev = __DEV__;

  const version = isDev ? 'dev' : (Constants.expoConfig?.version ?? 'unknown');
  return (
    <ScrollView contentInsetAdjustmentBehavior='automatic' className='flex-1'>
      <View className='p-4 gap-6'>
        <View className='rounded-2xl border border-border bg-card p-2 flex-1 flex-row items-center justify-between'>
          <Text>Toggle theme</Text>
          <ThemeToggle />
        </View>

        <View className='p-2 flex-1 items-center justify-center '>
          <View className='flex-1 flex-row gap-2 items-center'>
            <Logo width={16} height={16} fill='#6b7280' />

            <Link
              href='https://begiedz.dev'
              className='text-[#6b7280] underline text-base'
            >
              begiedz.dev
            </Link>
          </View>

          <Text className='text-muted-foreground opacity-50'>v {version}</Text>
        </View>
      </View>
    </ScrollView>
  );
}
