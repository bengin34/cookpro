import { UserStats } from '@/lib/gamification/events';

export type Badge = {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji
  tier?: 'bronze' | 'silver' | 'gold';
  unlockedAt?: Date;
};

export const badges: Record<string, Omit<Badge, 'unlockedAt'>> = {
  first_save: {
    id: 'first_save',
    name: 'İlk Kurtarış',
    description: 'İlk malzemeyi kurtarın',
    icon: '🌱',
  },
  week_streak: {
    id: 'week_streak',
    name: '1 Hafta Kuralı',
    description: 'Ard arda 7 gün pişirin',
    icon: '🔥',
    tier: 'bronze',
  },
  month_streak: {
    id: 'month_streak',
    name: '1 Ay Fatihi',
    description: 'Ard arda 30 gün pişirin',
    icon: '🔥🔥',
    tier: 'silver',
  },
  planner_master: {
    id: 'planner_master',
    name: 'Planlama Ustası',
    description: '5+ plan oluşturun',
    icon: '📋',
  },
  importer: {
    id: 'importer',
    name: 'İthalatçı',
    description: '3+ tarif import edin',
    icon: '📥',
  },
  waste_warrior: {
    id: 'waste_warrior',
    name: 'İsraf Savaşçısı',
    description: '30+ malzeme kurtarın',
    icon: '♻️',
    tier: 'gold',
  },
  social_butterfly: {
    id: 'social_butterfly',
    name: 'Sosyal Kelebek',
    description: '5+ başarı paylaşın',
    icon: '🦋',
  },
  quick_cook: {
    id: 'quick_cook',
    name: 'Hızlı Şef',
    description: '10+ tarif 30 dakikada pişirin',
    icon: '⚡',
  },
};

export const checkBadges = (stats: UserStats, previousBadges: string[]): string[] => {
  const newBadges = [...previousBadges];
  const conditions: Record<string, () => boolean> = {
    first_save: () => stats.totalSavedIngredients >= 1 && !previousBadges.includes('first_save'),
    week_streak: () => stats.currentStreak >= 7 && !previousBadges.includes('week_streak'),
    month_streak: () => stats.currentStreak >= 30 && !previousBadges.includes('month_streak'),
    planner_master: () => stats.totalPlansCreated >= 5 && !previousBadges.includes('planner_master'),
    importer: () => stats.totalImported >= 3 && !previousBadges.includes('importer'),
    waste_warrior: () => stats.totalSavedIngredients >= 30 && !previousBadges.includes('waste_warrior'),
    social_butterfly: () => stats.totalSavedIngredients >= 5 && !previousBadges.includes('social_butterfly'), // placeholder
    quick_cook: () => stats.totalCookedCount >= 10 && !previousBadges.includes('quick_cook'), // placeholder
  };

  Object.entries(conditions).forEach(([badgeId, condition]) => {
    if (condition() && !newBadges.includes(badgeId)) {
      newBadges.push(badgeId);
    }
  });

  return newBadges;
};

export const getBadgesByIds = (ids: string[]): Badge[] => {
  return ids
    .map((id) => badges[id])
    .filter((badge): badge is Badge => Boolean(badge))
    .map((badge) => ({ ...badge, unlockedAt: new Date() }));
};
