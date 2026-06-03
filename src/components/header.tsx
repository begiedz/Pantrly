import type { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { getHeaderTitle } from '@react-navigation/elements';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import { Appbar } from 'react-native-paper';

import { impactHaptic } from '@/lib/haptics';

type HeaderProps = NativeStackHeaderProps | BottomTabHeaderProps;

type HeaderRight = (props: { canGoBack: boolean }) => ReactNode;

export default function Header({ navigation, route, options }: HeaderProps) {
  const title = getHeaderTitle(options, route.name);
  const canGoBack = navigation.canGoBack();

  const headerRight = options.headerRight as HeaderRight | undefined;
  const rightAction = headerRight?.({ canGoBack });

  return (
    <Appbar.Header elevated>
      {canGoBack && (
        <Appbar.BackAction
          onPress={() => {
            impactHaptic();
            navigation.goBack();
          }}
        />
      )}

      <Appbar.Content title={title} />

      {rightAction != null && (
        <View style={styles.rightAction}>{rightAction}</View>
      )}
    </Appbar.Header>
  );
}

const styles = StyleSheet.create({
  rightAction: {
    marginRight: 4,
  },
});
