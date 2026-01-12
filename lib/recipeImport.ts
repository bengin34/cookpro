import { Recipe, RecipeIngredient } from '@/lib/types';

export type RecipeImportStatus = 'success' | 'needs_manual' | 'error';

export type RecipeImportResult = {
  status: RecipeImportStatus;
  message?: string;
  recipe?: Recipe;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const parseDurationMinutes = (value?: string) => {
  if (!value) {
    return undefined;
  }

  const match = value.match(/PT(?:(\d+)H)?(?:(\d+)M)?/i);
  if (!match) {
    return undefined;
  }

  const hours = Number(match[1] ?? 0);
  const minutes = Number(match[2] ?? 0);
  const total = hours * 60 + minutes;
  return Number.isFinite(total) && total > 0 ? total : undefined;
};

const parseYield = (value?: string | number) => {
  if (typeof value === 'number') {
    return value;
  }

  if (!value) {
    return undefined;
  }

  const match = String(value).match(/\d+/);
  return match ? Number(match[0]) : undefined;
};

const normalizeInstructions = (value: unknown): string[] => {
  if (!value) {
    return [];
  }

  if (typeof value === 'string') {
    const lines = value
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    return lines.length > 0 ? lines : [value.trim()];
  }

  if (Array.isArray(value)) {
    return value
      .map((entry) => {
        if (typeof entry === 'string') {
          return entry.trim();
        }
        if (entry && typeof entry === 'object') {
          const obj = entry as Record<string, unknown>;
          // Handle {"text": "..."} format
          if (obj.text && typeof obj.text === 'string') {
            return obj.text.trim();
          }
          // Handle {"itemListElement": [...]} HowToSection format
          if (obj.itemListElement && Array.isArray(obj.itemListElement)) {
            return normalizeInstructions(obj.itemListElement).join(' ');
          }
          // Handle {"name": "..."} format (HowToStep)
          if (obj.name && typeof obj.name === 'string') {
            return obj.name.trim();
          }
          // Handle nested "description" field
          if (obj.description && typeof obj.description === 'string') {
            return obj.description.trim();
          }
        }
        return '';
      })
      .filter(Boolean);
  }

  return [];
};

const normalizeIngredients = (value: unknown): RecipeIngredient[] => {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          return { name: item.trim() };
        }
        if (item && typeof item === 'object') {
          const obj = item as Record<string, unknown>;
          // Handle {"text": "..."} format
          if (obj.text && typeof obj.text === 'string') {
            return { name: obj.text.trim() };
          }
          // Handle {"name": "..."} format
          if (obj.name && typeof obj.name === 'string') {
            return { name: obj.name.trim() };
          }
          // Handle nested ingredient format with quantity/unit
          if (obj.ingredient && typeof obj.ingredient === 'string') {
            return { name: obj.ingredient.trim() };
          }
        }
        return null;
      })
      .filter((item): item is RecipeIngredient => item !== null);
  }

  if (typeof value === 'string') {
    const lines = value
      .split(/\n+/)
      .map((line) => line.trim())
      .filter(Boolean);
    return lines.map((name) => ({ name }));
  }

  return [];
};

const findRecipeInJsonLd = (raw: unknown): Record<string, unknown> | undefined => {
  if (!raw) {
    return undefined;
  }

  if (Array.isArray(raw)) {
    for (const entry of raw) {
      const found = findRecipeInJsonLd(entry);
      if (found) {
        return found;
      }
    }
    return undefined;
  }

  if (typeof raw === 'object') {
    const obj = raw as Record<string, unknown>;
    if (obj['@graph']) {
      return findRecipeInJsonLd(obj['@graph']);
    }
    const typeValue = obj['@type'];
    const types = Array.isArray(typeValue) ? typeValue : [typeValue];
    if (types.some((type) => String(type).toLowerCase() === 'recipe')) {
      return obj;
    }
  }

  return undefined;
};

