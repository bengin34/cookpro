#!/usr/bin/env tsx
import 'dotenv/config';
import { searchRecipeImage } from '../services/unsplashService';
import { createClient } from '@supabase/supabase-js';

/**
 * Test script to verify setup is correct
 */
async function testSetup() {
  console.log('🧪 Testing Recipe Image Setup\n');

  // Test 1: Environment variables
  console.log('1️⃣  Checking environment variables...');
  const hasUnsplash = !!process.env.UNSPLASH_ACCESS_KEY;
  const hasSupabase = !!(
    process.env.EXPO_PUBLIC_SUPABASE_URL && process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY
  );

  console.log(`   Unsplash API Key: ${hasUnsplash ? '✅ Set' : '❌ Missing'}`);
  console.log(`   Supabase URL: ${hasSupabase ? '✅ Set' : '❌ Missing'}`);

  if (!hasUnsplash || !hasSupabase) {
    console.error('\n❌ Missing required environment variables');
    process.exit(1);
  }

  // Test 2: Unsplash API connection
  console.log('\n2️⃣  Testing Unsplash API...');
  try {
    const result = await searchRecipeImage('Turkish breakfast menemen');
    if (result) {
      console.log(`   ✅ Successfully found image: ${result.url.substring(0, 60)}...`);
      console.log(`   📸 Photographer: ${result.photographer}`);
    } else {
      console.log('   ⚠️  No image found (this is okay, API is working)');
    }
  } catch (error) {
    console.error('   ❌ Unsplash API error:', error);
    process.exit(1);
  }

  // Test 3: Supabase connection
  console.log('\n3️⃣  Testing Supabase connection...');
  try {
    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.from('recipes').select('id').limit(1);

    if (error) {
      console.error('   ❌ Supabase error:', error.message);
      process.exit(1);
    }

    console.log('   ✅ Successfully connected to Supabase');
  } catch (error) {
    console.error('   ❌ Supabase connection failed:', error);
    process.exit(1);
  }

  // Test 4: Supabase storage bucket
  console.log('\n4️⃣  Checking Supabase storage bucket...');
  try {
    const supabase = createClient(
      process.env.EXPO_PUBLIC_SUPABASE_URL!,
      process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data, error } = await supabase.storage.from('recipe-images').list('', { limit: 1 });

    if (error) {
      console.error('   ❌ Storage bucket error:', error.message);
      console.error('\n   💡 Make sure you created the "recipe-images" bucket in Supabase');
      console.error('   💡 Make sure the bucket is PUBLIC or has proper RLS policies');
      process.exit(1);
    }

    console.log('   ✅ Storage bucket "recipe-images" is accessible');
  } catch (error) {
    console.error('   ❌ Storage bucket check failed:', error);
    process.exit(1);
  }

  console.log('\n✨ All tests passed! You are ready to populate images.\n');
  console.log('🚀 Run: npm run populate:images -- --start=0 --end=10');
  console.log('   (Test with first 10 recipes)\n');
}

testSetup().catch((error) => {
  console.error('💥 Test failed:', error);
  process.exit(1);
});
