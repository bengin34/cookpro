/**
 * A/B Testing Configuration for Monetization
 * Different paywall strategies tested against control group
 */

import { SubscriptionTier } from '@/lib/paywall/limits';

export type ABVariant = {
  id: string;
  name: string;
  description: string;
  weight: number; // 0-1, percentage of users in this variant
  paywallTrigger?: {
    type: 'recipe_count' | 'plan_count' | 'days_active' | 'none';
    threshold?: number;
  };
  features?: {
    softPaywall?: boolean; // Limited features instead of hard block
    showPricing?: boolean; // Show pricing upfront
    delayDays?: number; // Days before showing paywall
  };
};

/**
 * A/B Test Variants
 *
 * Variant A (Control): Hard paywall on 11th recipe import
 * Variant B: Hard paywall on 5th day of using planner
 * Variant C: Soft paywall - features gradually limited
 * Variant D: No paywall initially, pricing shown in settings
 */
export const testVariants: Record<string, ABVariant> = {
  // Control group - classic hard paywall
  paywall_recipe_hard: {
    id: 'paywall_recipe_hard',
    name: 'Hard Paywall (Recipe)',
    description: 'Shows paywall after user imports 10 recipes',
    weight: 0.25,
    paywallTrigger: {
      type: 'recipe_count',
      threshold: 10,
    },
    features: {
      softPaywall: false,
      showPricing: true,
    },
  },

  // Second variant - paywall based on planner usage
  paywall_planner_hard: {
    id: 'paywall_planner_hard',
    name: 'Hard Paywall (Planner)',
    description: 'Shows paywall after 5 days of creating plans',
    weight: 0.25,
    paywallTrigger: {
      type: 'days_active',
      threshold: 5,
    },
    features: {
      softPaywall: false,
      showPricing: true,
      delayDays: 5,
    },
  },

  // Third variant - soft paywall
  paywall_soft: {
    id: 'paywall_soft',
    name: 'Soft Paywall',
    description: 'Gradually limits features instead of hard block',
    weight: 0.25,
    paywallTrigger: {
      type: 'recipe_count',
      threshold: 10,
    },
    features: {
      softPaywall: true,
      showPricing: true,
    },
  },

  // Fourth variant - no paywall, settings-based
  no_paywall_settings: {
    id: 'no_paywall_settings',
    name: 'No Paywall',
    description: 'Pricing only shown in settings tab',
    weight: 0.25,
    paywallTrigger: {
      type: 'none',
    },
    features: {
      softPaywall: false,
      showPricing: false,
    },
  },
};

/**
 * Assign user to A/B variant based on user ID (deterministic)
 */
export const assignVariant = (userId: string): ABVariant => {
  // Simple hash function to consistently assign users
  let hash = 0;
  for (let i = 0; i < userId.length; i++) {
    const char = userId.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash; // Convert to 32bit integer
  }

  const randomValue = Math.abs(hash % 100) / 100;
  let cumulative = 0;

  for (const variant of Object.values(testVariants)) {
    cumulative += variant.weight;
    if (randomValue < cumulative) {
      return variant;
    }
  }

  return Object.values(testVariants)[0];
};

/**
 * Analytics event types for A/B testing
 */
export type ABTestEvent =
  | {
      type: 'variant_assigned';
      userId: string;
      variantId: string;
    }
  | {
      type: 'paywall_shown';
      userId: string;
      variantId: string;
      trigger: string;
    }
  | {
      type: 'paywall_dismissed';
      userId: string;
      variantId: string;
    }
  | {
      type: 'premium_converted';
      userId: string;
      variantId: string;
      price: number;
    };

/**
 * Convert tier to paywall state
 */
export const shouldShowPaywall = (variant: ABVariant, userStats: {
  importedRecipesCount: number;
  daysActive: number;
  plansCreated: number;
}): boolean => {
  if (!variant.paywallTrigger || variant.paywallTrigger.type === 'none') {
    return false;
  }

  const trigger = variant.paywallTrigger;

  switch (trigger.type) {
    case 'recipe_count':
      return userStats.importedRecipesCount >= (trigger.threshold || 10);
    case 'plan_count':
      return userStats.plansCreated >= (trigger.threshold || 5);
    case 'days_active':
      return userStats.daysActive >= (trigger.threshold || 5);
    default:
      return false;
  }
};
