#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import {
  processRecipesBatch,
  printProcessingSummary,
  type Recipe,
} from '../services/recipeImageProcessor';

interface RecipeData {
  recipes: Recipe[];
}

/**
 * Main script to populate recipe images
 */
async function main() {
  console.log('🚀 CookPro Recipe Image Populator\n');

  // Parse command line arguments
  const args = process.argv.slice(2);
  const startIndex = parseInt(args.find((arg) => arg.startsWith('--start='))?.split('=')[1] || '0');
  const endIndex = parseInt(args.find((arg) => arg.startsWith('--end='))?.split('=')[1] || '100');
  const skipIfExists = !args.includes('--force');

  console.log('⚙️  Configuration:');
  console.log(`   Start index: ${startIndex}`);
  console.log(`   End index: ${endIndex}`);
  console.log(`   Skip if exists: ${skipIfExists}`);
  console.log(`   Unsplash API Key: ${process.env.UNSPLASH_ACCESS_KEY ? '✅ Set' : '❌ Missing'}\n`);

  // Validate environment variables
  if (!process.env.UNSPLASH_ACCESS_KEY) {
    console.error('❌ Error: UNSPLASH_ACCESS_KEY not found in environment variables');
    console.error('   Add it to your .env file:\n');
    console.error('   UNSPLASH_ACCESS_KEY=your_key_here\n');
    process.exit(1);
  }

  if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Error: Supabase credentials not found in environment variables');
    process.exit(1);
  }

  // Read recipes from JSON
  const recipesPath = path.join(__dirname, '../db/en.json');

  if (!fs.existsSync(recipesPath)) {
    console.error(`❌ Error: Recipe file not found at ${recipesPath}`);
    process.exit(1);
  }

  const recipeData: RecipeData = JSON.parse(fs.readFileSync(recipesPath, 'utf-8'));
  const allRecipes = recipeData.recipes;

  console.log(`📖 Loaded ${allRecipes.length} recipes from en.json\n`);

  // Slice recipes based on start/end index
  const recipesToProcess = allRecipes.slice(startIndex, endIndex);

  console.log(`🎯 Processing recipes ${startIndex} to ${endIndex - 1} (${recipesToProcess.length} recipes)\n`);
  console.log('='.repeat(60));

  // Process recipes
  const startTime = Date.now();

  const results = await processRecipesBatch(recipesToProcess, {
    skipIfExists,
    delayMs: 1200, // 1.2 seconds (safe rate limit: 50 requests/hour)
    onProgress: (current, total, result) => {
      const percent = ((current / total) * 100).toFixed(1);
      console.log(`\n📊 Progress: ${current}/${total} (${percent}%) - Status: ${result.status}`);
    },
  });

  const endTime = Date.now();
  const durationSec = ((endTime - startTime) / 1000).toFixed(1);

  // Print summary
  printProcessingSummary(results);

  console.log(`\n⏱️  Total time: ${durationSec} seconds`);

  // Update local JSON file with new image URLs
  console.log('\n📝 Updating local en.json file...');

  const successResults = results.filter((r) => r.status === 'success' && r.imageUrl);

  if (successResults.length > 0) {
    // Update recipes with new image URLs
    successResults.forEach((result) => {
      const recipe = allRecipes.find((r) => r.id === result.recipeId);
      if (recipe) {
        recipe.image_source = result.imageUrl;
      }
    });

    // Write updated JSON back to file
    fs.writeFileSync(
      recipesPath,
      JSON.stringify({ recipes: allRecipes }, null, 2),
      'utf-8'
    );

    console.log(`✅ Updated ${successResults.length} recipes in en.json`);
  } else {
    console.log('⏭️  No new images to update in en.json');
  }

  console.log('\n✨ Done!\n');

  // Exit with appropriate code
  const failedCount = results.filter((r) => r.status === 'failed').length;
  process.exit(failedCount > 0 ? 1 : 0);
}

// Run the script
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
