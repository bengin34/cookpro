import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

import { useColorScheme } from '@/components/useColorScheme';

type GlassCardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function GlassCard({ children, style }: GlassCardProps) {
  const colorScheme = useColorScheme();
  const tint = colorScheme === 'dark' ? 'dark' : 'light';

  return (
    <View style={[styles.shell, style]}>
      <BlurView intensity={30} tint={tint} style={styles.blur} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  shell: {
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.6)',
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 16,
    gap: 10,
  },
});
