import Constants from 'expo-constants';
import { Link } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Logo from '@/components/logo';
import Screen from '@/components/screen';

export default function SettingsScreen() {
  const isDev = __DEV__;

  const version = isDev ? 'dev' : (Constants.expoConfig?.version ?? 'unknown');
  return (
    <Screen>
      <ScrollView contentInsetAdjustmentBehavior='automatic'>
        <View>
          <View>
            <Button mode='contained'>Switch theme</Button>
          </View>

          <View>
            <View>
              <Logo width={16} height={16} fill='#6b7280' />

              <Link href='https://begiedz.dev'>
                {' '}
                <Text style={{ textDecorationLine: 'underline' }}>
                  begiedz.dev
                </Text>
              </Link>
            </View>

            <Text>v {version}</Text>
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}
