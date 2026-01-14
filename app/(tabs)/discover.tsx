import { useQuery } from '@tanstack/react-query';
import React, { useMemo, useEffect } from 'react';
import { StyleSheet, View, ScrollView, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';

import { GlassCard } from '@/components/GlassCard';
import { Screen } from '@/components/Screen';
import { Text } from '@/components/Themed';
import { RecipeCard } from '@/components/RecipeCard';
import { RecipesCarousel } from '@/components/RecipesCarousel';
import { RecipeCardSkeleton } from '@/components/RecipeCardSkeleton';
import { fetchRecipes } from '@/lib/recipesApi';
import { scoreRecipe } from '@/lib/scoring';
import { usePantryStore } from '@/store/pantryStore';
import { usePreferencesStore } from '@/store/preferencesStore';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useAppStateRefresh } from '@/hooks/useAppStateRefresh';
import { cacheImage } from '@/lib/imageCache';

export default function DiscoverScreen() {
  const pantryItems = usePantryStore((state) => state.items);
  const preferences = usePreferencesStore((state) => state.preferences);
  const { isOffline, isOnline } = useNetworkStatus();
  const { data: recipes = [], isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['recipes'],
    queryFn: fetchRecipes,
  });

  // Monitor app state and refetch when app comes to foreground
  useAppStateRefresh({
    enabled: true,
    refetchOnForeground: true,
    staleTimeThreshold: 1000 * 60 * 5, // 5 minutes
  });

  // Refetch when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      // Only refetch if data is stale (handled by React Query's staleTime)
      refetch();
    }, [refetch])
  );

  const rankedRecipes = useMemo(() => {
    return recipes
      .map((recipe) => ({
        recipe,
        scoreInfo: scoreRecipe(pantryItems, recipe, preferences),
      }))
      .sort((a, b) => b.scoreInfo.score - a.scoreInfo.score);
  }, [pantryItems, recipes, preferences]);

  // Automatic image prefetch for top 20 recipes (only when online)
  useEffect(() => {
    if (rankedRecipes.length > 0 && isOnline) {
      // Prefetch images for top 20 recipes in background (non-blocking)
      const topRecipes = rankedRecipes.slice(0, 20);

      topRecipes.forEach(({ recipe }) => {
        if (recipe.imageUrl) {
          // Fire and forget - silent fail if error
          cacheImage(recipe.imageUrl).catch(() => {
            // Non-critical, ignore errors
          });
        }
      });
    }
  }, [rankedRecipes, isOnline]);

  const topRecipes = rankedRecipes.slice(0, 8);
  const quickWinsRecipes = rankedRecipes.filter((r) => r.scoreInfo.missingCount === 0).slice(0, 8);
  const fastRecipes = rankedRecipes
    .filter((r) => r.recipe.totalTimeMinutes && r.recipe.totalTimeMinutes <= 20)
    .slice(0, 8);

  return (
    <Screen>
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            tintColor="#007AFF"
          />
        }
      >
        <Text style={styles.title}>Discover</Text>
        <Text style={styles.subtitle}>Pantry'ne göre öneriler</Text>

        {/* Offline Banner */}
        {isOffline && (
          <GlassCard style={styles.offlineBanner}>
            <Text style={styles.offlineText}>📵 Offline - cached recipes</Text>
          </GlassCard>
        )}

        {/* Show subtle updating badge when refetching with cached data */}
        {isRefetching && recipes.length > 0 && (
          <GlassCard style={styles.updatingBanner}>
            <Text style={styles.updatingText}>🔄 Updating...</Text>
          </GlassCard>
        )}

        {/* Show skeleton only on initial load without cached data */}
        {isLoading && recipes.length === 0 ? (
          <View style={styles.container}>
            <Text style={styles.sectionTitle}>⭐ En iyi uyumlar</Text>
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
            <RecipeCardSkeleton />
          </View>
        ) : null}

        {isError && recipes.length === 0 ? (
          <GlassCard>
            <Text style={styles.meta}>Tarifler yuklenemedi.</Text>
          </GlassCard>
        ) : null}

        {recipes.length > 0 && (
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
      </ScrollView>
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
  offlineBanner: {
    marginBottom: 16,
    backgroundColor: 'rgba(255, 149, 0, 0.15)',
    borderColor: 'rgba(255, 149, 0, 0.3)',
    borderWidth: 1,
  },
  offlineText: {
    textAlign: 'center',
    opacity: 0.9,
    fontSize: 14,
  },
  updatingBanner: {
    marginBottom: 16,
    backgroundColor: 'rgba(0, 122, 255, 0.15)',
    borderColor: 'rgba(0, 122, 255, 0.3)',
    borderWidth: 1,
    paddingVertical: 8,
  },
  updatingText: {
    textAlign: 'center',
    opacity: 0.9,
    fontSize: 12,
    color: '#007AFF',
  },
});
