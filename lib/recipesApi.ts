import { supabase } from '@/lib/supabase';
import { Recipe } from '@/lib/types';

export const fetchRecipes = async (): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id,
      title,
      image_source,
      servings,
      total_time_minutes,
      tags,
      difficulty,
      cuisine,
      created_at,
      recipe_ingredients (
        id,
        name,
        quantity,
        unit,
        optional
      ),
      recipe_instructions (
        step_number,
        instruction_text
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching recipes:', error);
    throw new Error('Failed to fetch recipes');
  }

  // Transform Supabase data to match Recipe type
  return (data || []).map((recipe) => {
    // Get instructions from recipe_instructions relation
    const instructions: string[] = recipe.recipe_instructions && Array.isArray(recipe.recipe_instructions)
      ? recipe.recipe_instructions
          .sort((a: any, b: any) => a.step_number - b.step_number)
          .map((inst: any) => inst.instruction_text)
      : [];

    return {
      id: recipe.id,
      title: recipe.title,
      imageUrl: recipe.image_source || undefined, // Fixed: Use image_source column
      servings: recipe.servings || 1,
      totalTimeMinutes: recipe.total_time_minutes || undefined,
      instructions,
      tags: recipe.tags || [],
      difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard' | undefined,
      cuisine: recipe.cuisine || undefined,
      ingredients: (recipe.recipe_ingredients || []).map((ing: any) => ({
        id: ing.id,
        name: ing.name,
        quantity: ing.quantity ? String(ing.quantity) : undefined,
        unit: ing.unit || undefined,
        optional: ing.optional || false,
      })),
    };
  });
};

export const fetchRecipeById = async (id: string): Promise<Recipe> => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id,
      title,
      image_source,
      servings,
      total_time_minutes,
      tags,
      difficulty,
      cuisine,
      created_at,
      recipe_ingredients (
        id,
        name,
        quantity,
        unit,
        optional
      ),
      recipe_instructions (
        step_number,
        instruction_text
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching recipe:', error);
    throw new Error('Recipe not found');
  }

  // Transform Supabase data to match Recipe type
  // Get instructions from recipe_instructions relation
  const instructions: string[] = data.recipe_instructions && Array.isArray(data.recipe_instructions)
    ? data.recipe_instructions
        .sort((a: any, b: any) => a.step_number - b.step_number)
        .map((inst: any) => inst.instruction_text)
    : [];

  return {
    id: data.id,
    title: data.title,
    imageUrl: data.image_source || undefined, // Fixed: Use image_source column
    servings: data.servings || 1,
    totalTimeMinutes: data.total_time_minutes || undefined,
    instructions,
    tags: data.tags || [],
    difficulty: data.difficulty as 'easy' | 'medium' | 'hard' | undefined,
    cuisine: data.cuisine || undefined,
    ingredients: (data.recipe_ingredients || []).map((ing: any) => ({
      id: ing.id,
      name: ing.name,
      quantity: ing.quantity ? String(ing.quantity) : undefined,
      unit: ing.unit || undefined,
      optional: ing.optional || false,
    })),
  };
};
