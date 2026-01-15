import { Link } from 'expo-router';
import { StyleSheet, ScrollView, View, Pressable, Image, ActivityIndicator } from 'react-native';
import { useState } from 'react';

import { GlassCard, SectionContainer } from '@/components/GlassCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Themed';
import { useCookbookStore } from '@/store/cookbookStore';
import { useCachedImage } from '@/hooks/useCachedImage';
import type { Recipe } from '@/types/recipe';
import {
  scaleFontSize,
  moderateScale,
  getResponsiveValue,
  scaleHeight,
} from '@/lib/responsive';

function RecipeListItem({ recipe }: { recipe: Recipe }) {
  const { toggleFavorite } = useCookbookStore();
  const { uri: cachedImageUri, isLoading: imageLoading } = useCachedImage(recipe.imageUrl);

  return (
    <Link href={`/recipes/${recipe.id}`} asChild>
      <Pressable>
        <View style={styles.recipeCardContainer}>
          {/* Recipe Image */}
          <View style={styles.recipeImageWrapper}>
            {cachedImageUri ? (
              <Image
                source={{ uri: cachedImageUri }}
                style={styles.recipeImage}
              />
            ) : imageLoading ? (
              <View style={[styles.recipeImage, styles.imagePlaceholder]}>
                <ActivityIndicator size="small" color="#c2410c" />
              </View>
            ) : (
              <Image
                source={require('@/assets/images/placeholder.png')}
                style={styles.recipeImage}
              />
            )}
            {/* Favorite Badge */}
            <Pressable
              style={styles.favoriteBadge}
              onPress={(e) => {
                e.stopPropagation();
                toggleFavorite(recipe.id);
              }}>
              <Text style={styles.favoriteText}>
                {recipe.isFavorite ? '♥' : '♡'}
              </Text>
            </Pressable>
          </View>

          {/* Recipe Info */}
          <View style={styles.recipeInfo}>
            <Text style={styles.recipeTitle} numberOfLines={2}>
              {recipe.title}
            </Text>

            {/* Quick Info Row */}
            <View style={styles.quickInfo}>
              {recipe.totalTimeMinutes && (
                <Text style={styles.quickInfoText}>⏱ {recipe.totalTimeMinutes} dk</Text>
              )}
              {recipe.servings && (
                <Text style={styles.quickInfoText}>🍽 {recipe.servings}</Text>
              )}
            </View>

            {/* Ingredients Preview */}
            {recipe.ingredients && recipe.ingredients.length > 0 && (
              <View style={styles.ingredientsPreview}>
                {recipe.ingredients.slice(0, 2).map((ingredient) => (
                  <Text key={ingredient.name} style={styles.ingredientChip}>
                    {ingredient.name}
                  </Text>
                ))}
                {recipe.ingredients.length > 2 && (
                  <Text style={styles.ingredientChip}>
                    +{recipe.ingredients.length - 2}
                  </Text>
                )}
              </View>
            )}

            {/* Tags */}
            {recipe.tags && recipe.tags.length > 0 && (
              <View style={styles.tagsRow}>
                {recipe.tags.slice(0, 2).map((tag) => (
                  <Text key={tag} style={styles.tagChip}>
                    {tag}
                  </Text>
                ))}
              </View>
            )}
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

export default function CookbookScreen() {
  const { savedRecipes, toggleFavorite, getAllTags, getRecipesByTag } = useCookbookStore();
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const allTags = getAllTags();

  const filteredRecipes = selectedTag
    ? getRecipesByTag(selectedTag)
    : savedRecipes;

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>My Cookbook</Text>
        <Text style={styles.subtitle}>Kisisel arsiv</Text>

        {/* Import Section */}
        <SectionContainer title="Tarif Ekle" style={styles.importSection}>
          <GlassCard variant="elevated">
            <Text style={styles.cardTitle}>Tarif import</Text>
            <Text style={styles.cardBody}>URL yapistir, tarifini ekle.</Text>
            <Link href="/dialogs/recipe-import">
              <View style={styles.importButton}>
                <Text style={styles.importButtonText}>+ URL ile import</Text>
              </View>
            </Link>
          </GlassCard>
        </SectionContainer>

        {/* Tags Section */}
        {allTags.length > 0 && (
          <SectionContainer title="Etiketler" style={styles.tagsSection}>
            <View style={styles.tagContainer}>
              {allTags.map((tag) => (
                <Pressable
                  key={tag}
                  style={[
                    styles.tagButton,
                    selectedTag === tag && styles.tagButtonActive,
                  ]}
                  onPress={() => setSelectedTag(selectedTag === tag ? null : tag)}>
                  <Text
                    style={[
                      styles.tagText,
                      selectedTag === tag && styles.tagTextActive,
                    ]}>
                    {tag}
                  </Text>
                </Pressable>
              ))}
            </View>
          </SectionContainer>
        )}

        {/* Recipes Section */}
        <SectionContainer title="Tariflerim" style={styles.recipesSection}>
          {filteredRecipes.length > 0 ? (
            <>
              <View style={styles.recipeCountBadge}>
                <Text style={styles.recipeCountText}>
                  {selectedTag ? `"${selectedTag}" etiketli` : 'Toplam'} {filteredRecipes.length} tarif
                </Text>
              </View>

              {filteredRecipes.map((recipe) => (
                <RecipeListItem key={recipe.id} recipe={recipe} />
              ))}
            </>
          ) : (
            <GlassCard variant="subtle">
              <Text style={styles.cardTitle}>Kaydedilen Tarifler Yok</Text>
              <Text style={styles.cardBody}>
                {selectedTag
                  ? `"${selectedTag}" etiketinde tarif bulunmamakta.`
                  : 'Henuz kayitli tarif yok. Yukaridan URL ile import etmeye basla!'}
              </Text>
            </GlassCard>
          )}
        </SectionContainer>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: scaleFontSize(30),
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    marginBottom: moderateScale(8),
  },
  subtitle: {
    fontSize: scaleFontSize(14),
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
    fontFamily: 'SpaceMono',
    marginBottom: moderateScale(16),
  },
  importSection: {
    backgroundColor: 'rgba(194, 65, 12, 0.04)',
    borderColor: 'rgba(194, 65, 12, 0.1)',
  },
  tagsSection: {
    backgroundColor: 'rgba(167, 139, 250, 0.04)',
    borderColor: 'rgba(167, 139, 250, 0.1)',
  },
  recipesSection: {
    backgroundColor: 'rgba(0, 122, 255, 0.03)',
    borderColor: 'rgba(0, 122, 255, 0.08)',
  },
  importButton: {
    marginTop: moderateScale(8),
    backgroundColor: 'rgba(194, 65, 12, 0.1)',
    paddingVertical: moderateScale(10),
    paddingHorizontal: moderateScale(16),
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  importButtonText: {
    fontWeight: '600',
    color: '#c2410c',
    fontSize: scaleFontSize(14),
  },
  recipeCountBadge: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
    paddingVertical: moderateScale(8),
    paddingHorizontal: moderateScale(12),
    borderRadius: 10,
    marginBottom: moderateScale(12),
    alignSelf: 'flex-start',
  },
  recipeCountText: {
    fontSize: scaleFontSize(12),
    fontWeight: '600',
    color: '#007AFF',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardBody: {
    opacity: 0.8,
    fontSize: 14,
  },
  link: {
    fontWeight: '600',
    color: '#c2410c',
    marginTop: 8,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  tagButtonActive: {
    backgroundColor: '#c2410c',
    borderColor: '#c2410c',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    opacity: 0.8,
  },
  tagTextActive: {
    color: '#fff',
    opacity: 1,
  },
  recipeCardContainer: {
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginBottom: 16,
    flexDirection: 'row',
  },
  recipeImageWrapper: {
    width: getResponsiveValue('35%', '30%', '28%'),
    height: scaleHeight(140),
    position: 'relative',
    backgroundColor: '#e0e0e0',
  },
  recipeImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  favoriteText: {
    fontSize: 18,
    color: '#ff0000',
  },
  recipeInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  recipeTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 6,
  },
  quickInfo: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  quickInfoText: {
    fontSize: 11,
    opacity: 0.6,
  },
  ingredientsPreview: {
    flexDirection: 'row',
    gap: 4,
    flexWrap: 'wrap',
    marginBottom: 6,
  },
  ingredientChip: {
    fontSize: 10,
    backgroundColor: 'rgba(194,65,12,0.15)',
    color: '#c2410c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '500',
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  tagChip: {
    fontSize: 9,
    backgroundColor: 'rgba(194,65,12,0.1)',
    color: '#c2410c',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    fontWeight: '500',
  },
  recipeHeader: {
    marginBottom: 12,
  },
  recipeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  favoriteIcon: {
    fontSize: 18,
    color: '#dc2626',
    marginLeft: 8,
  },
  section: {
    marginVertical: 8,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    opacity: 0.9,
  },
  miniTagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  miniTag: {
    fontSize: 11,
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(194, 65, 12, 0.2)',
    color: '#c2410c',
    fontWeight: '500',
  },
  buttonGroup: {
    marginTop: 12,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: 'rgba(194, 65, 12, 0.15)',
    borderWidth: 1,
    borderColor: '#c2410c',
  },
  actionButtonText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#c2410c',
  },
});