const parseRecipeFromJsonLd = (jsonLd: Record<string, unknown>): Recipe | undefined => {
  const title =
    (jsonLd.name as string | undefined) ??
    (jsonLd.headline as string | undefined) ??
    'Imported Recipe';

  // Try multiple field names for ingredients (some sites use different formats)
  const ingredientsData =
    jsonLd.recipeIngredient ??
    jsonLd.ingredients ??
    (jsonLd.Ingredient as unknown);

  const ingredients = normalizeIngredients(ingredientsData);

  // Try multiple field names for instructions
  const instructionsData =
    jsonLd.recipeInstructions ??
    jsonLd.instructions ??
    (jsonLd.Steps as unknown);

  const instructions = normalizeInstructions(instructionsData);

  const totalTimeMinutes =
    parseDurationMinutes(jsonLd.totalTime as string | undefined) ??
    parseDurationMinutes(jsonLd.cookTime as string | undefined) ??
    parseDurationMinutes(jsonLd.prepTime as string | undefined) ??
    parseDurationMinutes(jsonLd.duration as string | undefined);

  const servings =
    parseYield(jsonLd.recipeYield as string | number | undefined) ??
    parseYield(jsonLd.servings as string | number | undefined) ??
    parseYield(jsonLd.yields as string | number | undefined);

  return {
    id: `import-${Date.now()}`,
    title,
    totalTimeMinutes,
    servings,
    ingredients,
    instructions,
    tags: ['imported'],
  };
};

const safeTitleFromUrl = (url: URL) => {
  const host = url.hostname.replace('www.', '');
  const slug = url.pathname.split('/').filter(Boolean).pop();
  if (slug) {
    return slug
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
  return `Imported from ${host}`;
};

const parseYemekComRecipe = (html: string): Recipe | undefined => {
  // yemek.com uses JSON-LD schema but may need fallback
  // Try to extract JSON-LD first, then fallback to HTML parsing

  try {
    // Try to find JSON-LD schema
    const schemaMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/);
    if (schemaMatch && schemaMatch[1]) {
      const schema = JSON.parse(schemaMatch[1]);

      // Extract title
      const title = schema.name || schema.headline;
      if (!title) return undefined;

      // Extract ingredients - handle both simple arrays and nested structures
      let ingredients: RecipeIngredient[] = [];
      if (schema.recipeIngredient) {
        const ingredientData = schema.recipeIngredient;

        // Flatten nested arrays (yemek.com uses nested arrays)
        const flattenedIngredients = Array.isArray(ingredientData)
          ? ingredientData.flat()
          : ingredientData;

        // Handle if it's a simple array of strings
        if (Array.isArray(flattenedIngredients)) {
          ingredients = flattenedIngredients
            .map((item) => {
              if (typeof item === 'string') {
                return { name: item.trim() };
              }
              if (item && typeof item === 'object' && item.text) {
                return { name: item.text.trim() };
              }
              return null;
            })
            .filter((item): item is RecipeIngredient => item !== null);
        }
      }

      // Extract instructions - handle nested arrays
      let instructions: string[] = [];
      if (schema.recipeInstructions) {
        const instructionsData = schema.recipeInstructions;

        // Flatten nested arrays (yemek.com uses nested arrays)
        const flattenedInstructions = Array.isArray(instructionsData)
          ? instructionsData.flat()
          : instructionsData;

        if (Array.isArray(flattenedInstructions)) {
          instructions = flattenedInstructions
            .map((item) => {
              if (typeof item === 'string') {
                return item.trim().replace(/<[^>]*>/g, ''); // Remove HTML tags
              }
              if (item && typeof item === 'object') {
                if (item.text) {
                  return item.text.trim().replace(/<[^>]*>/g, '');
                }
                if (item.description) {
                  return item.description.trim().replace(/<[^>]*>/g, '');
                }
                if (item.name) {
                  return item.name.trim().replace(/<[^>]*>/g, '');
                }
              }
              return null;
            })
            .filter((item): item is string => item !== null && item.length > 0);
        }
      }

      // Extract time
      let totalTimeMinutes: number | undefined;
      if (schema.totalTime) {
        totalTimeMinutes = parseDurationMinutes(schema.totalTime);
      } else if (schema.cookTime && schema.prepTime) {
        const cookTime = parseDurationMinutes(schema.cookTime) || 0;
        const prepTime = parseDurationMinutes(schema.prepTime) || 0;
        totalTimeMinutes = cookTime + prepTime || undefined;
      }

      // Extract servings
      let servings: number | undefined;
      if (schema.recipeYield) {
        servings = parseYield(schema.recipeYield);
      }

      if (ingredients.length > 0 || instructions.length > 0) {
        return {
          id: `import-${Date.now()}`,
          title,
          totalTimeMinutes,
          servings,
          ingredients,
          instructions,
          tags: ['imported'],
        };
      }
    }
  } catch (error) {
    console.log('[Recipe Import] yemek.com schema parse error:', error);
  }

  return undefined;
};

