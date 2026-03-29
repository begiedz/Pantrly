import Constants from 'expo-constants';
import { Link } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Logo from '@/components/logo';
import Screen from '@/components/screen';

export default function SettingsScreen() {
  const isDev = __DEV__;
  const version = isDev ? 'dev' : (Constants.expoConfig?.version ?? 'unknown');

  return (
    <Screen>
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.logoWrapper}>
          <Logo width={16} height={16} fill='#6b7280' />

          <Link href='https://begiedz.dev'>
            <Text style={styles.link}>begiedz.dev</Text>
          </Link>
        </View>

        <Text>v {version}</Text>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    alignItems: 'center',
    padding: 16,
  },
  logoWrapper: {
    flex: 1,
    flexDirection: 'row',
    gap: 8,
  },
  link: {
    textDecorationLine: 'underline',
    color: '#6b7280',
  },
});
