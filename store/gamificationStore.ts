import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { checkBadges, getBadgesByIds } from '@/lib/gamification/badges';
import { calculateStats, GameEvent, UserStats } from '@/lib/gamification/events';

type GameificationState = {
  events: GameEvent[];
  stats: UserStats;
  unlockedBadges: string[];
  logEvent: (event: Omit<GameEvent, 'timestamp'>) => void;
  getStats: () => UserStats;
  incrementSavedIngredients: (count: number) => void;
  updateFromEvents: () => void;
};

export const useGameificationStore = create<GameificationState>()(
  persist(
    (set, get) => ({
  events: [],
  stats: {
    totalCookedCount: 0,
    totalPlansCreated: 0,
    totalImported: 0,
    totalSavedIngredients: 0,
    currentStreak: 0,
    longestStreak: 0,
    unlockedBadges: [],
    likedRecipes: [],
  },
  unlockedBadges: [],

  logEvent: (event) => {
    set((state) => {
      const newEvent: GameEvent = {
        ...event,
        timestamp: new Date(),
      };
      const newEvents = [newEvent, ...state.events];
      const newStats = calculateStats(newEvents);
      const newBadges = checkBadges(newStats, state.unlockedBadges);

      return {
        events: newEvents,
        stats: newStats,
        unlockedBadges: newBadges,
      };
    });
  },

  getStats: () => get().stats,

  incrementSavedIngredients: (count: number) => {
    get().logEvent({
      type: 'pantry_saved',
      ingredientCount: count,
    });
  },

  updateFromEvents: () => {
    set((state) => {
      const newStats = calculateStats(state.events);
      const newBadges = checkBadges(newStats, state.unlockedBadges);
      return {
        stats: newStats,
        unlockedBadges: newBadges,
      };
    });
  },
    }),
    {
      name: 'gamification-storage',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
