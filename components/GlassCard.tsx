import { ReactNode } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';

type GlassCardProps = {
  children: ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'elevated' | 'subtle';
};

export function GlassCard({ children, style, variant = 'default' }: GlassCardProps) {
  const variantStyles = {
    default: styles.shell,
    elevated: styles.shellElevated,
    subtle: styles.shellSubtle,
  };

  return (
    <View style={[variantStyles[variant], style]}>
      <BlurView intensity={variant === 'elevated' ? 40 : 30} tint="light" style={styles.blur} />
      <View style={styles.content}>{children}</View>
    </View>
  );
}

// Section container for grouping related cards
type SectionContainerProps = {
  children: ReactNode;
  title?: string;
  style?: ViewStyle | ViewStyle[];
};

export function SectionContainer({ children, title, style }: SectionContainerProps) {
  const { Text } = require('@/components/Themed');
  return (
    <View style={[styles.sectionContainer, style]}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.sectionContent}>{children}</View>
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
    marginBottom: 12,
  },
  shellElevated: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.7)',
    backgroundColor: 'rgba(255,255,255,0.35)',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  shellSubtle: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.15)',
    marginBottom: 8,
  },
  blur: {
    ...StyleSheet.absoluteFillObject,
  },
  content: {
    padding: 16,
    gap: 10,
  },
  // Section container styles
  sectionContainer: {
    marginBottom: 24,
    borderRadius: 24,
    backgroundColor: 'rgba(0,0,0,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.05)',
    padding: 16,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 1.2,
    opacity: 0.5,
    marginBottom: 12,
  },
  sectionContent: {
    gap: 0,
  },
});
