import { createClient } from '@supabase/supabase-js';
import * as crypto from 'crypto';
import 'dotenv/config';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
// Use service role key for admin operations (bypasses RLS)
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

const BUCKET_NAME = 'recipe-images';

/**
 * Upload image to Supabase storage
 * @param imageBuffer - Image data as Buffer
 * @param recipeId - Recipe ID (e.g., "tr_000001")
 * @param originalUrl - Original Unsplash URL (for metadata)
 * @returns Public URL of uploaded image or null on failure
 */
export async function uploadImageToSupabase(
  imageBuffer: Buffer,
  recipeId: string,
  originalUrl: string
): Promise<string | null> {
  try {
    // Generate unique filename: recipeId + hash
    const hash = crypto.createHash('md5').update(originalUrl).digest('hex').substring(0, 8);
    const filename = `${recipeId}_${hash}.jpg`;

    console.log(`   📤 Uploading to Supabase: ${filename}`);

    // Upload to Supabase storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(filename, imageBuffer, {
        contentType: 'image/jpeg',
        upsert: true, // Overwrite if exists
      });

    if (error) {
      console.error(`   ❌ Upload error:`, error.message);
      return null;
    }

    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(filename);

    console.log(`   ✅ Uploaded: ${publicUrlData.publicUrl}`);
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('❌ Error uploading to Supabase:', error);
    return null;
  }
}

/**
 * Update recipe image_source in Supabase database
 * @param recipeId - Recipe ID
 * @param imageUrl - Public URL of the image
 * @returns Success boolean
 */
export async function updateRecipeImage(
  recipeId: string,
  imageUrl: string
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('recipes')
      .update({ image_source: imageUrl })
      .eq('id', recipeId);

    if (error) {
      console.error(`   ❌ DB update error:`, error.message);
      return false;
    }

    console.log(`   ✅ Database updated for ${recipeId}`);
    return true;
  } catch (error) {
    console.error('❌ Error updating recipe in DB:', error);
    return false;
  }
}

/**
 * Check if image already exists in storage
 * @param recipeId - Recipe ID
 * @returns True if image exists
 */
export async function imageExistsInStorage(recipeId: string): Promise<boolean> {
  try {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list('', {
        search: recipeId,
      });

    if (error) {
      return false;
    }

    return (data || []).length > 0;
  } catch (error) {
    return false;
  }
}
