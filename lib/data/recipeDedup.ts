/**
 * Recipe deduplication and merging utilities
 * Helps identify and merge duplicate/similar recipes
 */

import { Recipe } from '@/lib/types';

/**
 * Levenshtein distance for string similarity
 * Returns 0 for identical strings, higher for more different
 */
const levenshteinDistance = (a: string, b: string): number => {
  const shorter = a.length < b.length ? a : b;
  const longer = a.length < b.length ? b : a;

  if (shorter.length === 0) return longer.length;

  const prevRow = Array.from({ length: shorter.length + 1 }, (_, i) => i);
  const currRow = new Array(shorter.length + 1);

  for (let i = 0; i < longer.length; i++) {
    currRow[0] = i + 1;

    for (let j = 0; j < shorter.length; j++) {
      const insertions = currRow[j] + 1;
      const deletions = prevRow[j + 1] + 1;
      const substitutions = prevRow[j] + (longer[i] !== shorter[j] ? 1 : 0);
      currRow[j + 1] = Math.min(insertions, deletions, substitutions);
    }

    prevRow.splice(0, prevRow.length, ...currRow);
  }

  return currRow[shorter.length];
};

/**
 * Calculate title similarity (0 to 1, where 1 is identical)
 */
const getTitleSimilarity = (title1: string, title2: string): number => {
  const normalized1 = title1.toLowerCase().trim();
  const normalized2 = title2.toLowerCase().trim();

  if (normalized1 === normalized2) return 1;

  const distance = levenshteinDistance(normalized1, normalized2);
  const maxLen = Math.max(normalized1.length, normalized2.length);

  return 1 - distance / maxLen;
};

/**
 * Jaccard similarity for ingredient sets
 * Returns 0 to 1, where 1 means identical ingredient sets
 */
const getIngredientSimilarity = (recipe1: Recipe, recipe2: Recipe): number => {
  const set1 = new Set(recipe1.ingredients.map((i) => i.name.toLowerCase().trim()));
  const set2 = new Set(recipe2.ingredients.map((i) => i.name.toLowerCase().trim()));

  const intersection = new Set([...set1].filter((x) => set2.has(x)));
  const union = new Set([...set1, ...set2]);

  if (union.size === 0) return 0;
  return intersection.size / union.size;
};

/**
 * Check if two recipes are likely duplicates
 * Threshold: title similarity > 0.7 AND ingredient similarity > 0.6
 */
export const areDuplicates = (recipe1: Recipe, recipe2: Recipe): boolean => {
  if (recipe1.id === recipe2.id) return true;

  const titleSim = getTitleSimilarity(recipe1.title, recipe2.title);
  const ingredientSim = getIngredientSimilarity(recipe1, recipe2);

  return titleSim > 0.7 && ingredientSim > 0.6;
};

/**
 * Find duplicate groups in a recipe list
 * Returns array of arrays, each sub-array is a duplicate group
 */
export const findDuplicateGroups = (recipes: Recipe[]): Recipe[][] => {
  const groups: Recipe[][] = [];
  const processed = new Set<string>();

  for (const recipe of recipes) {
    if (processed.has(recipe.id)) continue;

    const group = [recipe];
    processed.add(recipe.id);

    for (const other of recipes) {
      if (processed.has(other.id)) continue;
      if (areDuplicates(recipe, other)) {
        group.push(other);
        processed.add(other.id);
      }
    }

    groups.push(group);
  }

  return groups.filter((g) => g.length > 1);
};

/**
 * Quality score for a recipe
 * Used to pick the "best" version when merging duplicates
 */
const getRecipeQuality = (recipe: Recipe): number => {
  let score = 0;

  // Has ingredients (1 point per ingredient, max 20)
  score += Math.min(recipe.ingredients.length * 2, 20);

  // Has instructions (5 points)
  if (recipe.instructions.length > 0) score += 5;

  // Has cooking time (3 points)
  if (recipe.totalTimeMinutes) score += 3;

  // Has servings (2 points)
  if (recipe.servings) score += 2;

  // Has source URL (1 point)
  if (recipe.sourceUrl) score += 1;

  return score;
};

/**
 * Merge duplicate recipes, keeping the best version
 * Prefers recipe with more complete information
 */
export const mergeDuplicates = (recipes: Recipe[]): Recipe[] => {
  const groups = findDuplicateGroups(recipes);

  if (groups.length === 0) return recipes;

  // Create a set of IDs to remove (duplicates)
  const duplicateIds = new Set<string>();
  const kept = new Map<string, Recipe>();

  for (const group of groups) {
    // Sort by quality score, keep the best one
    const sorted = group.sort((a, b) => getRecipeQuality(b) - getRecipeQuality(a));
    const best = sorted[0];

    kept.set(best.id, best);

    // Mark others as duplicates
    for (let i = 1; i < sorted.length; i++) {
      duplicateIds.add(sorted[i].id);
    }
  }

  // Return recipes minus the duplicates, merged with any kept recipes
  return recipes.filter((r) => !duplicateIds.has(r.id));
};

/**
 * Check if recipe looks like a duplicate of existing recipes
 * Useful during import to warn user
 */
export const findSimilarRecipes = (newRecipe: Recipe, existingRecipes: Recipe[], threshold = 0.7): Recipe[] => {
  return existingRecipes.filter((existing) => {
    const titleSim = getTitleSimilarity(newRecipe.title, existing.title);
    const ingredientSim = getIngredientSimilarity(newRecipe, existing);

    return titleSim > threshold || (titleSim > 0.6 && ingredientSim > 0.7);
  });
};
