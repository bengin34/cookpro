import { supabase } from '@/lib/supabase';
import { Recipe } from '@/lib/types';

export const fetchRecipes = async (): Promise<Recipe[]> => {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
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
    let instructions: string[] = [];

    if (recipe.recipe_instructions && Array.isArray(recipe.recipe_instructions)) {
      // Sort by step_number and extract instruction_text
      instructions = recipe.recipe_instructions
        .sort((a: any, b: any) => a.step_number - b.step_number)
        .map((inst: any) => inst.instruction_text);
    } else if (recipe.instructions) {
      // Fallback: Parse instructions if it's stored in the main recipe table
      if (typeof recipe.instructions === 'string') {
        try {
          const parsed = JSON.parse(recipe.instructions);
          instructions = Array.isArray(parsed) ? parsed : [parsed];
        } catch {
          instructions = [recipe.instructions];
        }
      } else if (Array.isArray(recipe.instructions)) {
        instructions = recipe.instructions;
      }

      // Handle instructions in object format: [{step: 1, text: "..."}, ...]
      if (instructions.length > 0 && typeof instructions[0] === 'object' && instructions[0] !== null) {
        instructions = instructions.map((inst: any) => inst.text || String(inst));
      }
    }

    return {
      id: recipe.id,
      title: recipe.title,
      imageUrl: recipe.image_url || undefined,
      sourceUrl: recipe.source_url || undefined,
      servings: recipe.servings || 1,
      totalTimeMinutes: recipe.total_time_minutes || undefined,
      instructions,
      tags: recipe.tags || [],
      difficulty: recipe.difficulty as 'easy' | 'medium' | 'hard' | undefined,
      cuisine: recipe.cuisine || undefined,
      category: recipe.category || undefined,
      allergens: recipe.allergens || undefined,
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
      *,
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
  let instructions: string[] = [];

  if (data.recipe_instructions && Array.isArray(data.recipe_instructions)) {
    // Sort by step_number and extract instruction_text
    instructions = data.recipe_instructions
      .sort((a: any, b: any) => a.step_number - b.step_number)
      .map((inst: any) => inst.instruction_text);
  } else if (data.instructions) {
    // Fallback: Parse instructions if it's stored in the main recipe table
    if (typeof data.instructions === 'string') {
      try {
        const parsed = JSON.parse(data.instructions);
        instructions = Array.isArray(parsed) ? parsed : [parsed];
      } catch {
        instructions = [data.instructions];
      }
    } else if (Array.isArray(data.instructions)) {
      instructions = data.instructions;
    }

    // Handle instructions in object format: [{step: 1, text: "..."}, ...]
    if (instructions.length > 0 && typeof instructions[0] === 'object' && instructions[0] !== null) {
      instructions = instructions.map((inst: any) => inst.text || String(inst));
    }
  }

  return {
    id: data.id,
    title: data.title,
    imageUrl: data.image_url || undefined,
    sourceUrl: data.source_url || undefined,
    servings: data.servings || 1,
    totalTimeMinutes: data.total_time_minutes || undefined,
    instructions,
    tags: data.tags || [],
    difficulty: data.difficulty as 'easy' | 'medium' | 'hard' | undefined,
    cuisine: data.cuisine || undefined,
    category: data.category || undefined,
    allergens: data.allergens || undefined,
    ingredients: (data.recipe_ingredients || []).map((ing: any) => ({
      id: ing.id,
      name: ing.name,
      quantity: ing.quantity ? String(ing.quantity) : undefined,
      unit: ing.unit || undefined,
      optional: ing.optional || false,
    })),
  };
};
