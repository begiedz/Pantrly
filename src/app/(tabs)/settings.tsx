import Constants from 'expo-constants';
import { Link } from 'expo-router';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { Button, Text } from 'react-native-paper';
import Logo from '@/components/logo';
import Screen from '@/components/screen';
import { clearProducts } from '@/lib/store/appStore';

export default function SettingsScreen() {
  const isDev = __DEV__;
  const version = isDev
    ? 'development'
    : (Constants.expoConfig?.version ?? 'unknown');

  const handleClearPantry = () => {
    Alert.alert('Clear pantry?', 'This will remove all scanned items.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Clear',
        style: 'destructive',
        onPress: () => {
          void clearProducts();
        },
      },
    ]);
  };

  return (
    <Screen>
      <ScrollView
        contentInsetAdjustmentBehavior='automatic'
        contentContainerStyle={styles.scrollContent}
      >
        <Button
          mode='contained-tonal'
          icon='delete-outline'
          onPress={handleClearPantry}
          style={styles.clearButton}
        >
          Clear pantry
        </Button>
        <View style={styles.logoWrapper}>
          <Logo width={16} height={16} fill='#6b7280' />

          <Link href='https://begiedz.dev'>
            <Text style={styles.link}>begiedz.dev</Text>
          </Link>
        </View>

        <Text>version: {version}</Text>
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
  clearButton: {
    marginBottom: 24,
  },
});
