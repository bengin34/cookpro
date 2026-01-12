import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from '@/lib/types';

export type SavedRecipe = Recipe & {
  savedAt: string;
  isFavorite: boolean;
  tags: string[];
  notes?: string;
  sourceUrl?: string;
};

type CookbookState = {
  savedRecipes: SavedRecipe[];
  favorites: string[]; // recipe IDs
  addRecipe: (recipe: Recipe, tags: string[], notes?: string) => void;
  toggleFavorite: (recipeId: string) => void;
  removeRecipe: (recipeId: string) => void;
  updateRecipeTags: (recipeId: string, tags: string[]) => void;
  updateRecipeNotes: (recipeId: string, notes: string) => void;
  getRecipeById: (recipeId: string) => SavedRecipe | undefined;
  getRecipesByTag: (tag: string) => SavedRecipe[];
  getAllTags: () => string[];
  searchRecipes: (query: string) => SavedRecipe[];
};

export const useCookbookStore = create<CookbookState>()(
  persist(
    (set, get) => ({
      savedRecipes: [],
      favorites: [],

      addRecipe: (recipe, tags = [], notes) =>
        set((state) => {
          const savedRecipe: SavedRecipe = {
            ...recipe,
            savedAt: new Date().toISOString(),
            isFavorite: false,
            tags,
            notes,
            sourceUrl: recipe.sourceUrl,
          };
          return {
            savedRecipes: [...state.savedRecipes, savedRecipe],
          };
        }),

      toggleFavorite: (recipeId) =>
        set((state) => {
          const updatedRecipes = state.savedRecipes.map((recipe) =>
            recipe.id === recipeId ? { ...recipe, isFavorite: !recipe.isFavorite } : recipe
          );
          const isFavorite = updatedRecipes.find((r) => r.id === recipeId)?.isFavorite ?? false;
          return {
            savedRecipes: updatedRecipes,
            favorites: isFavorite
              ? [...state.favorites, recipeId]
              : state.favorites.filter((id) => id !== recipeId),
          };
        }),

      removeRecipe: (recipeId) =>
        set((state) => ({
          savedRecipes: state.savedRecipes.filter((r) => r.id !== recipeId),
          favorites: state.favorites.filter((id) => id !== recipeId),
        })),

      updateRecipeTags: (recipeId, tags) =>
        set((state) => ({
          savedRecipes: state.savedRecipes.map((recipe) =>
            recipe.id === recipeId ? { ...recipe, tags } : recipe
          ),
        })),

      updateRecipeNotes: (recipeId, notes) =>
        set((state) => ({
          savedRecipes: state.savedRecipes.map((recipe) =>
            recipe.id === recipeId ? { ...recipe, notes } : recipe
          ),
        })),

      getRecipeById: (recipeId) => {
        return get().savedRecipes.find((r) => r.id === recipeId);
      },

      getRecipesByTag: (tag) => {
        return get().savedRecipes.filter((r) => r.tags.includes(tag));
      },

      getAllTags: () => {
        const tagsSet = new Set<string>();
        get().savedRecipes.forEach((recipe) => {
          recipe.tags.forEach((tag) => tagsSet.add(tag));
        });
        return Array.from(tagsSet).sort();
      },

      searchRecipes: (query) => {
        const lowerQuery = query.toLowerCase();
        return get().savedRecipes.filter(
          (recipe) =>
            recipe.title.toLowerCase().includes(lowerQuery) ||
            recipe.tags.some((tag) => tag.toLowerCase().includes(lowerQuery)) ||
            recipe.notes?.toLowerCase().includes(lowerQuery)
        );
      },
    }),
    {
      name: 'cookbook-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
