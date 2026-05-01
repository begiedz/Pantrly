import type { BottomTabHeaderProps } from '@react-navigation/bottom-tabs';
import { getHeaderTitle } from '@react-navigation/elements';
import type { NativeStackHeaderProps } from '@react-navigation/native-stack';

import { Appbar } from 'react-native-paper';
import { impactHaptic } from '@/lib/haptics';

type HeaderProps = (NativeStackHeaderProps | BottomTabHeaderProps) & {
  back?: NativeStackHeaderProps['back'];
};

export default function Header({
  navigation,
  route,
  options,
  back,
}: HeaderProps) {
  const title = getHeaderTitle(options, route.name);

  return (
    <Appbar.Header elevated>
      {back ? (
        <Appbar.BackAction
          onPress={() => {
            impactHaptic();
            navigation.goBack();
          }}
        />
      ) : null}
      <Appbar.Content title={title} />
    </Appbar.Header>
  );
}