const parseNefisYemekleriRecipe = (html: string): Recipe | undefined => {
  try {
    // Try to find JSON-LD schema first
    const schemaMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/);
    if (schemaMatch && schemaMatch[1]) {
      const schema = JSON.parse(schemaMatch[1]);

      const title = schema.name || schema.headline;
      if (!title) return undefined;

      // Extract ingredients
      let ingredients: RecipeIngredient[] = [];
      if (schema.recipeIngredient) {
        const ingredientData = schema.recipeIngredient;
        const flattenedIngredients = Array.isArray(ingredientData)
          ? ingredientData.flat()
          : ingredientData;

        if (Array.isArray(flattenedIngredients)) {
          ingredients = flattenedIngredients
            .map((item) => {
              if (typeof item === 'string') {
                return { name: item.trim() };
              }
              if (item && typeof item === 'object') {
                if (item.text) {
                  return { name: item.text.trim() };
                }
                if (item.name) {
                  return { name: item.name.trim() };
                }
              }
              return null;
            })
            .filter((item): item is RecipeIngredient => item !== null);
        }
      }

      // Extract instructions
      let instructions: string[] = [];
      if (schema.recipeInstructions) {
        const instructionsData = schema.recipeInstructions;
        const flattenedInstructions = Array.isArray(instructionsData)
          ? instructionsData.flat()
          : instructionsData;

        if (Array.isArray(flattenedInstructions)) {
          instructions = flattenedInstructions
            .map((item) => {
              if (typeof item === 'string') {
                return item.trim().replace(/<[^>]*>/g, '');
              }
              if (item && typeof item === 'object') {
                if (item.text) {
                  return item.text.trim().replace(/<[^>]*>/g, '');
                }
                if (item.name) {
                  return item.name.trim().replace(/<[^>]*>/g, '');
                }
              }
              return null;
            })
            .filter((item): item is string => item !== null && item.length > 0);
        }
      }

      // Extract time
      let totalTimeMinutes: number | undefined;
      if (schema.totalTime) {
        totalTimeMinutes = parseDurationMinutes(schema.totalTime);
      } else if (schema.cookTime && schema.prepTime) {
        const cookTime = parseDurationMinutes(schema.cookTime) || 0;
        const prepTime = parseDurationMinutes(schema.prepTime) || 0;
        totalTimeMinutes = cookTime + prepTime || undefined;
      }

      // Extract servings
      let servings: number | undefined;
      if (schema.recipeYield) {
        servings = parseYield(schema.recipeYield);
      }

      if (ingredients.length > 0 || instructions.length > 0) {
        return {
          id: `import-${Date.now()}`,
          title,
          totalTimeMinutes,
          servings,
          ingredients,
          instructions,
          tags: ['imported', 'nefisyemekleri'],
        };
      }
    }
  } catch (error) {
    console.log('[Recipe Import] nefisyemekleri.com parse error:', error);
  }

  return undefined;
};

