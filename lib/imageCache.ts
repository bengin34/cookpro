import { Directory, File } from 'expo-file-system';
import * as FileSystem from 'expo-file-system/legacy';
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

// In-memory metadata cache to avoid repeated AsyncStorage reads
let metadataCache: CacheMetadata | null = null;
let metadataCacheLoaded = false;
let cacheInitialized = false;

// Debounce metadata saves to avoid excessive writes
let saveTimeout: ReturnType<typeof setTimeout> | null = null;
const SAVE_DEBOUNCE_MS = 2000;

/**
 * Initialize cache directory (only once)
 */
export async function initImageCache(): Promise<void> {
  if (cacheInitialized) return;

  try {
    const cacheDir = new Directory(CACHE_DIR);
    if (!cacheDir.exists) {
      await cacheDir.create();
    }
    cacheInitialized = true;
  } catch (error) {
    console.error('Failed to initialize image cache:', error);
  }
}

/**
 * Get cache metadata - uses in-memory cache after first load
 */
async function getCacheMetadata(): Promise<CacheMetadata> {
  if (metadataCacheLoaded && metadataCache !== null) {
    return metadataCache;
  }

  try {
    const metadata = await AsyncStorage.getItem(CACHE_METADATA_KEY);
    metadataCache = metadata ? JSON.parse(metadata) : {};
    metadataCacheLoaded = true;
    return metadataCache;
  } catch (error) {
    console.error('Failed to get cache metadata:', error);
    metadataCache = {};
    metadataCacheLoaded = true;
    return {};
  }
}

/**
 * Save cache metadata - debounced to avoid excessive writes
 */
async function saveCacheMetadata(metadata: CacheMetadata): Promise<void> {
  // Update in-memory cache immediately
  metadataCache = metadata;

  // Debounce the actual save
  if (saveTimeout) {
    clearTimeout(saveTimeout);
  }

  saveTimeout = setTimeout(async () => {
    try {
      await AsyncStorage.setItem(CACHE_METADATA_KEY, JSON.stringify(metadata));
    } catch (error) {
      console.error('Failed to save cache metadata:', error);
    }
  }, SAVE_DEBOUNCE_MS);
}

/**
 * Generate cache key from URL
 */
function getCacheKey(url: string): string {
  return url.replace(/[^a-zA-Z0-9]/g, '_');
}

/**
 * Get local URI for a cached image (fast, non-blocking where possible)
 */
export async function getCachedImageUri(url: string): Promise<string | null> {
  if (!url) return null;

  try {
    const metadata = await getCacheMetadata();
    const cacheKey = getCacheKey(url);
    const cached = metadata[cacheKey];

    if (!cached) return null;

    // Check if cache is expired
    const age = Date.now() - cached.timestamp;
    if (age > MAX_AGE) {
      // Cache expired - clean up in background, don't block
      deleteCachedImage(url).catch(() => {});
      return null;
    }

    // Check if file exists using new File API
    const cachedFile = new File(cached.localUri);
    if (!cachedFile.exists) {
      // File missing, remove from metadata (don't block)
      delete metadata[cacheKey];
      saveCacheMetadata(metadata);
      return null;
    }

    // Skip updating lastAccessed on every read - it's expensive
    // Only update occasionally (every 10 minutes)
    const timeSinceAccess = Date.now() - cached.lastAccessed;
    if (timeSinceAccess > 10 * 60 * 1000) {
      cached.lastAccessed = Date.now();
      metadata[cacheKey] = cached;
      saveCacheMetadata(metadata); // Non-blocking, debounced
    }

    return cached.localUri;
  } catch (error) {
    console.error('Failed to get cached image:', error);
    return null;
  }
}

// Track in-progress downloads to avoid duplicates
const downloadingUrls = new Set<string>();

/**
 * Download and cache an image
 */
export async function cacheImage(url: string): Promise<string | null> {
  if (!url) return null;

  // Avoid duplicate downloads
  if (downloadingUrls.has(url)) {
    return null;
  }

  try {
    downloadingUrls.add(url);
    await initImageCache();

    // Check if already cached (uses in-memory cache, fast)
    const existingUri = await getCachedImageUri(url);
    if (existingUri) {
      downloadingUrls.delete(url);
      return existingUri;
    }

    const cacheKey = getCacheKey(url);
    const localUri = `${CACHE_DIR}${cacheKey}.jpg`;

    // Download image
    const downloadResult = await FileSystem.downloadAsync(url, localUri);

    if (downloadResult.status !== 200) {
      downloadingUrls.delete(url);
      return null;
    }

    // Get file size using new File API
    const downloadedFile = new File(localUri);
    const size = downloadedFile.exists ? downloadedFile.size : 0;

    // Update metadata
    const metadata = await getCacheMetadata();
    metadata[cacheKey] = {
      localUri,
      size,
      timestamp: Date.now(),
      lastAccessed: Date.now(),
    };
    saveCacheMetadata(metadata); // Non-blocking

    // Check cache size and clean if needed (in background)
    cleanCacheIfNeeded().catch(() => {});

    downloadingUrls.delete(url);
    return localUri;
  } catch (error) {
    downloadingUrls.delete(url);
    console.error('Failed to cache image:', error);
    return null;
  }
}

/**
 * Download and cache an image in background (fire and forget)
 * Returns the cached URI if successful, null otherwise
 */
export async function cacheImageInBackground(url: string): Promise<string | null> {
  return cacheImage(url);
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
