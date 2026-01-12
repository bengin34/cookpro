import { recipes } from '@/data/recipes';
import { Recipe } from '@/lib/types';

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const fetchRecipes = async (): Promise<Recipe[]> => {
  await delay(150);
  return recipes;
};

export const fetchRecipeById = async (id: string): Promise<Recipe> => {
  await delay(120);
  const recipe = recipes.find((item) => item.id === id);
  if (!recipe) {
    throw new Error('Recipe not found');
  }
  return recipe;
};
