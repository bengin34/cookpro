import { useState, useEffect, useRef } from 'react';
import { getCachedImageUri, cacheImageInBackground } from '@/lib/imageCache';
import { useNetworkStatus } from './useNetworkStatus';

interface UseCachedImageResult {
  uri: string | null;
  isLoading: boolean;
  isCached: boolean;
  error: Error | null;
}

// In-memory cache for instant lookup (avoids AsyncStorage reads)
const memoryCache = new Map<string, string>();

/**
 * Hook to get a cached image or download it if not cached
 *
 * PERFORMANCE OPTIMIZED:
 * - Returns network URL immediately (no blocking)
 * - Checks memory cache first (instant)
 * - Checks disk cache in background
 * - Downloads and caches in background (non-blocking)
 *
 * @param imageUrl - The URL of the image to cache
 * @param options - Configuration options
 */
export function useCachedImage(
  imageUrl: string | undefined,
  options: {
    downloadWhenOffline?: boolean;
    wifiOnly?: boolean;
    fallbackUri?: string;
  } = {}
): UseCachedImageResult {
  const { fallbackUri } = options;
  const { isOffline } = useNetworkStatus();

  // Start with the network URL immediately - no blocking!
  const initialUri = imageUrl || fallbackUri || null;

  const [state, setState] = useState<UseCachedImageResult>(() => {
    // Check memory cache synchronously for instant results
    if (imageUrl && memoryCache.has(imageUrl)) {
      return {
        uri: memoryCache.get(imageUrl)!,
        isLoading: false,
        isCached: true,
        error: null,
      };
    }
    return {
      uri: initialUri,
      isLoading: false, // Don't block - show network URL immediately
      isCached: false,
      error: null,
    };
  });

  const hasCheckedCache = useRef(false);

  useEffect(() => {
    if (!imageUrl) {
      setState({
        uri: fallbackUri || null,
        isLoading: false,
        isCached: false,
        error: null,
      });
      return;
    }

    // Already in memory cache - nothing to do
    if (memoryCache.has(imageUrl)) {
      setState({
        uri: memoryCache.get(imageUrl)!,
        isLoading: false,
        isCached: true,
        error: null,
      });
      return;
    }

    let isMounted = true;

    // Background cache check and download (non-blocking)
    const checkAndCache = async () => {
      try {
        // Check disk cache
        const cachedUri = await getCachedImageUri(imageUrl);

        if (cachedUri) {
          // Found in disk cache - update memory cache and state
          memoryCache.set(imageUrl, cachedUri);
          if (isMounted) {
            setState({
              uri: cachedUri,
              isLoading: false,
              isCached: true,
              error: null,
            });
          }
          return;
        }

        // If offline, keep using network URL (will fail gracefully)
        if (isOffline) {
          return;
        }

        // Download and cache in background (fire and forget)
        cacheImageInBackground(imageUrl).then((newCachedUri) => {
          if (newCachedUri && isMounted) {
            memoryCache.set(imageUrl, newCachedUri);
            setState({
              uri: newCachedUri,
              isLoading: false,
              isCached: true,
              error: null,
            });
          }
        });
      } catch {
        // Errors are non-critical - network URL is already displayed
      }
    };

    // Only check cache once per URL
    if (!hasCheckedCache.current) {
      hasCheckedCache.current = true;
      checkAndCache();
    }

    return () => {
      isMounted = false;
    };
  }, [imageUrl, isOffline, fallbackUri]);

  return state;
}
