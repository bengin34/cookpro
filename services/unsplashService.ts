import { createApi } from 'unsplash-js';

// Unsplash API client
const unsplash = createApi({
  accessKey: process.env.UNSPLASH_ACCESS_KEY!,
});

export interface UnsplashImage {
  id: string;
  url: string;
  downloadUrl: string;
  photographer: string;
  photographerUrl: string;
  description: string | null;
}

/**
 * Search for a recipe image on Unsplash
 * @param recipeName - The name of the recipe (e.g., "Menemen")
 * @param orientation - Image orientation (default: landscape)
 * @returns UnsplashImage or null if not found
 */
export async function searchRecipeImage(
  recipeName: string,
  orientation: 'landscape' | 'portrait' | 'squarish' = 'landscape'
): Promise<UnsplashImage | null> {
  try {
    // Clean recipe name for better search results
    const cleanName = recipeName
      .replace(/\(.*?\)/g, '') // Remove parentheses content
      .replace(/[^\w\s]/g, '') // Remove special characters
      .trim();

    // Search query: recipe name + "food" for better results
    const query = `${cleanName} food dish`;

    console.log(`🔍 Searching Unsplash for: "${query}"`);

    const result = await unsplash.search.getPhotos({
      query,
      page: 1,
      perPage: 3, // Get top 3 results
      orientation,
    });

    if (result.errors) {
      console.error('❌ Unsplash API error:', result.errors);
      return null;
    }

    const photos = result.response?.results || [];

    if (photos.length === 0) {
      console.log(`   ⚠️  No images found for "${cleanName}"`);
      return null;
    }

    // Return the first (most relevant) result
    const photo = photos[0];

    return {
      id: photo.id,
      url: photo.urls.regular, // High quality URL
      downloadUrl: photo.links.download, // Proper download link
      photographer: photo.user.name,
      photographerUrl: photo.user.links.html,
      description: photo.description || photo.alt_description,
    };
  } catch (error) {
    console.error('❌ Error searching Unsplash:', error);
    return null;
  }
}

/**
 * Trigger Unsplash download endpoint (required by API terms)
 * This increments the download count for the photographer
 */
export async function triggerDownload(downloadUrl: string): Promise<void> {
  try {
    await fetch(downloadUrl);
  } catch (error) {
    console.error('⚠️  Failed to trigger download endpoint:', error);
  }
}

/**
 * Download image from Unsplash URL
 * @param imageUrl - The Unsplash image URL
 * @returns Buffer containing image data
 */
export async function downloadImage(imageUrl: string): Promise<Buffer> {
  const response = await fetch(imageUrl);

  if (!response.ok) {
    throw new Error(`Failed to download image: ${response.statusText}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}
