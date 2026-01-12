import { PantryItem, Recipe } from '@/lib/types';
import { scoreRecipe, UserPreferences } from '@/lib/scoring';

export type PlanMode = 'meal' | 'day' | 'week';

const planCounts: Record<PlanMode, number> = {
  meal: 1,
  day: 3,
  week: 5,
};

export const getPlanCount = (mode: PlanMode) => planCounts[mode];

export const rankRecipes = (
  pantryItems: PantryItem[],
  recipes: Recipe[],
  preferences?: UserPreferences,
  recentRecipes?: Recipe[],
) =>
  recipes
    .map((recipe) => ({
      recipe,
      score: scoreRecipe(pantryItems, recipe, preferences, recentRecipes).score,
    }))
    .sort((a, b) => b.score - a.score);

export const buildPlan = (
  pantryItems: PantryItem[],
  recipes: Recipe[],
  mode: PlanMode,
  preferences?: UserPreferences,
  recentRecipes?: Recipe[],
) => {
  const ranked = rankRecipes(pantryItems, recipes, preferences, recentRecipes);
  const count = getPlanCount(mode);

  return ranked.slice(0, count).map((entry) => entry.recipe);
};
