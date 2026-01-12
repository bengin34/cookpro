import { PantryItem, Recipe } from '@/lib/types';
import { findCanonicalIngredient, normalizeIngredientName } from '@/lib/data/ingredientMaster';

export type UserPreferences = {
  allergies: string[]; // ['peanut', 'dairy', 'gluten']
  diets: string[]; // ['vegetarian', 'vegan', 'keto']
  disliked: string[]; // ['cilantro', 'spicy']
  cuisinePreferences?: string[]; // ['italian', 'asian']
};

export type ScoreBreakdown = {
  score: number;
  matchScore: number;
  expiryBonus: number;
  varietyBonus: number;
  allergenPenalty: number;
  missingCount: number;
  missing: string[];
};

const normalize = (value: string) => value.trim().toLowerCase();

/**
 * Check if two ingredients match (using canonical form)
 * @param pantryName Ingredient name from pantry
 * @param recipeName Ingredient name from recipe
 * @returns true if they match
 */
const ingredientsMatch = (pantryName: string, recipeName: string): boolean => {
  // First try exact normalization match
  if (normalize(pantryName) === normalize(recipeName)) {
    return true;
  }

  // Try canonical matching
  const canonicalPantry = findCanonicalIngredient(pantryName);
  const canonicalRecipe = findCanonicalIngredient(recipeName);

  if (canonicalPantry && canonicalRecipe) {
    return canonicalPantry.id === canonicalRecipe.id;
  }

  // Fallback to normalized comparison
  return normalize(pantryName) === normalize(recipeName);
};

/**
 * Calculate expiry bonus for ingredients expiring soon
 * @param expiresAt ISO date string
 * @returns bonus points (0-20)
 */
const getExpiryBonus = (expiresAt?: string): number => {
  if (!expiresAt) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expireDate = new Date(expiresAt);
  expireDate.setHours(0, 0, 0, 0);

  const daysUntilExpiry = Math.floor((expireDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (daysUntilExpiry <= 0) return 0; // Already expired
  if (daysUntilExpiry === 1) return 20; // Expires tomorrow
  if (daysUntilExpiry <= 3) return 15; // Within 3 days
  if (daysUntilExpiry <= 7) return 8; // Within a week
  if (daysUntilExpiry <= 14) return 3; // Within 2 weeks
  return 0;
};

/**
 * Check if recipe contains user allergens
 * @returns penalty points (-20 to 0)
 */
const getAllergenPenalty = (recipe: Recipe, preferences: UserPreferences): number => {
  if (!recipe.allergens || preferences.allergies.length === 0) {
    return 0;
  }

  const hasAllergen = recipe.allergens.some((allergen) =>
    preferences.allergies.some((userAllergen) => normalize(allergen) === normalize(userAllergen)),
  );

  return hasAllergen ? -20 : 0;
};

/**
 * Check if recipe conflicts with user diets
 * @returns penalty points (-10 to 0)
 */
const getDietConflict = (recipe: Recipe, preferences: UserPreferences): number => {
  if (!recipe.tags || preferences.diets.length === 0) {
    return 0;
  }

  const recipeTags = recipe.tags.map(normalize);
  const userDiets = preferences.diets.map(normalize);

  // If user is vegetarian but recipe has meat
  if (userDiets.includes('vegetarian') && (recipeTags.includes('meat') || recipeTags.includes('chicken'))) {
    return -10;
  }
  if (userDiets.includes('vegan') && recipeTags.includes('dairy')) {
    return -10;
  }

  return 0;
};

/**
 * Score recipe based on pantry match and preferences
 * @param pantryItems Available ingredients
 * @param recipe Recipe to score
 * @param preferences User preferences (allergies, diets)
 * @param recentRecipes Recent recipes to avoid repetition (variety)
 */
export const scoreRecipe = (
  pantryItems: PantryItem[],
  recipe: Recipe,
  preferences?: UserPreferences,
  recentRecipes?: Recipe[],
): ScoreBreakdown => {
  const prefs = preferences || { allergies: [], diets: [], disliked: [] };
  const pantrySet = new Map(pantryItems.map((item) => [normalize(item.name), item]));
  const requiredIngredients = recipe.ingredients.filter((item) => !item.optional);

  if (requiredIngredients.length === 0) {
    return {
      score: 0,
      matchScore: 0,
      expiryBonus: 0,
      varietyBonus: 0,
      allergenPenalty: 0,
      missingCount: 0,
      missing: [],
    };
  }

  // 1. MATCH SCORE (50-60 points possible)
  let expiryBonusTotal = 0;
  const missing = requiredIngredients.filter((ingredient) => {
    // Try to find a matching pantry item (using canonical matching)
    let pantryItem = pantrySet.get(normalize(ingredient.name));

    if (!pantryItem) {
      // Try canonical matching if exact match fails
      for (const [pantryName, item] of pantrySet.entries()) {
        if (ingredientsMatch(pantryName, ingredient.name)) {
          pantryItem = item;
          break;
        }
      }
    }

    if (!pantryItem) return true;

    // Add expiry bonus if ingredient is in pantry and expiring soon
    expiryBonusTotal += getExpiryBonus(pantryItem.expiresAt);
    return false;
  });

  const matchCount = requiredIngredients.length - missing.length;
  const matchScore = Math.round((matchCount / requiredIngredients.length) * 60);

  // 2. EXPIRY BONUS (0-20 points)
  const expiryBonus = Math.min(expiryBonusTotal, 20);

  // 3. VARIETY BONUS (0-15 points - penalty for recent recipes)
  let varietyBonus = 0;
  if (!recentRecipes || !recentRecipes.some((r) => r.id === recipe.id)) {
    varietyBonus = 15;
  } else if (recentRecipes.length < 3) {
    varietyBonus = 8;
  }

  // 4. ALLERGEN PENALTY (-20 to 0)
  const allergenPenalty = getAllergenPenalty(recipe, prefs);

  // 5. DIET CONFLICT (-10 to 0)
  const dietConflict = getDietConflict(recipe, prefs);

  const totalScore = Math.max(0, matchScore + expiryBonus + varietyBonus + allergenPenalty + dietConflict);

  return {
    score: Math.round(totalScore),
    matchScore,
    expiryBonus,
    varietyBonus,
    allergenPenalty: allergenPenalty + dietConflict,
    missingCount: missing.length,
    missing: missing.map((ingredient) => ingredient.name),
  };
};

/**
 * Deprecated: Use scoreRecipe with preferences instead
 */
export const scoreRecipeSimple = (pantryItems: PantryItem[], recipe: Recipe) => {
  return scoreRecipe(pantryItems, recipe);
};
