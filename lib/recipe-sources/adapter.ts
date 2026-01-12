/**
 * Recipe source adapter pattern
 * Allows integration of multiple recipe APIs with unified interface
 */

import { Recipe } from '@/lib/types';

export type RecipeSourceConfig = {
  name: string;
  baseUrl: string;
  apiKey?: string;
  rateLimit?: {
    perMinute: number;
  };
};

export interface IRecipeSource {
  config: RecipeSourceConfig;
  search(query: string, limit?: number): Promise<Recipe[]>;
  fetchById(id: string): Promise<Recipe | null>;
  isAvailable(): Promise<boolean>;
}

/**
 * Base adapter class for recipe sources
 */
export abstract class RecipeSourceAdapter implements IRecipeSource {
  config: RecipeSourceConfig;
  protected lastRequestTime = 0;

  constructor(config: RecipeSourceConfig) {
    this.config = config;
  }

  abstract search(query: string, limit?: number): Promise<Recipe[]>;
  abstract fetchById(id: string): Promise<Recipe | null>;
  abstract isAvailable(): Promise<boolean>;

  /**
   * Rate limit helper - ensures we don't exceed API limits
   */
  protected async rateLimitWait(): Promise<void> {
    if (!this.config.rateLimit) return;

    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    const minIntervalMs = (60000 / this.config.rateLimit.perMinute) * 1.2; // 20% buffer

    if (timeSinceLastRequest < minIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, minIntervalMs - timeSinceLastRequest));
    }

    this.lastRequestTime = Date.now();
  }

  /**
   * Normalize recipe from source-specific format to common format
   */
  protected normalizeRecipe(sourceRecipe: any): Recipe {
    return {
      id: sourceRecipe.id || `${this.config.name}-${Math.random()}`,
      title: sourceRecipe.title || sourceRecipe.name || 'Unknown',
      totalTimeMinutes: sourceRecipe.cookTime || sourceRecipe.totalTimeMinutes,
      servings: sourceRecipe.servings,
      ingredients: (sourceRecipe.ingredients || []).map((ing: any) => ({
        name: typeof ing === 'string' ? ing : ing.name,
        quantity: ing.quantity || ing.amount,
        unit: ing.unit || undefined,
        optional: ing.optional || false,
      })),
      instructions: (sourceRecipe.instructions || []).map((instr: any) =>
        typeof instr === 'string' ? instr : instr.text || instr.step || '',
      ),
      tags: sourceRecipe.tags || sourceRecipe.cuisine ? [sourceRecipe.cuisine] : [],
      sourceUrl: sourceRecipe.sourceUrl || sourceRecipe.url,
    };
  }
}

/**
 * Local JSON recipes adapter
 * For offline/bundled recipes
 */
export class LocalRecipesAdapter extends RecipeSourceAdapter {
  private recipes: Recipe[];

  constructor(recipes: Recipe[]) {
    super({
      name: 'local',
      baseUrl: 'local',
    });
    this.recipes = recipes;
  }

  async search(query: string, limit = 10): Promise<Recipe[]> {
    const normalized = query.toLowerCase();
    return this.recipes
      .filter(
        (r) =>
          r.title.toLowerCase().includes(normalized) ||
          r.tags?.some((t) => t.toLowerCase().includes(normalized)) ||
          r.ingredients?.some((i) => i.name.toLowerCase().includes(normalized)),
      )
      .slice(0, limit);
  }

  async fetchById(id: string): Promise<Recipe | null> {
    return this.recipes.find((r) => r.id === id) || null;
  }

  async isAvailable(): Promise<boolean> {
    return true;
  }
}

/**
 * Registry of available recipe sources
 */
export class RecipeSourceRegistry {
  private sources: Map<string, IRecipeSource> = new Map();

  register(source: IRecipeSource): void {
    this.sources.set(source.config.name, source);
  }

  getSource(name: string): IRecipeSource | undefined {
    return this.sources.get(name);
  }

  getAllSources(): IRecipeSource[] {
    return Array.from(this.sources.values());
  }

  /**
   * Search across multiple sources
   * Returns deduplicated results
   */
  async searchMultiple(query: string, limit = 10): Promise<Recipe[]> {
    const results: Recipe[] = [];
    const seen = new Set<string>();

    for (const source of this.getAllSources()) {
      try {
        const recipes = await source.search(query, limit);
        for (const recipe of recipes) {
          const key = `${recipe.title}-${recipe.totalTimeMinutes || ''}`.toLowerCase();
          if (!seen.has(key)) {
            results.push(recipe);
            seen.add(key);
            if (results.length >= limit) break;
          }
        }
      } catch (error) {
        console.warn(`Error searching ${source.config.name}:`, error);
      }

      if (results.length >= limit) break;
    }

    return results.slice(0, limit);
  }
}

// Global registry instance
let globalRegistry: RecipeSourceRegistry | null = null;

export const getRecipeSourceRegistry = (): RecipeSourceRegistry => {
  if (!globalRegistry) {
    globalRegistry = new RecipeSourceRegistry();
  }
  return globalRegistry;
};
