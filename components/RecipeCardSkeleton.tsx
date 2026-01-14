import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated } from 'react-native';

export function RecipeCardSkeleton() {
  const shimmerAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmerAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(shimmerAnim, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [shimmerAnim]);

  const opacity = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <View style={styles.card}>
      <Animated.View style={[styles.image, { opacity }]} />
      <View style={styles.content}>
        <Animated.View style={[styles.title, { opacity }]} />
        <Animated.View style={[styles.subtitle, { opacity }]} />
        <View style={styles.footer}>
          <Animated.View style={[styles.badge, { opacity }]} />
          <Animated.View style={[styles.badge, { opacity }]} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  image: {
    width: '100%',
    height: 180,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
  },
  content: {
    padding: 16,
  },
  title: {
    height: 20,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    borderRadius: 4,
    marginBottom: 8,
    width: '70%',
  },
  subtitle: {
    height: 14,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    borderRadius: 4,
    marginBottom: 12,
    width: '50%',
  },
  footer: {
    flexDirection: 'row',
    gap: 8,
  },
  badge: {
    height: 24,
    width: 60,
    backgroundColor: 'rgba(200, 200, 200, 0.3)',
    borderRadius: 12,
  },
});
