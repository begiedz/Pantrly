import { getHeaderTitle } from '@react-navigation/elements';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import { Appbar, Text, useTheme } from 'react-native-paper';

export default function Navbar({
  navigation,
  route,
  options,
  back,
}: NativeStackHeaderProps) {
  const title = getHeaderTitle(options, route.name);
  const theme = useTheme();

  const headerRight = options.headerRight
    ? options.headerRight({ tintColor: undefined })
    : null;

  return (
    <Appbar.Header
      style={{
        backgroundColor: theme.colors.elevation.level3,
      }}
    >
      <View style={styles.side}>
        {back ? <Appbar.BackAction onPress={navigation.goBack} /> : null}
      </View>

      <View style={styles.center}>
        <Text variant='titleLarge' style={styles.title}>
          {title}
        </Text>
      </View>

      <View style={styles.side}>{headerRight}</View>
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  side: {
    width: 96,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontWeight: '500',
    textAlign: 'center',
  },
});
