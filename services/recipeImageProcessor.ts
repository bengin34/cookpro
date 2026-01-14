import { searchRecipeImage, downloadImage, triggerDownload } from './unsplashService';
import { uploadImageToSupabase, updateRecipeImage, imageExistsInStorage } from './supabaseImageService';

export interface Recipe {
  id: string;
  title: string;
  image_source?: string | null;
}

export interface ProcessResult {
  recipeId: string;
  title: string;
  status: 'success' | 'failed' | 'skipped' | 'exists';
  imageUrl?: string;
  error?: string;
}

/**
 * Process a single recipe: search, download, upload image
 * @param recipe - Recipe object
 * @param skipIfExists - Skip if image already exists in storage
 * @returns ProcessResult
 */
export async function processRecipeImage(
  recipe: Recipe,
  skipIfExists = true
): Promise<ProcessResult> {
  const { id, title } = recipe;

  console.log(`\n📸 Processing: ${title} (${id})`);

  try {
    // Check if image already exists
    if (skipIfExists && recipe.image_source) {
      console.log(`   ⏭️  Already has image, skipping...`);
      return {
        recipeId: id,
        title,
        status: 'skipped',
        imageUrl: recipe.image_source,
      };
    }

    // Check storage
    const existsInStorage = await imageExistsInStorage(id);
    if (skipIfExists && existsInStorage) {
      console.log(`   ⏭️  Image exists in storage, skipping...`);
      return {
        recipeId: id,
        title,
        status: 'exists',
      };
    }

    // 1. Search Unsplash for image
    const unsplashImage = await searchRecipeImage(title);

    if (!unsplashImage) {
      return {
        recipeId: id,
        title,
        status: 'failed',
        error: 'No image found on Unsplash',
      };
    }

    console.log(`   ✅ Found image by ${unsplashImage.photographer}`);

    // 2. Download image
    console.log(`   ⬇️  Downloading image...`);
    const imageBuffer = await downloadImage(unsplashImage.url);

    // 3. Trigger Unsplash download endpoint (API requirement)
    await triggerDownload(unsplashImage.downloadUrl);

    // 4. Upload to Supabase
    const publicUrl = await uploadImageToSupabase(
      imageBuffer,
      id,
      unsplashImage.url
    );

    if (!publicUrl) {
      return {
        recipeId: id,
        title,
        status: 'failed',
        error: 'Failed to upload to Supabase',
      };
    }

    // 5. Update database
    const dbUpdated = await updateRecipeImage(id, publicUrl);

    if (!dbUpdated) {
      return {
        recipeId: id,
        title,
        status: 'failed',
        error: 'Failed to update database',
        imageUrl: publicUrl,
      };
    }

    return {
      recipeId: id,
      title,
      status: 'success',
      imageUrl: publicUrl,
    };
  } catch (error) {
    console.error(`   ❌ Error processing ${title}:`, error);
    return {
      recipeId: id,
      title,
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Process multiple recipes in batch with rate limiting
 * @param recipes - Array of recipes
 * @param options - Processing options
 * @returns Array of ProcessResult
 */
export async function processRecipesBatch(
  recipes: Recipe[],
  options: {
    skipIfExists?: boolean;
    delayMs?: number; // Delay between requests (Unsplash rate limit)
    onProgress?: (current: number, total: number, result: ProcessResult) => void;
  } = {}
): Promise<ProcessResult[]> {
  const {
    skipIfExists = true,
    delayMs = 1000, // 1 second delay (50 requests/hour = ~1.2s per request)
    onProgress,
  } = options;

  const results: ProcessResult[] = [];
  const total = recipes.length;

  for (let i = 0; i < recipes.length; i++) {
    const recipe = recipes[i];
    const result = await processRecipeImage(recipe, skipIfExists);
    results.push(result);

    // Progress callback
    if (onProgress) {
      onProgress(i + 1, total, result);
    }

    // Rate limiting delay (except for last item)
    if (i < recipes.length - 1) {
      console.log(`   ⏳ Waiting ${delayMs}ms before next request...`);
      await sleep(delayMs);
    }
  }

  return results;
}

/**
 * Print summary of processing results
 */
export function printProcessingSummary(results: ProcessResult[]): void {
  const success = results.filter((r) => r.status === 'success').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;
  const exists = results.filter((r) => r.status === 'exists').length;

  console.log('\n' + '='.repeat(60));
  console.log('📊 PROCESSING SUMMARY');
  console.log('='.repeat(60));
  console.log(`✅ Success: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⏭️  Skipped: ${skipped}`);
  console.log(`📦 Already exists: ${exists}`);
  console.log(`📈 Total: ${results.length}`);
  console.log('='.repeat(60));

  // Show failed recipes
  if (failed > 0) {
    console.log('\n❌ Failed recipes:');
    results
      .filter((r) => r.status === 'failed')
      .forEach((r) => {
        console.log(`   - ${r.title} (${r.recipeId}): ${r.error}`);
      });
  }
}

// Helper: sleep function
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
