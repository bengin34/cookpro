import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { getPlanCount, PlanMode, rankRecipes } from '@/lib/planner';
import { buildShoppingList, ShoppingListGroup } from '@/lib/shoppingList';
import { UserPreferences } from '@/lib/scoring';
import { PantryItem, Recipe } from '@/lib/types';

type PlanState = {
  mode: PlanMode;
  planRecipes: Recipe[];
  lockedIds: string[];
  shoppingList: ShoppingListGroup[];
  preferences?: UserPreferences;
  setMode: (mode: PlanMode) => void;
  toggleLock: (recipeId: string) => void;
  setPreferences: (prefs: UserPreferences) => void;
  generatePlan: (pantryItems: PantryItem[], recipes: Recipe[]) => void;
  swapRecipe: (index: number, pantryItems: PantryItem[], recipes: Recipe[]) => void;
};

export const usePlanStore = create<PlanState>()(
  persist(
    (set, get) => ({
  mode: 'meal',
  planRecipes: [],
  lockedIds: [],
  shoppingList: [],
  preferences: undefined,
  setMode: (mode) => set({ mode }),
  toggleLock: (recipeId) =>
    set((state) => ({
      lockedIds: state.lockedIds.includes(recipeId)
        ? state.lockedIds.filter((id) => id !== recipeId)
        : [...state.lockedIds, recipeId],
    })),
  setPreferences: (prefs) => set({ preferences: prefs }),
  generatePlan: (pantryItems, recipes) => {
    const { mode, lockedIds, preferences } = get();
    if (recipes.length === 0) {
      set({
        planRecipes: [],
        shoppingList: [],
      });
      return;
    }
    const ranked = rankRecipes(pantryItems, recipes, preferences).map((entry) => entry.recipe);
    const count = getPlanCount(mode);

    const lockedRecipes = lockedIds
      .map((id) => ranked.find((recipe) => recipe.id === id))
      .filter((recipe): recipe is Recipe => Boolean(recipe));

    const selected: Recipe[] = lockedRecipes.slice(0, count);

    ranked.forEach((recipe) => {
      if (selected.length >= count) {
        return;
      }

      if (selected.some((item) => item.id === recipe.id)) {
        return;
      }

      selected.push(recipe);
    });

    set({
      planRecipes: selected,
      shoppingList: buildShoppingList(pantryItems, selected),
    });
  },
  swapRecipe: (index, pantryItems, recipes) => {
    const { planRecipes, lockedIds, preferences } = get();
    const current = planRecipes[index];
    if (!current || lockedIds.includes(current.id)) {
      return;
    }
    if (recipes.length === 0) {
      return;
    }

    const ranked = rankRecipes(pantryItems, recipes, preferences).map((entry) => entry.recipe);
    const currentIds = planRecipes.map((recipe) => recipe.id);
    const currentRankIndex = ranked.findIndex((recipe) => recipe.id === current.id);

    for (let i = currentRankIndex + 1; i < ranked.length; i += 1) {
      const candidate = ranked[i];
      if (!currentIds.includes(candidate.id)) {
        const nextPlan = [...planRecipes];
        nextPlan[index] = candidate;
        set({
          planRecipes: nextPlan,
          shoppingList: buildShoppingList(pantryItems, nextPlan),
        });
        return;
      }
    }
  },
    }),
    {
      name: 'plan-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
