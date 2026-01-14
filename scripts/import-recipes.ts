import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';

// Supabase client
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Types
interface Ingredient {
  name: string;
  quantity?: number;
  unit?: string;
  category?: string;
  optional?: boolean;
}

interface Instruction {
  step: number;
  text: string;
}

interface Recipe {
  id: string;
  slug: string;
  title: string;
  description?: string;
  cuisine?: string;
  region?: string[];
  course?: string[];
  servings: number;
  prep_time_minutes?: number;
  cook_time_minutes?: number;
  total_time_minutes?: number;
  difficulty?: string;
  tags?: string[];
  image_source?: string | null;
  ingredients: Ingredient[];
  instructions: Instruction[];
}

interface IngredientTranslation {
  name: string;
  name_tr: string;
}

interface RecipeTranslation {
  recipe_id: string;
  locale: string;
  title: string;
  description?: string;
  ingredients_override?: IngredientTranslation[];
  instructions?: Instruction[];
}

async function importRecipes() {
  try {
    console.log('🚀 Starting recipe import...\n');

    // Read JSON files
    const recipesPath =
      process.env.RECIPES_PATH || path.join(__dirname, '../db/en.json');
    const translationsPath =
      process.env.TRANSLATIONS_PATH ||
      path.join(__dirname, '../data/recipe_translations.json');

    const recipesData = JSON.parse(fs.readFileSync(recipesPath, 'utf-8'));
    const translationsData = fs.existsSync(translationsPath)
      ? JSON.parse(fs.readFileSync(translationsPath, 'utf-8'))
      : null;

    const recipes: Recipe[] = recipesData.recipes;
    const translations: RecipeTranslation[] =
      translationsData?.recipe_translations || [];

    console.log(`📖 Found ${recipes.length} recipes`);
    console.log(`🌍 Found ${translations.length} translations\n`);

    // Import each recipe
    for (const recipe of recipes) {
      console.log(`\n📝 Importing: ${recipe.title} (${recipe.id})`);

      // 1. Insert recipe
      const { data: recipeData, error: recipeError } = await supabase
        .from('recipes')
        .insert({
          id: recipe.id,
          slug: recipe.slug,
          title: recipe.title,
          description: recipe.description,
          cuisine: recipe.cuisine,
          region: recipe.region,
          course: recipe.course,
          servings: recipe.servings,
          prep_time_minutes: recipe.prep_time_minutes,
          cook_time_minutes: recipe.cook_time_minutes,
          total_time_minutes: recipe.total_time_minutes,
          difficulty: recipe.difficulty,
          tags: recipe.tags,
          image_source: recipe.image_source,
          user_id: null, // Global recipe
          is_global: true,
        })
        .select()
        .single();

      if (recipeError) {
        console.error(`   ❌ Recipe error:`, recipeError.message);
        continue;
      }
      console.log(`   ✅ Recipe inserted`);

      // 2. Insert ingredients
      const ingredientsToInsert = recipe.ingredients.map((ing) => ({
        recipe_id: recipe.id,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category,
        optional: ing.optional || false,
      }));

      const { error: ingredientsError } = await supabase
        .from('recipe_ingredients')
        .insert(ingredientsToInsert);

      if (ingredientsError) {
        console.error(`   ❌ Ingredients error:`, ingredientsError.message);
      } else {
        console.log(`   ✅ ${ingredientsToInsert.length} ingredients inserted`);
      }

      // 3. Insert instructions
      const instructionsToInsert = recipe.instructions.map((inst) => ({
        recipe_id: recipe.id,
        step_number: inst.step,
        instruction_text: inst.text,
      }));

      const { error: instructionsError } = await supabase
        .from('recipe_instructions')
        .insert(instructionsToInsert);

      if (instructionsError) {
        console.error(`   ❌ Instructions error:`, instructionsError.message);
      } else {
        console.log(`   ✅ ${instructionsToInsert.length} instructions inserted`);
      }

      // 4. Insert translations
      const recipeTranslation = translations.find((t) => t.recipe_id === recipe.id);
      if (recipeTranslation) {
        // Insert recipe translation
        const { error: translationError } = await supabase
          .from('recipe_translations')
          .insert({
            recipe_id: recipe.id,
            locale: recipeTranslation.locale,
            title: recipeTranslation.title,
            description: recipeTranslation.description,
          });

        if (translationError) {
          console.error(`   ❌ Translation error:`, translationError.message);
        } else {
          console.log(`   ✅ Translation (${recipeTranslation.locale}) inserted`);
        }

        // Insert ingredient translations
        if (recipeTranslation.ingredients_override) {
          const ingredientTranslations = recipeTranslation.ingredients_override.map(
            (ing) => ({
              recipe_id: recipe.id,
              ingredient_name: ing.name,
              locale: recipeTranslation.locale,
              translated_name: ing.name_tr,
            })
          );

          const { error: ingTransError } = await supabase
            .from('recipe_ingredient_translations')
            .insert(ingredientTranslations);

          if (ingTransError) {
            console.error(`   ❌ Ingredient translations error:`, ingTransError.message);
          } else {
            console.log(`   ✅ ${ingredientTranslations.length} ingredient translations inserted`);
          }
        }

        // Insert instruction translations
        if (recipeTranslation.instructions) {
          const instructionTranslations = recipeTranslation.instructions.map(
            (inst) => ({
              recipe_id: recipe.id,
              step_number: inst.step,
              locale: recipeTranslation.locale,
              instruction_text: inst.text,
            })
          );

          const { error: instTransError } = await supabase
            .from('recipe_instruction_translations')
            .insert(instructionTranslations);

          if (instTransError) {
            console.error(`   ❌ Instruction translations error:`, instTransError.message);
          } else {
            console.log(`   ✅ ${instructionTranslations.length} instruction translations inserted`);
          }
        }
      }
    }

    console.log('\n\n✨ Import completed successfully!');
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

// Run import
importRecipes();
