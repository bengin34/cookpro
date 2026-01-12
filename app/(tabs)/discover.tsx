import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';

import { GlassCard } from '@/components/GlassCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Themed';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipesCarousel } from '@/components/RecipesCarousel';
import { fetchRecipes } from '@/lib/recipesApi';
import { scoreRecipe } from '@/lib/scoring';
import { usePantryStore } from '@/store/pantryStore';
import { usePreferencesStore } from '@/store/preferencesStore';

export default function DiscoverScreen() {
  const pantryItems = usePantryStore((state) => state.items);
  const preferences = usePreferencesStore((state) => state.preferences);
  const { data: recipes = [], isLoading, isError } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  const rankedRecipes = useMemo(() => {
    return recipes
      .map((recipe) => ({
        recipe,
        scoreInfo: scoreRecipe(pantryItems, recipe, preferences),
      }))
      .sort((a, b) => b.scoreInfo.score - a.scoreInfo.score);
  }, [pantryItems, recipes, preferences]);

  const topRecipes = rankedRecipes.slice(0, 8);
  const quickWinsRecipes = rankedRecipes.filter((r) => r.scoreInfo.missingCount === 0).slice(0, 8);
  const fastRecipes = rankedRecipes
    .filter((r) => r.recipe.totalTimeMinutes && r.recipe.totalTimeMinutes <= 20)
    .slice(0, 8);

  return (
    <Screen>
      <Text style={styles.title}>Discover</Text>
      <Text style={styles.subtitle}>Pantry'ne göre öneriler</Text>

      {isLoading ? (
        <GlassCard>
          <Text style={styles.meta}>Tarifler yukleniyor...</Text>
        </GlassCard>
      ) : null}

      {isError ? (
        <GlassCard>
          <Text style={styles.meta}>Tarifler yuklenemedi.</Text>
        </GlassCard>
      ) : null}

      {!isLoading && !isError && (
        <View style={styles.container}>
          {/* Top Recommendations */}
          {topRecipes.length > 0 && (
            <RecipesCarousel
              title="⭐ En iyi uyumlar"
              recipes={topRecipes.map((r) => ({
                recipe: r.recipe,
                score: r.scoreInfo.score,
                missingCount: r.scoreInfo.missingCount,
              }))}
            />
          )}

          {/* Quick Wins - All ingredients available */}
          {quickWinsRecipes.length > 0 && (
            <RecipesCarousel
              title="✓ Eksik olmayan tarifler"
              recipes={quickWinsRecipes.map((r) => ({
                recipe: r.recipe,
                score: r.scoreInfo.score,
                missingCount: r.scoreInfo.missingCount,
              }))}
            />
          )}

          {/* Fast Recipes */}
          {fastRecipes.length > 0 && (
            <RecipesCarousel
              title="⚡ Hızlı tarifler (≤20 dk)"
              recipes={fastRecipes.map((r) => ({
                recipe: r.recipe,
                score: r.scoreInfo.score,
                missingCount: r.scoreInfo.missingCount,
              }))}
            />
          )}

          {/* All Recipes - Full List */}
          <View style={styles.allRecipesSection}>
            <Text style={styles.sectionTitle}>📚 Tüm Tarifler</Text>
            {rankedRecipes.map(({ recipe, scoreInfo }) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                score={scoreInfo.score}
                missingCount={scoreInfo.missingCount}
              />
            ))}
          </View>
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: 24,
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    fontFamily: 'SpaceMono',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.7,
    fontFamily: 'SpaceMono',
    marginBottom: 24,
  },
  allRecipesSection: {
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  meta: {
    opacity: 0.7,
  },
});
