import { useQuery } from '@tanstack/react-query';
import {
  getAllRecipes,
  getRecipeById,
  searchRecipes,
  getRecipesByDifficulty,
  getRecipesByCuisine,
  getRecipesByCourse,
  getRecipesByTag,
  getQuickRecipes,
} from '@/services/recipeService';

/**
 * Fetch all recipes
 */
export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: getAllRecipes,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

/**
 * Fetch a single recipe by ID
 */
export function useRecipe(recipeId: string) {
  return useQuery({
    queryKey: ['recipe', recipeId],
    queryFn: () => getRecipeById(recipeId),
    enabled: !!recipeId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

/**
 * Search recipes
 */
export function useSearchRecipes(query: string) {
  return useQuery({
    queryKey: ['recipes', 'search', query],
    queryFn: () => searchRecipes(query),
    enabled: query.length > 2,
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
}

/**
 * Filter recipes by difficulty
 */
export function useRecipesByDifficulty(difficulty: string) {
  return useQuery({
    queryKey: ['recipes', 'difficulty', difficulty],
    queryFn: () => getRecipesByDifficulty(difficulty),
    enabled: !!difficulty,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Filter recipes by cuisine
 */
export function useRecipesByCuisine(cuisine: string) {
  return useQuery({
    queryKey: ['recipes', 'cuisine', cuisine],
    queryFn: () => getRecipesByCuisine(cuisine),
    enabled: !!cuisine,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Filter recipes by course
 */
export function useRecipesByCourse(course: string) {
  return useQuery({
    queryKey: ['recipes', 'course', course],
    queryFn: () => getRecipesByCourse(course),
    enabled: !!course,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Filter recipes by tag
 */
export function useRecipesByTag(tag: string) {
  return useQuery({
    queryKey: ['recipes', 'tag', tag],
    queryFn: () => getRecipesByTag(tag),
    enabled: !!tag,
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Get quick recipes (30 minutes or less)
 */
export function useQuickRecipes() {
  return useQuery({
    queryKey: ['recipes', 'quick'],
    queryFn: getQuickRecipes,
    staleTime: 1000 * 60 * 5,
  });
}
