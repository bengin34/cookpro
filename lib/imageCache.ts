import * as FileSystem from 'expo-file-system';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_DIR = `${FileSystem.cacheDirectory}recipe-images/`;
const MAX_CACHE_SIZE = 100 * 1024 * 1024; // 100MB
const MAX_AGE = 1000 * 60 * 60 * 24 * 7; // 7 days
const CACHE_METADATA_KEY = 'IMAGE_CACHE_METADATA';

interface CacheMetadata {
  [key: string]: {
    localUri: string;
    size: number;
    timestamp: number;
    lastAccessed: number;
  };
}

/**
 * Initialize cache directory
 */
export async function initImageCache(): Promise<void> {
  try {
    const dirInfo = await FileSystem.getInfoAsync(CACHE_DIR);
    if (!dirInfo.exists) {
      await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
    }
  } catch (error) {
    console.error('Failed to initialize image cache:', error);
  }
}

/**
 * Get cache metadata from AsyncStorage
 */
async function getCacheMetadata(): Promise<CacheMetadata> {
  try {
    const metadata = await AsyncStorage.getItem(CACHE_METADATA_KEY);
    return metadata ? JSON.parse(metadata) : {};
  } catch (error) {
    console.error('Failed to get cache metadata:', error);
    return {};
  }
}

/**
 * Save cache metadata to AsyncStorage
 */
async function saveCacheMetadata(metadata: CacheMetadata): Promise<void> {
  try {
    await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
  } catch (error) {
    console.error('Failed to save cache metadata:', error);
  }
}

/**
 * Generate cache key from URL
 */
function getCacheKey(url: string): string {
  return url.replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Get local URI for a cached image
 */
export async function getCachedImageUri(url: string): Promise<string | null> {
  if (!url) return null;

  try {
    await initImageCache();
    const metadata = await getCacheMetadata();
    const cacheKey = getCacheKey(url);
    const cached = metadata[cacheKey];

    if (!cached) return null;

    // Check if cache is expired
    const age = Date.now() - cached.timestamp;
    if (age > MAX_AGE) {
      // Cache expired, delete it
      await deleteCachedImage(url);
      return null;
    }

    // Check if file exists
    const fileInfo = await FileSystem.getInfoAsync(cached.localUri);
    if (!fileInfo.exists) {
      // File missing, remove from metadata
      delete metadata[cacheKey];
      await saveCacheMetadata(metadata);
      return null;
    }

    // Update last accessed time
    cached.lastAccessed = Date.now();
    metadata[cacheKey] = cached;
    await saveCacheMetadata(metadata);

    return cached.localUri;
  } catch (error) {
    console.error('Failed to get cached image:', error);
    return null;
  }
}

/**
 * Download and cache an image
 */
export async function cacheImage(url: string): Promise<string | null> {
  if (!url) return null;

  try {
    await initImageCache();

    // Check if already cached
    const existingUri = await getCachedImageUri(url);
    if (existingUri) return existingUri;

    const cacheKey = getCacheKey(url);
    const localUri = `${CACHE_DIR}${cacheKey}.jpg`;

    // Download image
    const downloadResult = await FileSystem.downloadAsync(url, localUri);

    if (downloadResult.status !== 200) {
      console.error('Failed to download image:', downloadResult.status);
      return null;
    }

    // Get file size
    const fileInfo = await FileSystem.getInfoAsync(localUri);
    const size = fileInfo.exists && 'size' in fileInfo ? fileInfo.size : 0;

    // Update metadata
    const metadata = await getCacheMetadata();
    metadata[cacheKey] = {
      localUri,
      size,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
    };
    await saveCacheMetadata(metadata);

    // Check cache size and clean if needed
    await cleanCacheIfNeeded();

    return localUri;
  } catch (error) {
    console.error('Failed to cache image:', error);
    return null;
  }
}

/**
 * Delete a cached image
 */
export async function deleteCachedImage(url: string): Promise<void> {
  try {
    const metadata = await getCacheMetadata();
    const cacheKey = getCacheKey(url);
    const cached = metadata[cacheKey];

    if (cached) {
      await FileSystem.deleteAsync(cached.localUri, { idempotent: true });
      delete metadata[cacheKey];
      await saveCacheMetadata(metadata);
    }
  } catch (error) {
    console.error('Failed to delete cached image:', error);
  }
}

/**
 * Get total cache size
 */
async function getCacheSize(): Promise<number> {
  try {
    const metadata = await getCacheMetadata();
    return Object.values(metadata).reduce((total, item) => total + item.size, 0);
  } catch (error) {
    console.error('Failed to get cache size:', error);
    return 0;
  }
}

/**
 * Clean cache if it exceeds max size
 * Removes least recently accessed images first
 */
export async function cleanCacheIfNeeded(): Promise<void> {
  try {
    const totalSize = await getCacheSize();

    if (totalSize <= MAX_CACHE_SIZE) return;

    const metadata = await getCacheMetadata();

    // Sort by last accessed (oldest first)
    const entries = Object.entries(metadata).sort(
      ([, a], [, b]) => a.lastAccessed - b.lastAccessed
    );

    let currentSize = totalSize;
    const targetSize = MAX_CACHE_SIZE * 0.8; // Clean to 80% capacity

    // Delete oldest files until we're under target size
    for (const [key, item] of entries) {
      if (currentSize <= targetSize) break;

      await FileSystem.deleteAsync(item.localUri, { idempotent: true });
      delete metadata[key];
      currentSize -= item.size;
    }

    await saveCacheMetadata(metadata);
  } catch (error) {
    console.error('Failed to clean cache:', error);
  }
}

/**
 * Clear all cached images
 */
export async function clearImageCache(): Promise<void> {
  try {
    await FileSystem.deleteAsync(CACHE_DIR, { idempotent: true });
    await AsyncStorage.removeItem(CACHE_METADATA_KEY);
    await initImageCache();
  } catch (error) {
    console.error('Failed to clear cache:', error);
  }
}

/**
 * Get cache statistics
 */
export async function getCacheStats(): Promise<{
  totalSize: number;
  itemCount: number;
  maxSize: number;
}> {
  try {
    const metadata = await getCacheMetadata();
    const totalSize = await getCacheSize();

    return {
      totalSize,
      itemCount: Object.keys(metadata).length,
      maxSize: MAX_CACHE_SIZE,
    };
  } catch (error) {
    console.error('Failed to get cache stats:', error);
    return { totalSize: 0, itemCount: 0, maxSize: MAX_CACHE_SIZE };
  }
}
