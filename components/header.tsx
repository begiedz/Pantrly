import type { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { getHeaderTitle } from '@react-navigation/elements';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';
import type { MD3Theme } from 'react-native-paper';
import { Appbar, Text } from 'react-native-paper';

type HeaderProps = (NativeStackHeaderProps | BottomTabHeaderProps) & {
  paperTheme: MD3Theme;
  back?: NativeStackHeaderProps['back'];
};

export default function Header({
  navigation,
  route,
  options,
  back,
  paperTheme,
}: HeaderProps) {
  const title = getHeaderTitle(options, route.name);

  const headerRight = options.headerRight?.({
    tintColor: paperTheme.colors.onSurface,
    canGoBack: !!back,
  });

  return (
    <Appbar.Header elevated>
      <View style={styles.side}>
        {back ? (
          <Appbar.BackAction onPress={() => navigation.goBack()} />
        ) : null}
      </View>

      <View style={styles.center}>
        <Text
          variant='titleLarge'
          style={[styles.title, { color: paperTheme.colors.onSurface }]}
        >
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
