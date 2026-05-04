import type { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { getHeaderTitle } from '@react-navigation/elements';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import { StyleSheet, View } from 'react-native';

import { Appbar } from 'react-native-paper';
import { impactHaptic } from '@/lib/haptics';

type HeaderProps = (NativeStackHeaderProps | BottomTabHeaderProps) & {
  back?: NativeStackHeaderProps['back'];
};

export default function Header({ navigation, route, options }: HeaderProps) {
  const title = getHeaderTitle(options, route.name);
  const canGoBack = navigation.canGoBack();
  const rightAction = options.headerRight?.({
    canGoBack,
  } as never);

  return (
    <Appbar.Header elevated>
      {canGoBack ? (
        <Appbar.BackAction
          onPress={() => {
            impactHaptic();
            navigation.goBack();
          }}
        />
      ) : null}
      <Appbar.Content title={title} />
      {rightAction ? (
        <View style={styles.rightAction}>{rightAction}</View>
      ) : null}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  rightAction: {
    marginRight: 4,
  },
});
