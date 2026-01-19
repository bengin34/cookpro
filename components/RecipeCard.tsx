import { useState } from 'react';
import { StyleSheet, View, Image, Dimensions, Pressable } from 'react-native';
import { Link } from 'expo-router';

import { Text } from '@/components/Themed';
import { Recipe } from '@/lib/types';
import { useCachedImage } from '@/hooks/useCachedImage';

const CARD_WIDTH = Dimensions.get('window').width - 48; // Minus padding

type RecipeCardProps = {
  recipe: Recipe;
  score: number;
  missingCount: number;
};

export function RecipeCard({ recipe, score, missingCount }: RecipeCardProps) {
  const [imageError, setImageError] = useState(false);

  // Use cached image hook - returns network URL immediately, caches in background
  const { uri: cachedImageUri } = useCachedImage(recipe.imageUrl);

  // Use cached URI if available - shows network URL instantly while caching
  const imageUrl = !imageError && cachedImageUri ? cachedImageUri : undefined;

  return (
    <Link href={`/recipes/${recipe.id}`} asChild>
      <Pressable style={styles.cardContainer}>
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

          {/* Difficulty Badge */}
          <View style={styles.difficultyBadge}>
            <Text style={styles.difficultyText}>
              {recipe.difficulty?.toUpperCase() || 'EASY'}
            </Text>
          </View>

          {/* Score Pill */}
          <View style={[styles.scorePill, score >= 75 ? styles.scoreHigh : score >= 50 ? styles.scoreMedium : styles.scoreLow]}>
            <Text style={styles.scoreText}>{Math.round(score)}%</Text>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title} numberOfLines={2}>
            {recipe.title}
          </Text>

          <View style={styles.meta}>
            <Text style={styles.metaText}>
              ⏱ {recipe.totalTimeMinutes ?? '--'} dk
            </Text>
            <Text style={styles.metaText}>
              🍽 {recipe.servings ?? '--'} porsiyon
            </Text>
          </View>

          {missingCount > 0 && (
            <View style={styles.missingTag}>
              <Text style={styles.missingText}>
                {missingCount} eksik malzeme
              </Text>
            </View>
          )}

          {missingCount === 0 && (
            <View style={[styles.missingTag, styles.completeTag]}>
              <Text style={[styles.missingText, styles.completeText]}>
                ✓ Hepsi mevcut
              </Text>
            </View>
          )}

          {recipe.tags && recipe.tags.length > 0 && (
            <View style={styles.tags}>
              {recipe.tags.slice(0, 2).map((tag, idx) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Pressable>
    </Link>
  );
}

const styles = StyleSheet.create({
  cardContainer: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#fff',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  imageWrapper: {
    width: '100%',
    height: 200,
    position: 'relative',
    backgroundColor: '#e5e7eb',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  difficultyBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  difficultyText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  scorePill: {
    position: 'absolute',
    top: 12,
    right: 12,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    minWidth: 50,
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
    fontSize: 12,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  content: {
    padding: 16,
    gap: 10,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    lineHeight: 20,
    color: '#1f2937',
  },
  meta: {
    flexDirection: 'row',
    gap: 16,
  },
  metaText: {
    fontSize: 12,
    color: '#6b7280',
  },
  missingTag: {
    backgroundColor: 'rgba(239,68,68,0.15)',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  completeTag: {
    backgroundColor: 'rgba(34,197,94,0.15)',
  },
  missingText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ef4444',
  },
  completeText: {
    color: '#22c55e',
  },
  tags: {
    flexDirection: 'row',
    gap: 6,
  },
  tag: {
    backgroundColor: 'rgba(194,65,12,0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagText: {
    fontSize: 11,
    color: '#c2410c',
    fontWeight: '600',
  },
});
