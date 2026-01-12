export type PantryItem = {
  id: string;
  name: string;
  quantity?: number;
  unit?: string; // 'g', 'ml', 'pcs', 'cup', 'tbsp'
  expiresAt?: string; // ISO date
};

export type RecipeIngredient = {
  name: string;
  quantity?: string;
  unit?: string;
  optional?: boolean;
};

export type Recipe = {
  id: string;
  title: string;
  totalTimeMinutes?: number;
  servings?: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  tags?: string[];
  allergens?: string[]; // ['dairy', 'gluten', 'nuts']
  cuisine?: string; // 'italian', 'asian', 'mediterranean'
  category?: string; // 'pasta', 'salad', 'soup'
  difficulty?: 'easy' | 'medium' | 'hard';
  sourceUrl?: string;
};
