/**
 * Master ingredient list with metadata
 * Helps with deduplication, normalization, and allergen tracking
 */

import { StandardUnit } from '@/lib/cooking/units';

export type IngredientCategory =
  | 'protein'
  | 'vegetable'
  | 'fruit'
  | 'grain'
  | 'dairy'
  | 'oil'
  | 'spice'
  | 'sauce'
  | 'legume'
  | 'baking'
  | 'other';

export type Allergen = 'dairy' | 'gluten' | 'nuts' | 'shellfish' | 'eggs' | 'soy' | 'sesame' | 'peanuts';

export type MasterIngredient = {
  id: string;
  canonical: string; // "chicken breast"
  aliases: string[]; // ["chicken", "chicken breasts", "breast of chicken"]
  category: IngredientCategory;
  allergens?: Allergen[];
  defaultUnit?: StandardUnit;
  vegan?: boolean;
  vegetarian?: boolean;
  glutenFree?: boolean;
};

/**
 * Database of canonical ingredients with metadata
 * Used for:
 * 1. Normalizing user pantry input ("chicken" -> "chicken breast")
 * 2. Allergen tracking ("contains dairy")
 * 3. Diet compliance ("is vegan?")
 */
export const ingredientMaster: Record<string, MasterIngredient> = {
  // Proteins
  chicken_breast: {
    id: 'chicken_breast',
    canonical: 'chicken breast',
    aliases: ['chicken', 'chicken breasts', 'chicken breast fillets', 'chicken fillet'],
    category: 'protein',
    defaultUnit: 'g',
    vegan: false,
    vegetarian: false,
    glutenFree: true,
  },
  egg: {
    id: 'egg',
    canonical: 'egg',
    aliases: ['eggs', 'large egg', 'egg yolk'],
    category: 'protein',
    allergens: ['eggs'],
    defaultUnit: 'pcs',
    vegan: false,
    vegetarian: true,
    glutenFree: true,
  },
  milk: {
    id: 'milk',
    canonical: 'milk',
    aliases: ['whole milk', 'full fat milk', 'milk'],
    category: 'dairy',
    allergens: ['dairy'],
    defaultUnit: 'ml',
    vegan: false,
    vegetarian: true,
    glutenFree: true,
  },
  cheese: {
    id: 'cheese',
    canonical: 'cheese',
    aliases: ['cheddar cheese', 'white cheese', 'feta'],
    category: 'dairy',
    allergens: ['dairy'],
    defaultUnit: 'g',
    vegan: false,
    vegetarian: true,
    glutenFree: true,
  },
  yogurt: {
    id: 'yogurt',
    canonical: 'yogurt',
    aliases: ['greek yogurt', 'plain yogurt', 'natural yogurt'],
    category: 'dairy',
    allergens: ['dairy'],
    defaultUnit: 'ml',
    vegan: false,
    vegetarian: true,
    glutenFree: true,
  },

  // Grains & Carbs
  rice: {
    id: 'rice',
    canonical: 'rice',
    aliases: ['white rice', 'long grain rice', 'basmati rice'],
    category: 'grain',
    defaultUnit: 'g',
    vegan: true,
    vegetarian: true,
    glutenFree: true,
  },
  pasta: {
    id: 'pasta',
    canonical: 'pasta',
    aliases: ['spaghetti', 'penne', 'pasta noodles'],
    category: 'grain',
    allergens: ['gluten'],
    defaultUnit: 'g',
    vegan: true,
    vegetarian: true,
    glutenFree: false,
  },
  bread: {
    id: 'bread',
    canonical: 'bread',
    aliases: ['white bread', 'whole wheat bread', 'sliced bread'],
    category: 'grain',
    allergens: ['gluten'],
    defaultUnit: 'g',
    vegan: true,
    vegetarian: true,
    glutenFree: false,
  },

  // Vegetables
  tomato: {
    id: 'tomato',
    canonical: 'tomato',
    aliases: ['tomatoes', 'fresh tomato', 'cherry tomato'],
    category: 'vegetable',
    defaultUnit: 'pcs',
    vegan: true,
    vegetarian: true,
    glutenFree: true,
  },
  onion: {
    id: 'onion',
    canonical: 'onion',
    aliases: ['yellow onion', 'onions', 'red onion'],
    category: 'vegetable',
    defaultUnit: 'pcs',
    vegan: true,
    vegetarian: true,
    glutenFree: true,
  },
  garlic: {
    id: 'garlic',
    canonical: 'garlic',
    aliases: ['garlic cloves', 'garlic bulb', 'fresh garlic'],
    category: 'vegetable',
    defaultUnit: 'pcs',
    vegan: true,
    vegetarian: true,
    glutenFree: true,
  },
  bell_pepper: {
    id: 'bell_pepper',
    canonical: 'bell pepper',
    aliases: ['red pepper', 'green pepper', 'sweet pepper'],
    category: 'vegetable',
    defaultUnit: 'pcs',
    vegan: true,
    vegetarian: true,
    glutenFree: true,
  },

  // Oils & Condiments
  olive_oil: {
    id: 'olive_oil',
    canonical: 'olive oil',
    aliases: ['extra virgin olive oil', 'evoo', 'virgin olive oil'],
    category: 'oil',
    defaultUnit: 'ml',
    vegan: true,
    vegetarian: true,
    glutenFree: true,
  },
  salt: {
    id: 'salt',
    canonical: 'salt',
    aliases: ['sea salt', 'table salt', 'kosher salt'],
    category: 'spice',
    defaultUnit: 'tsp',
    vegan: true,
    vegetarian: true,
    glutenFree: true,
  },
  black_pepper: {
    id: 'black_pepper',
    canonical: 'black pepper',
    aliases: ['pepper', 'ground black pepper', 'black peppercorn'],
    category: 'spice',
    defaultUnit: 'tsp',
    vegan: true,
    vegetarian: true,
    glutenFree: true,
  },
};

/**
 * Find canonical ingredient from user input
 * @param userInput User's input (e.g., "chicken", "cheddar")
 * @returns Canonical ingredient info or null if not found
 */
export const findCanonicalIngredient = (userInput: string): MasterIngredient | null => {
  const normalized = userInput.toLowerCase().trim();

  // First try exact canonical match
  for (const ingredient of Object.values(ingredientMaster)) {
    if (ingredient.canonical.toLowerCase() === normalized) {
      return ingredient;
    }
  }

  // Then try aliases
  for (const ingredient of Object.values(ingredientMaster)) {
    if (ingredient.aliases.some((alias) => alias.toLowerCase() === normalized)) {
      return ingredient;
    }
  }

  // Finally try partial match (for fuzzy matching)
  for (const ingredient of Object.values(ingredientMaster)) {
    if (
      ingredient.canonical.toLowerCase().includes(normalized) ||
      ingredient.aliases.some((alias) => alias.toLowerCase().includes(normalized))
    ) {
      return ingredient;
    }
  }

  return null;
};

/**
 * Normalize ingredient name to canonical form
 * @param userInput Raw user input
 * @returns Canonical ingredient name
 */
export const normalizeIngredientName = (userInput: string): string => {
  const master = findCanonicalIngredient(userInput);
  return master?.canonical || userInput;
};

/**
 * Get allergen info for an ingredient
 */
export const getIngredientAllergens = (ingredientName: string): Allergen[] => {
  const master = findCanonicalIngredient(ingredientName);
  return master?.allergens || [];
};
