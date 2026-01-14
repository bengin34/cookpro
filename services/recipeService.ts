import { supabase } from '@/lib/supabase';

export interface RecipeIngredient {
  id: string;
  recipe_id: string;
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  optional: boolean;
}

export interface RecipeInstruction {
  id: string;
  recipe_id: string;
  step_number: number;
  instruction_text: string;
}

export interface Recipe {
  id: string;
  slug: string;
  title: string;
  description?: string;
  cuisine?: string;
  region?: string[];
  course?: string[];
  servings: number;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes?: number;
  difficulty?: string;
  tags?: string[];
  image_source?: string | null;
  user_id?: string | null;
  is_global: boolean;
  created_at?: string;
  recipe_ingredients?: RecipeIngredient[];
  recipe_instructions?: RecipeInstruction[];
}

/**
 * Fetch all recipes with their ingredients and instructions
 */
export async function getAllRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      *,
      recipe_ingredients(*),
      recipe_instructions(*)
    `
    )
    .eq('is_global', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Recipe[];
}

/**
 * Fetch a single recipe by ID with ingredients and instructions
 */
export async function getRecipeById(recipeId: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      *,
      recipe_ingredients(*),
      recipe_instructions(*)
    `
    )
    .eq('id', recipeId)
    .single();

  if (error) throw error;
  return data as Recipe;
}

/**
 * Search recipes by title or description
 */
export async function searchRecipes(query: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      *,
      recipe_ingredients(*),
      recipe_instructions(*)
    `
    )
    .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
    .eq('is_global', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Recipe[];
}

/**
 * Filter recipes by difficulty
 */
export async function getRecipesByDifficulty(difficulty: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      *,
      recipe_ingredients(*),
      recipe_instructions(*)
    `
    )
    .eq('difficulty', difficulty)
    .eq('is_global', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Recipe[];
}

/**
 * Filter recipes by cuisine
 */
export async function getRecipesByCuisine(cuisine: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      *,
      recipe_ingredients(*),
      recipe_instructions(*)
    `
    )
    .eq('cuisine', cuisine)
    .eq('is_global', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Recipe[];
}

/**
 * Filter recipes by course (breakfast, lunch, dinner, etc.)
 */
export async function getRecipesByCourse(course: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      *,
      recipe_ingredients(*),
      recipe_instructions(*)
    `
    )
    .contains('course', [course])
    .eq('is_global', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Recipe[];
}

/**
 * Filter recipes by tags
 */
export async function getRecipesByTag(tag: string) {
  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      *,
      recipe_ingredients(*),
      recipe_instructions(*)
    `
    )
    .contains('tags', [tag])
    .eq('is_global', true)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Recipe[];
}

/**
 * Get quick recipes (total time <= 30 minutes)
 */
export async function getQuickRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select(
      `
      *,
      recipe_ingredients(*),
      recipe_instructions(*)
    `
    )
    .lte('total_time_minutes', 30)
    .eq('is_global', true)
    .order('total_time_minutes', { ascending: true });

  if (error) throw error;
  return data as Recipe[];
}
