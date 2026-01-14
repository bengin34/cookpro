#!/usr/bin/env tsx
import * as fs from 'fs';
import * as path from 'path';
import 'dotenv/config';
import { uploadImageToSupabase, updateRecipeImage } from '../services/supabaseImageService';

interface RecipeData {
  recipes: Array<{
    id: string;
    title: string;
    image_source?: string | null;
    [key: string]: any;
  }>;
}

/**
 * Upload a local image to Supabase and update recipe in DB + en.json
 *
 * Usage:
 *   npm run upload-image <recipe-id> <image-filename>
 *
 * Example:
 *   npm run upload-image tr_000002 mercimek_corbasi.jpeg
 */
async function main() {
  console.log('🚀 CookPro Local Image Uploader\n');

  // Parse command line arguments
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.error('❌ Error: Missing required arguments\n');
    console.error('Usage:');
    console.error('  npm run upload-image <recipe-id> <image-filename>\n');
    console.error('Example:');
    console.error('  npm run upload-image tr_000002 mercimek_corbasi.jpeg\n');
    console.error('Note: Image should be in assets/images/recipe/ folder');
    process.exit(1);
  }

  const recipeId = args[0];
  const imageFilename = args[1];

  console.log('⚙️  Configuration:');
  console.log(`   Recipe ID: ${recipeId}`);
  console.log(`   Image filename: ${imageFilename}`);
  console.log(`   Supabase URL: ${process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}\n`);

  // Validate environment variables
  if (!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('❌ Error: Supabase credentials not found in environment variables');
    process.exit(1);
  }

  // Paths
  const imagePath = path.join(__dirname, '../assets/images/recipe', imageFilename);
  const jsonPath = path.join(__dirname, '../db/en.json');

  // Check if image file exists
  if (!fs.existsSync(imagePath)) {
    console.error(`❌ Error: Image file not found at ${imagePath}`);
    console.error(`   Make sure the file exists in assets/images/recipe/ folder`);
    process.exit(1);
  }

  // Check if JSON file exists
  if (!fs.existsSync(jsonPath)) {
    console.error(`❌ Error: Recipe file not found at ${jsonPath}`);
    process.exit(1);
  }

  // Read and parse JSON
  const recipeData: RecipeData = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
  const recipe = recipeData.recipes.find((r) => r.id === recipeId);

  if (!recipe) {
    console.error(`❌ Error: Recipe with ID "${recipeId}" not found in en.json`);
    console.error(`   Available IDs: ${recipeData.recipes.slice(0, 5).map((r) => r.id).join(', ')}...`);
    process.exit(1);
  }

  console.log(`\n📖 Found recipe: ${recipe.title}`);

  // Read image file
  console.log(`\n📂 Reading local image file...`);
  const imageBuffer = fs.readFileSync(imagePath);
  const imageSizeKB = (imageBuffer.length / 1024).toFixed(2);
  console.log(`   ✅ Loaded ${imageSizeKB} KB`);

  // Upload to Supabase
  console.log(`\n📤 Uploading to Supabase storage...`);
  const publicUrl = await uploadImageToSupabase(imageBuffer, recipeId, imagePath);

  if (!publicUrl) {
    console.error('❌ Failed to upload image to Supabase');
    process.exit(1);
  }

  console.log(`   ✅ Image uploaded successfully!`);
  console.log(`   🔗 URL: ${publicUrl}`);

  // Update database
  console.log(`\n💾 Updating recipe in Supabase database...`);
  const dbUpdateSuccess = await updateRecipeImage(recipeId, publicUrl);

  if (!dbUpdateSuccess) {
    console.error('⚠️  Warning: Failed to update database, but image was uploaded');
    console.error('   You may need to update the database manually');
  } else {
    console.log(`   ✅ Database updated successfully`);
  }

  // Update local JSON file
  console.log(`\n📝 Updating en.json file...`);
  recipe.image_source = publicUrl;

  fs.writeFileSync(jsonPath, JSON.stringify(recipeData, null, 2), 'utf-8');
  console.log(`   ✅ en.json updated successfully`);

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('✨ Upload Complete!\n');
  console.log(`Recipe ID:    ${recipeId}`);
  console.log(`Recipe Title: ${recipe.title}`);
  console.log(`Image URL:    ${publicUrl}`);
  console.log(`Image Size:   ${imageSizeKB} KB`);
  console.log('\n📋 What was updated:');
  console.log('   ✅ Supabase storage (recipe-images bucket)');
  console.log('   ✅ Supabase database (recipes table)');
  console.log('   ✅ Local en.json file');
  console.log('\n💡 Next steps:');
  console.log('   - Verify the image in your app');
  console.log('   - Commit the updated en.json file');
  console.log('   - Delete the local image from assets/ if no longer needed\n');
}

// Run the script
main().catch((error) => {
  console.error('💥 Fatal error:', error);
  process.exit(1);
});
