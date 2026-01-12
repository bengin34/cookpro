import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SubscriptionTier } from '@/lib/paywall/limits';
import { assignVariant, ABVariant } from '@/lib/ab-testing/config';

type UserState = {
  userId: string;
  tier: SubscriptionTier;
  variant: ABVariant;
  importedRecipesCount: number;
  daysActive: number;
  plansCreatedToday: number;
  premiumConvertedAt?: string;
  setUserId: (id: string) => void;
  upgradeToPremium: () => void;
  downgradeToPremium: () => void;
  incrementImportedRecipes: () => void;
  incrementPlansCreated: () => void;
  setDaysActive: (days: number) => void;
  resetPlansCreatedToday: () => void;
};

export const useUserStore = create<UserState>()(
  persist(
    (set) => {
      // Generate or load user ID
      const userId = `user-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      const variant = assignVariant(userId);

      return {
        userId,
        tier: 'free' as SubscriptionTier,
        variant,
        importedRecipesCount: 0,
        daysActive: 0,
        plansCreatedToday: 0,

        setUserId: (id) => set({ userId: id }),

        upgradeToPremium: () =>
          set({
            tier: 'premium',
            premiumConvertedAt: new Date().toISOString(),
          }),

        downgradeToPremium: () =>
          set({
            tier: 'free',
          }),

        incrementImportedRecipes: () =>
          set((state) => ({
            importedRecipesCount: state.importedRecipesCount + 1,
          })),

        incrementPlansCreated: () =>
          set((state) => ({
            plansCreatedToday: state.plansCreatedToday + 1,
          })),

        setDaysActive: (days) =>
          set({
            daysActive: days,
          }),

        resetPlansCreatedToday: () =>
          set({
            plansCreatedToday: 0,
          }),
      };
    },
    {
      name: 'user-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
