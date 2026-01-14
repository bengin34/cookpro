import { useMemo } from 'react';
import { useRecipes } from './useRecipes';
import { usePantryStore } from '@/store/pantryStore';
import { scoreRecipe, UserPreferences, ScoreBreakdown } from '@/lib/scoring';
import { Recipe as SupabaseRecipe } from '@/services/recipeService';
import { Recipe as ScoringRecipe, RecipeIngredient } from '@/lib/types';

export type ScoredRecipe = {
  recipe: SupabaseRecipe;
  scoreBreakdown: ScoreBreakdown;
};

type SortOption = 'best-match' | 'quickest' | 'cheapest';

/**
 * Convert Supabase recipe format to scoring library format
 */
function convertToScoringRecipe(supabaseRecipe: SupabaseRecipe): ScoringRecipe {
  return {
    id: supabaseRecipe.id,
    title: supabaseRecipe.title,
    imageUrl: supabaseRecipe.image_source || undefined,
    totalTimeMinutes: supabaseRecipe.total_time_minutes,
    servings: supabaseRecipe.servings,
    ingredients:
      supabaseRecipe.recipe_ingredients?.map(
        (ing): RecipeIngredient => ({
          name: ing.name,
          quantity: ing.quantity?.toString(),
          unit: ing.unit,
          optional: ing.optional,
        }),
      ) || [],
    instructions:
      supabaseRecipe.recipe_instructions
        ?.sort((a, b) => a.step_number - b.step_number)
        .map((inst) => inst.instruction_text) || [],
    tags: supabaseRecipe.tags,
    cuisine: supabaseRecipe.cuisine,
    difficulty: supabaseRecipe.difficulty as 'easy' | 'medium' | 'hard' | undefined,
    sourceUrl: supabaseRecipe.image_source || undefined,
  };
}

/**
 * Hook that fetches recipes and scores them based on pantry items
 * @param preferences User preferences (allergies, diets, etc.)
 * @param recentRecipeIds Recently cooked recipe IDs for variety bonus
 * @param sortBy How to sort the results
 */
export function usePantryRecipes(
  preferences?: UserPreferences,
  recentRecipeIds?: string[],
  sortBy: SortOption = 'best-match',
) {
  const { data: recipes, isLoading, error } = useRecipes();
  const pantryItems = usePantryStore((state) => state.items);

  const scoredRecipes = useMemo(() => {
    if (!recipes) return [];

    // Convert recent recipe IDs to ScoringRecipe format for variety calculation
    const recentRecipes = recentRecipeIds
      ? recipes.filter((r) => recentRecipeIds.includes(r.id)).map(convertToScoringRecipe)
      : undefined;

    // Score all recipes based on pantry items
    const scored: ScoredRecipe[] = recipes.map((recipe) => {
      const scoringRecipe = convertToScoringRecipe(recipe);
      return {
        recipe,
        scoreBreakdown: scoreRecipe(pantryItems, scoringRecipe, preferences, recentRecipes),
      };
    });

    // Sort based on selected option
    switch (sortBy) {
      case 'best-match':
        return scored.sort((a, b) => b.scoreBreakdown.score - a.scoreBreakdown.score);

      case 'quickest':
        return scored.sort((a, b) => {
          const timeA = a.recipe.total_time_minutes || 999;
          const timeB = b.recipe.total_time_minutes || 999;
          return timeA - timeB;
        });

      case 'cheapest':
        // Sort by missing count (fewer missing ingredients = cheaper)
        return scored.sort((a, b) => {
          if (a.scoreBreakdown.missingCount !== b.scoreBreakdown.missingCount) {
            return a.scoreBreakdown.missingCount - b.scoreBreakdown.missingCount;
          }
          // If same missing count, use pantry fit score as tiebreaker
          return b.scoreBreakdown.score - a.scoreBreakdown.score;
        });

      default:
        return scored;
    }
  }, [recipes, pantryItems, preferences, recentRecipes, sortBy]);

  return {
    scoredRecipes,
    isLoading,
    error,
    pantryItemCount: pantryItems.length,
  };
}

/**
 * Hook to get recipes that can be made entirely from pantry items
 */
export function useCompletePantryRecipes(preferences?: UserPreferences, recentRecipeIds?: string[]) {
  const { scoredRecipes, isLoading, error, pantryItemCount } = usePantryRecipes(
    preferences,
    recentRecipeIds,
    'best-match',
  );

  const completeRecipes = useMemo(() => {
    return scoredRecipes.filter((scored) => scored.scoreBreakdown.missingCount === 0);
  }, [scoredRecipes]);

  return {
    completeRecipes,
    isLoading,
    error,
    pantryItemCount,
  };
}

/**
 * Hook to get recipes missing only a few ingredients
 * @param maxMissing Maximum number of missing ingredients (default: 2)
 */
export function useAlmostCompleteRecipes(
  maxMissing: number = 2,
  preferences?: UserPreferences,
  recentRecipeIds?: string[],
) {
  const { scoredRecipes, isLoading, error, pantryItemCount } = usePantryRecipes(
    preferences,
    recentRecipeIds,
    'best-match',
  );

  const almostCompleteRecipes = useMemo(() => {
    return scoredRecipes.filter(
      (scored) => scored.scoreBreakdown.missingCount > 0 && scored.scoreBreakdown.missingCount <= maxMissing,
    );
  }, [scoredRecipes, maxMissing]);

  return {
    almostCompleteRecipes,
    isLoading,
    error,
    pantryItemCount,
  };
}

/**
 * Hook to get recipes that use ingredients expiring soon
 */
export function useExpiringIngredientRecipes(preferences?: UserPreferences, recentRecipeIds?: string[]) {
  const { scoredRecipes, isLoading, error, pantryItemCount } = usePantryRecipes(
    preferences,
    recentRecipeIds,
    'best-match',
  );

  const expiringRecipes = useMemo(() => {
    // Filter recipes with expiry bonus > 0 (uses expiring ingredients)
    return scoredRecipes
      .filter((scored) => scored.scoreBreakdown.expiryBonus > 0)
      .sort((a, b) => b.scoreBreakdown.expiryBonus - a.scoreBreakdown.expiryBonus);
  }, [scoredRecipes]);

  return {
    expiringRecipes,
    isLoading,
    error,
    pantryItemCount,
  };
}
