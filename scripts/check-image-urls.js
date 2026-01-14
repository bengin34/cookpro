require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkImageUrls() {
  try {
    console.log('🔍 Checking recipe image URLs...\n');

    // Get recipes with all columns to see what exists
    const { data: recipes, error } = await supabase
      .from('recipes')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Error:', error.message);
      return;
    }

    if (!recipes || recipes.length === 0) {
      console.log('⚠️  No recipes found in database');
      return;
    }

    console.log(`Found ${recipes.length} recipes:\n`);

    // First, show all columns of the first recipe
    if (recipes.length > 0) {
      console.log('📋 Available columns in recipes table:');
      console.log(Object.keys(recipes[0]).join(', '));
      console.log('\n');
    }

    recipes.forEach((recipe, idx) => {
      console.log(`${idx + 1}. ${recipe.title}`);
      console.log(`   ID: ${recipe.id}`);

      // Check for different possible image field names (including image_source)
      const imageUrl = recipe.image_source || recipe.image_url || recipe.imageUrl || recipe.image || recipe.picture_url;
      console.log(`   Image URL: ${imageUrl || '(no image)'}`);

      if (imageUrl) {
        // Check if it's a Supabase storage URL
        if (imageUrl.includes('supabase')) {
          console.log('   ✅ Supabase Storage URL detected');
        } else {
          console.log('   ℹ️  External URL');
        }
      }
      console.log('');
    });

    // Check Supabase Storage buckets
    console.log('\n📦 Checking Supabase Storage buckets...');
    const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();

    if (bucketError) {
      console.log('❌ Error listing buckets:', bucketError.message);
    } else if (buckets && buckets.length > 0) {
      console.log(`Found ${buckets.length} bucket(s):`);
      buckets.forEach(bucket => {
        console.log(`   - ${bucket.name} (${bucket.public ? 'public' : 'private'})`);
      });

      // Check files in recipe-images bucket if it exists
      const recipeImagesBucket = buckets.find(b => b.name === 'recipe-images');
      if (recipeImagesBucket) {
        const { data: files, error: filesError } = await supabase.storage
          .from('recipe-images')
          .list('', { limit: 5 });

        if (!filesError && files && files.length > 0) {
          console.log(`\n📸 Sample files in recipe-images bucket:`);
          files.forEach(file => {
            console.log(`   - ${file.name}`);
          });
        }
      }
    } else {
      console.log('⚠️  No storage buckets found');
    }

  } catch (error) {
    console.error('💥 Error:', error.message);
  }
}

checkImageUrls();
