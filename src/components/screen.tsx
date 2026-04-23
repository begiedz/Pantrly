import type { PropsWithChildren } from 'react';
import { type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from 'react-native-paper';

type ScreenProps = PropsWithChildren<{
  style?: StyleProp<ViewStyle>;
}>;

export default function Screen({ children, style }: ScreenProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