const parseAllRecipesTypeRecipe = (html: string): Recipe | undefined => {
  try {
    // AllRecipes and similar sites often have schema.org markup
    const schemaMatch = html.match(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/);
    if (schemaMatch && schemaMatch[1]) {
      const schema = JSON.parse(schemaMatch[1]);

      const title = schema.name || schema.headline;
      if (!title) return undefined;

      const ingredients = normalizeIngredients(schema.recipeIngredient || schema.ingredients);
      const instructions = normalizeInstructions(schema.recipeInstructions || schema.instructions);

      const totalTimeMinutes =
        parseDurationMinutes(schema.totalTime as string | undefined) ??
        parseDurationMinutes(schema.cookTime as string | undefined) ??
        parseDurationMinutes(schema.prepTime as string | undefined);

      const servings =
        parseYield(schema.recipeYield as string | number | undefined) ??
        parseYield(schema.servings as string | number | undefined);

      if (ingredients.length > 0 || instructions.length > 0) {
        return {
          id: `import-${Date.now()}`,
          title,
          totalTimeMinutes,
          servings,
          ingredients,
          instructions,
          tags: ['imported'],
        };
      }
    }
  } catch (error) {
    console.log('[Recipe Import] allrecipes-type parse error:', error);
  }

  return undefined;
};

const buildPlaceholderRecipe = (url: URL): Recipe => {
  const ingredients: RecipeIngredient[] = [
    { name: 'tomato', quantity: '2', unit: 'pc' },
    { name: 'onion', quantity: '1', unit: 'pc' },
    { name: 'olive oil', quantity: '1', unit: 'tbsp' },
    { name: 'salt', quantity: '1', unit: 'tsp' },
  ];

  return {
    id: `import-${Date.now()}`,
    title: safeTitleFromUrl(url),
    totalTimeMinutes: 25,
    servings: 2,
    ingredients,
    instructions: [
      'Malzemeleri hazirla.',
      'Sogan ve zeytinyagini tavada cevir.',
      'Domatesleri ekle ve 10 dk pisir.',
      'Tuz ekleyip servis et.',
    ],
    tags: ['imported'],
  };
};

