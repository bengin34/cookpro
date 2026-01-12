/**
 * Recipe sync engine
 * Periodically fetches recipes from multiple sources and deduplicates them
 */

import { Recipe } from '@/lib/types';
import { mergeDuplicates } from '@/lib/data/recipeDedup';
import { getRecipeSourceRegistry, IRecipeSource } from './adapter';

export type SyncJob = {
  sourceId: string;
  query: string;
  limit?: number;
  lastSync?: Date;
};

export type SyncResult = {
  source: string;
  query: string;
  recipesAdded: number;
  recipesDeduped: number;
  error?: string;
  timestamp: Date;
};

/**
 * Recipe sync configuration
 */
export type SyncConfig = {
  autoSyncInterval?: number; // milliseconds, default 1 day
  maxRecipesPerSource?: number; // default 50
  enableDeduplication?: boolean; // default true
};

/**
 * Recipe sync manager
 */
export class RecipeSyncManager {
  private config: SyncConfig;
  private syncTimer: NodeJS.Timeout | null = null;
  private lastSyncTime = 0;
  private lastSyncResults: SyncResult[] = [];

  constructor(config: SyncConfig = {}) {
    this.config = {
      autoSyncInterval: 24 * 60 * 60 * 1000, // 1 day
      maxRecipesPerSource: 50,
      enableDeduplication: true,
      ...config,
    };
  }

  /**
   * Execute sync jobs
   */
  async syncRecipes(jobs: SyncJob[], existingRecipes: Recipe[]): Promise<Recipe[]> {
    const results: SyncResult[] = [];
    let allRecipes = [...existingRecipes];

    for (const job of jobs) {
      try {
        const source = getRecipeSourceRegistry().getSource(job.sourceId);
        if (!source) {
          throw new Error(`Source ${job.sourceId} not found`);
        }

        const isAvailable = await source.isAvailable();
        if (!isAvailable) {
          throw new Error(`Source ${job.sourceId} is not available`);
        }

        const limit = job.limit || this.config.maxRecipesPerSource;
        const recipes = await source.search(job.query, limit);

        // Merge with existing recipes
        allRecipes = [...allRecipes, ...recipes];

        results.push({
          source: job.sourceId,
          query: job.query,
          recipesAdded: recipes.length,
          recipesDeduped: 0,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error(`Sync error for job ${job.sourceId}:`, error);
        results.push({
          source: job.sourceId,
          query: job.query,
          recipesAdded: 0,
          recipesDeduped: 0,
          error: String(error),
          timestamp: new Date(),
        });
      }
    }

    // Deduplicate if enabled
    if (this.config.enableDeduplication) {
      const before = allRecipes.length;
      allRecipes = mergeDuplicates(allRecipes);
      const after = allRecipes.length;
      const deduped = before - after;

      results.forEach((r) => {
        if (deduped > 0) {
          r.recipesDeduped = Math.floor((deduped / before) * r.recipesAdded);
        }
      });
    }

    this.lastSyncTime = Date.now();
    this.lastSyncResults = results;

    return allRecipes;
  }

  /**
   * Start auto-sync (runs periodically in background)
   * Note: In React Native, this should be paired with AsyncStorage persistence
   */
  startAutoSync(jobs: SyncJob[], onSync: (recipes: Recipe[]) => void, existingRecipes: Recipe[]): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
    }

    // Initial sync
    this.syncRecipes(jobs, existingRecipes).then(onSync).catch(console.error);

    // Periodic sync
    this.syncTimer = setInterval(() => {
      this.syncRecipes(jobs, existingRecipes).then(onSync).catch(console.error);
    }, this.config.autoSyncInterval);
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync(): void {
    if (this.syncTimer) {
      clearInterval(this.syncTimer);
      this.syncTimer = null;
    }
  }

  /**
   * Get last sync results
   */
  getLastSyncResults(): SyncResult[] {
    return this.lastSyncResults;
  }

  /**
   * Get time since last sync in seconds
   */
  getSecondsSinceLastSync(): number {
    if (!this.lastSyncTime) return Infinity;
    return Math.floor((Date.now() - this.lastSyncTime) / 1000);
  }

  /**
   * Check if sync is needed (based on last sync time and configured interval)
   */
  isSyncNeeded(): boolean {
    const secondsSince = this.getSecondsSinceLastSync();
    const intervalSeconds = (this.config.autoSyncInterval || 86400000) / 1000;
    return secondsSince > intervalSeconds;
  }
}

/**
 * Default sync jobs - can be customized
 */
export const getDefaultSyncJobs = (): SyncJob[] => {
  return [
    { sourceId: 'spoonacular', query: 'quick meals', limit: 15 },
    { sourceId: 'spoonacular', query: 'vegetarian', limit: 15 },
    { sourceId: 'spoonacular', query: 'easy', limit: 10 },
  ];
};

// Global instance
let globalSyncManager: RecipeSyncManager | null = null;

export const getRecipeSyncManager = (config?: SyncConfig): RecipeSyncManager => {
  if (!globalSyncManager) {
    globalSyncManager = new RecipeSyncManager(config);
  }
  return globalSyncManager;
};
