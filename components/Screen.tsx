import { ReactNode } from 'react';
import { ScrollView, StyleSheet, View, ViewStyle } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScreenBackground } from './ScreenBackground';
import Colors from '@/constants/Colors';

type ScreenProps = {
  children: ReactNode;
  style?: ViewStyle;
  contentStyle?: ViewStyle;
};

export function Screen({ children, style, contentStyle }: ScreenProps) {
  const backgroundColor = Colors.light.background;
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.root, { backgroundColor }, style]}>
      <ScreenBackground />
      <ScrollView
        contentContainerStyle={[
          styles.content,
          {
            paddingBottom: 20
          },
          contentStyle,
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  content: {
    padding: 24,
    gap: 16,
  },
});
