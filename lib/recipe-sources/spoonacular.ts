/**
 * Spoonacular API Adapter
 * Free tier: 365 requests per day
 * Documentation: https://spoonacular.com/food-api
 */

import { Recipe } from '@/lib/types';
import { RecipeSourceAdapter, RecipeSourceConfig } from './adapter';

const SPOONACULAR_API_KEY = process.env.EXPO_PUBLIC_SPOONACULAR_KEY || '';
const SPOONACULAR_BASE_URL = 'https://api.spoonacular.com/recipes';

export class SpoonacularAdapter extends RecipeSourceAdapter {
  constructor(apiKey?: string) {
    const config: RecipeSourceConfig = {
      name: 'spoonacular',
      baseUrl: SPOONACULAR_BASE_URL,
      apiKey: apiKey || SPOONACULAR_API_KEY,
      rateLimit: {
        perMinute: 5, // Conservative rate limit for free tier
      },
    };
    super(config);
  }

  async isAvailable(): Promise<boolean> {
    if (!this.config.apiKey) {
      console.warn('Spoonacular API key not configured');
      return false;
    }

    try {
      const response = await fetch(`${this.config.baseUrl}/random?apiKey=${this.config.apiKey}&number=1`, {
        method: 'GET',
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  async search(query: string, limit = 10): Promise<Recipe[]> {
    if (!this.config.apiKey) {
      return [];
    }

    await this.rateLimitWait();

    try {
      const url = new URL(`${this.config.baseUrl}/complexSearch`);
      url.searchParams.append('apiKey', this.config.apiKey);
      url.searchParams.append('query', query);
      url.searchParams.append('number', Math.min(limit, 10).toString());
      url.searchParams.append('addRecipeInformation', 'true');
      url.searchParams.append('fillIngredients', 'true');

      const response = await fetch(url.toString());
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json() as { results?: any[] };
      return (data.results || [])
        .map((r: any) => this.normalizeSpoonacularRecipe(r))
        .slice(0, limit);
    } catch (error) {
      console.error('Spoonacular search error:', error);
      return [];
    }
  }

  async fetchById(id: string): Promise<Recipe | null> {
    if (!this.config.apiKey) {
      return null;
    }

    await this.rateLimitWait();

    try {
      const url = `${this.config.baseUrl}/${id}/information?apiKey=${this.config.apiKey}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`API error: ${response.status}`);

      const data = await response.json();
      return this.normalizeSpoonacularRecipe(data);
    } catch (error) {
      console.error('Spoonacular fetch error:', error);
      return null;
    }
  }

  /**
   * Normalize Spoonacular recipe format to our Recipe type
   */
  private normalizeSpoonacularRecipe(spoonacularRecipe: any): Recipe {
    const instructions = spoonacularRecipe.analyzedInstructions?.[0]?.steps || [];

    return {
      id: String(spoonacularRecipe.id),
      title: spoonacularRecipe.title || '',
      totalTimeMinutes: spoonacularRecipe.readyInMinutes,
      servings: spoonacularRecipe.servings,
      ingredients: (spoonacularRecipe.extendedIngredients || []).map((ing: any) => ({
        name: ing.name || ing.nameClean || '',
        quantity: ing.amount,
        unit: ing.unit,
        optional: false,
      })),
      instructions: instructions.map((step: any) => step.step || ''),
      tags: [
        ...(spoonacularRecipe.cuisines || []),
        ...(spoonacularRecipe.diets || []),
      ],
      allergens: spoonacularRecipe.allergies || [],
      sourceUrl: spoonacularRecipe.sourceUrl,
    };
  }
}

/**
 * Create a Spoonacular adapter instance
 */
export const createSpoonacularAdapter = (apiKey?: string): SpoonacularAdapter => {
  return new SpoonacularAdapter(apiKey);
};