export const parseRecipeFromUrl = async (rawUrl: string): Promise<RecipeImportResult> => {
  await delay(400);

  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch (error) {
    return {
      status: 'error',
      message: 'Gecerli bir URL girin (https://...)',
    };
  }

  const host = parsed.hostname.toLowerCase();
  if (host.includes('instagram') || host.includes('tiktok') || host.includes('youtube')) {
    return {
      status: 'needs_manual',
      message: 'Video/sosyal kaynaklar icin manuel duzenleme gerekir.',
      recipe: buildPlaceholderRecipe(parsed),
    };
  }

  try {
    const response = await fetch(rawUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0',
        Accept: 'text/html,application/xhtml+xml',
      },
    });

    if (!response.ok) {
      return {
        status: 'error',
        message: 'Tarif cekilemedi. Site erisimi engelliyor olabilir.',
      };
    }

    const html = await response.text();

    // Try site-specific parsers first
    if (host.includes('yemek.com')) {
      const yemekRecipe = parseYemekComRecipe(html);
      if (yemekRecipe && yemekRecipe.ingredients.length > 0) {
        const needsManual =
          yemekRecipe.ingredients.length === 0 || yemekRecipe.instructions.length === 0;

        console.log('[Recipe Import] yemek.com recipe found:', {
          title: yemekRecipe.title,
          ingredientCount: yemekRecipe.ingredients.length,
          instructionCount: yemekRecipe.instructions.length,
          needsManual,
        });

        return {
          status: needsManual ? 'needs_manual' : 'success',
          message: needsManual
            ? `Tarif bulundu ama manuel duzenleme gerekir. (${yemekRecipe.ingredients.length} malzeme, ${yemekRecipe.instructions.length} adim)`
            : `Tarif alindi. (${yemekRecipe.ingredients.length} malzeme, ${yemekRecipe.instructions.length} adim)`,
          recipe: yemekRecipe,
        };
      }
    }

    if (host.includes('nefisyemekterifleri.com')) {
      const nefisRecipe = parseNefisYemekleriRecipe(html);
      if (nefisRecipe && nefisRecipe.ingredients.length > 0) {
        const needsManual =
          nefisRecipe.ingredients.length === 0 || nefisRecipe.instructions.length === 0;

        console.log('[Recipe Import] nefisyemekleri.com recipe found:', {
          title: nefisRecipe.title,
          ingredientCount: nefisRecipe.ingredients.length,
          instructionCount: nefisRecipe.instructions.length,
          needsManual,
        });

        return {
          status: needsManual ? 'needs_manual' : 'success',
          message: needsManual
            ? `Tarif bulundu ama manuel duzenleme gerekir. (${nefisRecipe.ingredients.length} malzeme, ${nefisRecipe.instructions.length} adim)`
            : `Tarif alindi. (${nefisRecipe.ingredients.length} malzeme, ${nefisRecipe.instructions.length} adim)`,
          recipe: nefisRecipe,
        };
      }
    }

    // Fallback to generic schema.org parser
    const genericRecipe = parseAllRecipesTypeRecipe(html);
    if (genericRecipe && (genericRecipe.ingredients.length > 0 || genericRecipe.instructions.length > 0)) {
      const needsManual =
        genericRecipe.ingredients.length === 0 || genericRecipe.instructions.length === 0;

      console.log('[Recipe Import] Generic recipe found:', {
        title: genericRecipe.title,
        ingredientCount: genericRecipe.ingredients.length,
        instructionCount: genericRecipe.instructions.length,
        needsManual,
      });

      return {
        status: needsManual ? 'needs_manual' : 'success',
        message: needsManual
          ? `Tarif bulundu ama manuel duzenleme gerekir. (${genericRecipe.ingredients.length} malzeme, ${genericRecipe.instructions.length} adim)`
          : `Tarif alindi. (${genericRecipe.ingredients.length} malzeme, ${genericRecipe.instructions.length} adim)`,
        recipe: genericRecipe,
      };
    }

    // Original schema.org iteration as final fallback
    const scripts = Array.from(
      html.matchAll(/<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)
    );

    for (const match of scripts) {
      const rawJson = match[1]?.trim();
      if (!rawJson) {
        continue;
      }
      try {
        const json = JSON.parse(rawJson);
        const recipeJson = findRecipeInJsonLd(json);
        if (recipeJson) {
          const parsedRecipe = parseRecipeFromJsonLd(recipeJson);
          if (!parsedRecipe) {
            continue;
          }
          const needsManual =
            parsedRecipe.ingredients.length === 0 || parsedRecipe.instructions.length === 0;

          // Log details for debugging
          console.log('[Recipe Import] Found recipe:', {
            title: parsedRecipe.title,
            ingredientCount: parsedRecipe.ingredients.length,
            instructionCount: parsedRecipe.instructions.length,
            servings: parsedRecipe.servings,
            time: parsedRecipe.totalTimeMinutes,
            needsManual,
          });

          return {
            status: needsManual ? 'needs_manual' : 'success',
            message: needsManual
              ? `Tarif bulundu ama manuel duzenleme gerekir. (${parsedRecipe.ingredients.length} malzeme, ${parsedRecipe.instructions.length} adim)`
              : `Tarif alindi. (${parsedRecipe.ingredients.length} malzeme, ${parsedRecipe.instructions.length} adim)`,
            recipe: parsedRecipe,
          };
        }
      } catch (error) {
        console.log('[Recipe Import] JSON parse error:', error);
        continue;
      }
    }
  } catch (error) {
    return {
      status: 'error',
      message: 'Tarif cekilemedi. URL erisimi engellendi.',
    };
  }

  return {
    status: 'needs_manual',
    message: 'Tarif yapisi bulunamadi. Manuel duzenleme gerekir.',
    recipe: buildPlaceholderRecipe(parsed),
  };
};
