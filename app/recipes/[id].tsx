import { useQuery } from '@tanstack/react-query';
import { Link, useLocalSearchParams } from 'expo-router';
import { StyleSheet, View, Image, ScrollView, Pressable, ActivityIndicator } from 'react-native';
import { useState } from 'react';

import { GlassCard } from '@/components/GlassCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Themed';
import { fetchRecipeById } from '@/lib/recipesApi';
import { scoreRecipe } from '@/lib/scoring';
import { usePantryStore } from '@/store/pantryStore';
import { useCachedImage } from '@/hooks/useCachedImage';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const pantryItems = usePantryStore((state) => state.items);
  const [portions, setPortions] = useState(1);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'cooking'>('ingredients');

  const { data: recipe, isLoading, isError } = useQuery({
    queryKey: ['recipes', id],
    queryFn: () => fetchRecipeById(String(id)),
    enabled: Boolean(id),
  });

  if (isLoading) {
    return (
      <Screen>
        <Text style={styles.title}>Tarif yukleniyor...</Text>
      </Screen>
    );
  }

  if (isError || !recipe) {
    return (
      <Screen>
        <Text style={styles.title}>Tarif bulunamadi</Text>
      </Screen>
    );
  }

  const scoreInfo = scoreRecipe(pantryItems, recipe);
  const scoreColor = scoreInfo.score >= 75 ? '#22c55e' : scoreInfo.score >= 50 ? '#f97316' : '#ef4444';
  const { uri: cachedImageUri, isLoading: imageLoading } = useCachedImage(recipe.imageUrl);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Hero Image Section */}
      <View style={styles.heroContainer}>
        {cachedImageUri ? (
          <Image
            source={{ uri: cachedImageUri }}
            style={styles.heroImage}
          />
        ) : imageLoading ? (
          <View style={[styles.heroImage, styles.heroImagePlaceholder]}>
            <ActivityIndicator size="large" color="#c2410c" />
          </View>
        ) : (
          <Image
            source={require('@/assets/images/placeholder.png')}
            style={styles.heroImage}
          />
        )}

        {/* Dark overlay for text readability */}
        <View style={styles.heroOverlay} />

        {/* Title and Score Overlay */}
        <View style={styles.heroContent}>
          <Text style={styles.heroTitle}>{recipe.title}</Text>
          <View style={styles.scorePortionRow}>
            <View style={[styles.scoreDisplay, { borderColor: scoreColor }]}>
              <Text style={[styles.scoreDisplayText, { color: scoreColor }]}>
                {Math.round(scoreInfo.score)}%
              </Text>
              <Text style={styles.scoreLabel}>Uyum</Text>
            </View>
            <View style={styles.portionSection}>
              <Text style={styles.portionLabel}>🍽 Porsiyon</Text>
              <View style={styles.portionControl}>
                <Pressable
                  onPress={() => setPortions(Math.max(1, portions - 1))}
                  style={[styles.portionButton, portions === 1 && styles.portionButtonDisabled]}
                  disabled={portions === 1}
                >
                  <Text style={[styles.portionButtonText, portions === 1 && styles.portionButtonTextDisabled]}>−</Text>
                </Pressable>
                <Text style={styles.portionDisplay}>{portions}</Text>
                <Pressable
                  onPress={() => setPortions(portions + 1)}
                  style={styles.portionButton}
                >
                  <Text style={styles.portionButtonText}>+</Text>
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* Quick Info Cards */}
      <View style={styles.quickInfoContainer}>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>⏱ Süre</Text>
          <Text style={styles.infoValue}>{recipe.totalTimeMinutes ?? '--'} dk</Text>
        </View>
       
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>📊 Zorluk</Text>
          <Text style={styles.infoValue}>{recipe.difficulty?.toUpperCase() ?? 'EASY'}</Text>
        </View>
      </View>

      <View style={styles.contentContainer}>
        {/* Missing Ingredients Alert */}
        {scoreInfo.missingCount > 0 && (
          <GlassCard style={styles.alertCard}>
            <Text style={styles.alertTitle}>⚠️ Eksik Malzemeler</Text>
            <Text style={styles.alertBody}>
              {scoreInfo.missing.join(', ')}
            </Text>
          </GlassCard>
        )}

        {scoreInfo.missingCount === 0 && (
          <GlassCard style={[styles.alertCard, styles.successCard]}>
            <Text style={styles.successTitle}>✓ Tüm malzemeler mevcut!</Text>
          </GlassCard>
        )}

        {/* Tab Navigation */}
        <View style={styles.tabContainer}>
          <Pressable
            style={[styles.tabButton, activeTab === 'ingredients' && styles.tabButtonActive]}
            onPress={() => setActiveTab('ingredients')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'ingredients' && styles.tabButtonTextActive]}>
              Malzemeler
            </Text>
          </Pressable>
          <Pressable
            style={[styles.tabButton, activeTab === 'cooking' && styles.tabButtonActive]}
            onPress={() => setActiveTab('cooking')}
          >
            <Text style={[styles.tabButtonText, activeTab === 'cooking' && styles.tabButtonTextActive]}>
              Pişirme Talimatları
            </Text>
          </Pressable>
        </View>

        {/* Ingredients Tab */}
        {activeTab === 'ingredients' && (
          <GlassCard>
            <Text style={styles.sectionTitle}>Malzemeler ({recipe.ingredients.length})</Text>
            <View style={styles.ingredientsList}>
              {recipe.ingredients.map((ingredient, idx) => {
                const isPantry = pantryItems.some(
                  (p) => p.name.toLowerCase() === ingredient.name.toLowerCase()
                );
                const scaledQuantity = ingredient.quantity
                  ? (parseFloat(ingredient.quantity) * portions).toFixed(2)
                  : null;
                return (
                  <View key={idx} style={styles.ingredientRow}>
                    <Text style={[styles.ingredientBullet, isPantry && styles.ingredientAvailable]}>
                      {isPantry ? '✓' : '○'}
                    </Text>
                    <Text style={[styles.ingredientName, isPantry && styles.ingredientAvailableText]}>
                      {ingredient.name}
                    </Text>
                    {(scaledQuantity || ingredient.unit) && (
                      <Text style={styles.ingredientAmount}>
                        {scaledQuantity || ingredient.quantity} {ingredient.unit}
                      </Text>
                    )}
                  </View>
                );
              })}
            </View>
          </GlassCard>
        )}

        {/* Cooking Instructions Tab */}
        {activeTab === 'cooking' && (
          <GlassCard>
            {recipe.instructions && recipe.instructions.length > 0 ? (
              <>
                <Text style={styles.sectionTitle}>Pişirme Talimatları ({recipe.instructions.length})</Text>
                <View style={styles.instructionsList}>
                  {recipe.instructions.map((instruction, idx) => (
                    <View key={idx} style={styles.instructionRow}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.instructionText}>{instruction}</Text>
                    </View>
                  ))}
                </View>
              </>
            ) : (
              <>
                <Text style={styles.sectionTitle}>Pişirme Talimatları</Text>
                <Text style={styles.instructionText}>Bu tarif için henüz pişirme talimatları eklenmemiş.</Text>
              </>
            )}
          </GlassCard>
        )}

        {/* Tags Section */}
        {recipe.tags && recipe.tags.length > 0 && (
          <GlassCard>
            <Text style={styles.sectionTitle}>Etiketler</Text>
            <View style={styles.tagsContainer}>
              {recipe.tags.map((tag, idx) => (
                <View key={idx} style={styles.tagPill}>
                  <Text style={styles.tagText}>{tag}</Text>
                </View>
              ))}
            </View>
          </GlassCard>
        )}

        {/* CTA Button */}
        <Link href={`/recipes/${id}/cook`} asChild>
          <Pressable style={styles.cookButton}>
            <Text style={styles.cookButtonText}>🍳 Pişirmeye Başla</Text>
          </Pressable>
        </Link>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  heroContainer: {
    width: '100%',
    height: 300,
    position: 'relative',
    marginBottom: 20,
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
  },
  heroImagePlaceholder: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  heroContent: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'flex-end',
    paddingHorizontal: 24,
    paddingBottom: 24,
    gap: 12,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  scoreDisplay: {
    borderWidth: 2,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  scoreDisplayText: {
    fontSize: 20,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  scoreLabel: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.8,
  },
  scorePortionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  portionSection: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignContent: 'space-between',
    flex: 1,
    
    gap: 6,
  },
  portionLabel: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.8,
  },
  quickInfoContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  infoCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    gap: 4,
  },
  infoLabel: {
    fontSize: 12,
    opacity: 0.6,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  contentContainer: {
    paddingHorizontal: 24,
    paddingBottom: 40,
    gap: 16,
  },
  alertCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  successCard: {
    borderLeftColor: '#22c55e',
  },
  alertTitle: {
    fontWeight: '700',
    marginBottom: 4,
  },
  successTitle: {
    fontWeight: '700',
    color: '#22c55e',
  },
  alertBody: {
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  ingredientsList: {
    gap: 8,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.05)',
  },
  ingredientBullet: {
    fontSize: 14,
    opacity: 0.4,
    fontWeight: '600',
    minWidth: 16,
  },
  ingredientAvailable: {
    opacity: 1,
    color: '#22c55e',
  },
  ingredientName: {
    flex: 1,
    opacity: 0.7,
  },
  ingredientAvailableText: {
    opacity: 1,
    fontWeight: '600',
  },
  ingredientAmount: {
    opacity: 0.5,
    fontSize: 12,
  },
  instructionsList: {
    gap: 12,
  },
  instructionRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(194,65,12,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    flexShrink: 0,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#c2410c',
    fontFamily: 'SpaceMono',
  },
  instructionText: {
    flex: 1,
    opacity: 0.8,
    lineHeight: 20,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: 'rgba(194,65,12,0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  tagText: {
    fontSize: 12,
    color: '#c2410c',
    fontWeight: '600',
  },
  cookButton: {
    backgroundColor: '#c2410c',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  cookButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
  },
  portionControl: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  portionButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: 'rgba(194, 65, 12, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  portionButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#c2410c',
  },
  portionDisplay: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'SpaceMono',
    minWidth: 30,
    textAlign: 'center',
  },
  portionButtonDisabled: {
    backgroundColor: 'rgba(194, 65, 12, 0.1)',
    opacity: 0.4,
  },
  portionButtonTextDisabled: {
    color: '#c2410c',
    opacity: 0.5,
  },
  tabContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#c2410c',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.6,
  },
  tabButtonTextActive: {
    color: '#fff',
    opacity: 1,
  },
});
