/**
 * Freemium model limits and feature gates
 * Defines what users can do on free vs premium tiers
 */

export type SubscriptionTier = 'free' | 'premium';

export type FeatureLimits = {
  importedRecipesMax: number;
  plansPerDayMax: number;
  pantryItemsMax: number;
  offlineSync: boolean;
  advancedFilters: boolean;
  shoppingListExport: boolean;
  weeklyAnalytics: boolean;
};

/**
 * Feature limits by subscription tier
 */
export const featureLimits: Record<SubscriptionTier, FeatureLimits> = {
  free: {
    importedRecipesMax: 10,
    plansPerDayMax: 1,
    pantryItemsMax: 50,
    offlineSync: false,
    advancedFilters: false,
    shoppingListExport: false,
    weeklyAnalytics: false,
  },
  premium: {
    importedRecipesMax: Infinity,
    plansPerDayMax: Infinity,
    pantryItemsMax: Infinity,
    offlineSync: true,
    advancedFilters: true,
    shoppingListExport: true,
    weeklyAnalytics: true,
  },
};

/**
 * Check if user has reached limit for a feature
 */
export const hasReachedLimit = (
  tier: SubscriptionTier,
  feature: keyof FeatureLimits,
  currentCount: number,
): boolean => {
  const limit = featureLimits[tier][feature];
  if (feature.endsWith('Max') && typeof limit === 'number') {
    return currentCount >= limit;
  }
  return false;
};

/**
 * Get remaining quota for a feature
 */
export const getRemainingQuota = (
  tier: SubscriptionTier,
  feature: keyof FeatureLimits,
  currentCount: number,
): number => {
  const limit = featureLimits[tier][feature];
  if (typeof limit === 'number') {
    return Math.max(0, limit - currentCount);
  }
  return Infinity;
};

/**
 * Pricing information
 */
export type PricingTier = {
  name: string;
  monthlyPrice: number;
  yearlyPrice: number;
  description: string;
  benefits: string[];
};

export const pricing: Record<SubscriptionTier, PricingTier> = {
  free: {
    name: 'Free',
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: 'Temel özellikler',
    benefits: [
      '10 tarif import',
      'Günde 1 plan',
      '50 malzeme',
    ],
  },
  premium: {
    name: 'Premium',
    monthlyPrice: 4.99,
    yearlyPrice: 39.99,
    description: 'Sınırsız özellikler',
    benefits: [
      'Sınırsız tarif import',
      'Sınırsız plan oluşturma',
      'Gelişmiş filtreler',
      'Offline erişim',
      'Haftalık analitikler',
    ],
  },
};
