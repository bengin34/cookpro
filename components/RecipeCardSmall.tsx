import { StyleSheet, View, Image, Pressable } from 'react-native';
import { useState } from 'react';
import { Link } from 'expo-router';
import { BlurView } from 'expo-blur';

import { Text } from '@/components/Themed';
import { Recipe } from '@/lib/types';
import { useColorScheme } from '@/components/useColorScheme';

const CARD_WIDTH = 160;

type RecipeCardSmallProps = {
  recipe: Recipe;
  score: number;
  missingCount: number;
};

export function RecipeCardSmall({ recipe, score, missingCount }: RecipeCardSmallProps) {
  const colorScheme = useColorScheme();
  const tint = colorScheme === 'dark' ? 'dark' : 'light';
  const [imageError, setImageError] = useState(false);

  const imageUrl = !imageError
    ? `https://images.unsplash.com/photo-${getPhotoIdByRecipe(recipe.id)}?w=300&h=300&fit=crop&q=80`
    : undefined;

  return (
    <Link href={`/recipes/${recipe.id}`} asChild>
      <Pressable style={styles.container}>
        <View style={styles.imageWrapper}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.image}
              onError={() => setImageError(true)}
            />
          ) : (
            <Image
              source={require('@/assets/images/placeholder.png')}
              style={styles.image}
            />
          )}
          <BlurView intensity={20} tint={tint} style={styles.overlay} />

          {/* Score Badge */}
          <View style={[styles.scoreBadge, getScoreStyle(score)]}>
            <Text style={styles.scoreText}>{Math.round(score)}%</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>

          <Text style={styles.time}>⏱ {recipe.totalTimeMinutes ?? '--'} dk</Text>

          {missingCount > 0 && (
            <Text style={styles.missing}>{missingCount} eksik</Text>
          )}
          {missingCount === 0 && (
            <Text style={styles.complete}>✓ Tamam</Text>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

function getPhotoIdByRecipe(recipeId: string): string {
  const photoIds = [
    '1546069901-e90e7e6d90a7',
    '1495112579519-330ec06b1cb5',
    '1546069901-e90e7e6d90a7',
    '1571407970349-1e4b842fd9d9',
    '1495112579519-6f10c9dde8b9',
    '1546069901-08fa151a7738',
    '1495112579519-6f10c9dde8b9',
  ];
  const index = parseInt(recipeId.slice(0, 8), 16) % photoIds.length;
  return photoIds[index];
}

function getScoreStyle(score: number) {
  if (score >= 75) return styles.scoreHigh;
  if (score >= 50) return styles.scoreMedium;
  return styles.scoreLow;
}

const styles = StyleSheet.create({
  container: {
    width: CARD_WIDTH,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginRight: 12,
  },
  imageWrapper: {
    width: '100%',
    height: 120,
    position: 'relative',
    backgroundColor: '#e0e0e0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
  },
  scoreBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    minWidth: 40,
    alignItems: 'center',
  },
  scoreHigh: {
    backgroundColor: 'rgba(34,197,94,0.9)',
  },
  scoreMedium: {
    backgroundColor: 'rgba(251,146,60,0.9)',
  },
  scoreLow: {
    backgroundColor: 'rgba(239,68,68,0.9)',
  },
  scoreText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  content: {
    padding: 10,
    gap: 6,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 16,
  },
  time: {
    fontSize: 11,
    opacity: 0.6,
  },
  missing: {
    fontSize: 11,
    color: '#ef4444',
    fontWeight: '600',
  },
  complete: {
    fontSize: 11,
    color: '#22c55e',
    fontWeight: '600',
  },
});
