import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserPreferences } from '@/lib/scoring';

type PreferencesState = {
  preferences: UserPreferences;
  setAllergies: (allergies: string[]) => void;
  addAllergy: (allergy: string) => void;
  removeAllergy: (allergy: string) => void;
  setDiets: (diets: string[]) => void;
  addDiet: (diet: string) => void;
  removeDiet: (diet: string) => void;
  setDisliked: (disliked: string[]) => void;
  addDisliked: (ingredient: string) => void;
  removeDisliked: (ingredient: string) => void;
  setCuisinePreferences: (cuisines: string[]) => void;
  updatePreferences: (prefs: Partial<UserPreferences>) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
  preferences: {
    allergies: [],
    diets: [],
    disliked: [],
    cuisinePreferences: [],
  },

  setAllergies: (allergies) =>
    set((state) => ({
      preferences: { ...state.preferences, allergies },
    })),

  addAllergy: (allergy) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        allergies: [...new Set([...state.preferences.allergies, allergy])],
      },
    })),

  removeAllergy: (allergy) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        allergies: state.preferences.allergies.filter((a) => a !== allergy),
      },
    })),

  setDiets: (diets) =>
    set((state) => ({
      preferences: { ...state.preferences, diets },
    })),

  addDiet: (diet) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        diets: [...new Set([...state.preferences.diets, diet])],
      },
    })),

  removeDiet: (diet) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        diets: state.preferences.diets.filter((d) => d !== diet),
      },
    })),

  setDisliked: (disliked) =>
    set((state) => ({
      preferences: { ...state.preferences, disliked },
    })),

  addDisliked: (ingredient) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        disliked: [...new Set([...state.preferences.disliked, ingredient])],
      },
    })),

  removeDisliked: (ingredient) =>
    set((state) => ({
      preferences: {
        ...state.preferences,
        disliked: state.preferences.disliked.filter((i) => i !== ingredient),
      },
    })),

  setCuisinePreferences: (cuisines) =>
    set((state) => ({
      preferences: { ...state.preferences, cuisinePreferences: cuisines },
    })),

  updatePreferences: (prefs) =>
    set((state) => ({
      preferences: { ...state.preferences, ...prefs },
    })),
    }),
    {
      name: 'preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
