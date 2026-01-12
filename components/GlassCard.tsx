import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

type GlassCardProps = {
  children: ReactNode;
  style?: ViewStyle;
};

export function GlassCard({ children, style }: GlassCardProps) {
  return (
    <View style={[styles.shell, style]}>
      <BlurView intensity={30} tint="light" style={styles.blur} />
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
