import { PlanMode } from '@/lib/planner';

export type GameEvent =
  | { type: 'cooked'; recipeId: string; timestamp: Date }
  | { type: 'plan_created'; mode: PlanMode; timestamp: Date }
  | { type: 'import_done'; recipeId: string; timestamp: Date }
  | { type: 'pantry_saved'; ingredientCount: number; timestamp: Date }
  | { type: 'recipe_liked'; recipeId: string; timestamp: Date }
  | { type: 'social_share'; badgeId?: string; timestamp: Date };

export type UserStats = {
  totalCookedCount: number;
  totalPlansCreated: number;
  totalImported: number;
  totalSavedIngredients: number;
  lastCookedDate?: Date;
  currentStreak: number;
  longestStreak: number;
  unlockedBadges: string[];
  likedRecipes: string[];
};

export const calculateStreak = (events: GameEvent[]): { current: number; longest: number; lastDate?: Date } => {
  const cookedEvents = events.filter((e) => e.type === 'cooked').sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

  if (cookedEvents.length === 0) {
    return { current: 0, longest: 0 };
  }

  let current = 1;
  let longest = 1;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let lastDate = new Date(cookedEvents[0].timestamp);
  lastDate.setHours(0, 0, 0, 0);

  // Check if streak is still active (cooked today or yesterday)
  const daysDiff = Math.floor((today.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
  if (daysDiff > 1) {
    current = 0; // Streak broken
  }

  for (let i = 1; i < cookedEvents.length; i++) {
    const prevDate = new Date(cookedEvents[i].timestamp);
    prevDate.setHours(0, 0, 0, 0);

    const diff = Math.floor((lastDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));

    if (diff === 1) {
      current += 1;
      longest = Math.max(longest, current);
      lastDate = prevDate;
    } else if (diff > 1) {
      lastDate = prevDate;
    }
  }

  return {
    current: current,
    longest,
    lastDate: new Date(cookedEvents[0].timestamp),
  };
};

export const calculateStats = (events: GameEvent[]): UserStats => {
  const stats: UserStats = {
    totalCookedCount: events.filter((e) => e.type === 'cooked').length,
    totalPlansCreated: events.filter((e) => e.type === 'plan_created').length,
    totalImported: events.filter((e) => e.type === 'import_done').length,
    totalSavedIngredients: events.reduce((sum, e) => (e.type === 'pantry_saved' ? sum + e.ingredientCount : sum), 0),
    lastCookedDate: events.find((e) => e.type === 'cooked')?.timestamp,
    currentStreak: 0,
    longestStreak: 0,
    unlockedBadges: [],
    likedRecipes: events.filter((e) => e.type === 'recipe_liked').map((e) => (e as any).recipeId),
  };

  const streak = calculateStreak(events);
  stats.currentStreak = streak.current;
  stats.longestStreak = streak.longest;

  return stats;
};
