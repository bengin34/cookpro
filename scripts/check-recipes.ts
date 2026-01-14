import { createClient } from '@supabase/supabase-js';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRecipes() {
  try {
    console.log('🔍 Checking recipes in Supabase...\n');

    // Count total recipes
    const { count: recipeCount, error: recipeError } = await supabase
      .from('recipes')
      .select('*', { count: 'exact', head: true });

    if (recipeError) {
      console.error('❌ Error counting recipes:', recipeError.message);
      return;
    }

    console.log(`✅ Total recipes: ${recipeCount}`);

    // Count ingredients
    const { count: ingredientCount, error: ingredientError } = await supabase
      .from('recipe_ingredients')
      .select('*', { count: 'exact', head: true });

    if (ingredientError) {
      console.error('❌ Error counting ingredients:', ingredientError.message);
    } else {
      console.log(`✅ Total recipe ingredients: ${ingredientCount}`);
    }

    // Count instructions
    const { count: instructionCount, error: instructionError } = await supabase
      .from('recipe_instructions')
      .select('*', { count: 'exact', head: true });

    if (instructionError) {
      console.error('❌ Error counting instructions:', instructionError.message);
    } else {
      console.log(`✅ Total recipe instructions: ${instructionCount}`);
    }

    // Get sample recipes
    const { data: sampleRecipes, error: sampleError } = await supabase
      .from('recipes')
      .select('id, title, cuisine, difficulty')
      .limit(5);

    if (sampleError) {
      console.error('❌ Error fetching sample recipes:', sampleError.message);
    } else {
      console.log('\n📖 Sample recipes:');
      sampleRecipes?.forEach((recipe) => {
        console.log(`   - ${recipe.title} (${recipe.cuisine}, ${recipe.difficulty})`);
      });
    }
  } catch (error) {
    console.error('💥 Check failed:', error);
  }
}

checkRecipes();
