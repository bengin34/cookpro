import { useState, useEffect } from 'react';
import { getCachedImageUri, cacheImage } from '@/lib/imageCache';
import { useNetworkStatus } from './useNetworkStatus';

interface UseCachedImageResult {
  uri: string | null;
  isLoading: boolean;
  isCached: boolean;
  error: Error | null;
}

/**
 * Hook to get a cached image or download it if not cached
 *
 * Features:
 * - Returns cached image immediately if available
 * - Downloads and caches image in background if not cached
 * - Respects network status (won't download when offline)
 * - Supports WiFi-only downloads (won't download on cellular)
 * - Handles errors gracefully
 *
 * @param imageUrl - The URL of the image to cache
 * @param options - Configuration options
 */
export function useCachedImage(
  imageUrl: string | undefined,
  options: {
    downloadWhenOffline?: boolean; // Whether to try downloading when offline
    wifiOnly?: boolean; // Only download on WiFi (not cellular)
    fallbackUri?: string; // Fallback image if download fails
  } = {}
): UseCachedImageResult {
  const { downloadWhenOffline = false, wifiOnly = false, fallbackUri } = options;
  const { isOffline, isWifi } = useNetworkStatus();
  const [state, setState] = useState<UseCachedImageResult>({
    uri: fallbackUri || null,
    isLoading: false,
    isCached: false,
    error: null,
  });

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

    let isMounted = true;

    const loadImage = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // First, check if image is already cached
        const cachedUri = await getCachedImageUri(imageUrl);

        if (cachedUri) {
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

        // If offline and not cached, don't try to download
        if (isOffline && !downloadWhenOffline) {
          if (isMounted) {
            setState({
              uri: fallbackUri || null,
              isLoading: false,
              isCached: false,
              error: new Error('Offline - image not cached'),
            });
          }
          return;
        }

        // If wifiOnly is enabled and not on WiFi, don't download
        if (wifiOnly && !isWifi) {
          if (isMounted) {
            setState({
              uri: fallbackUri || imageUrl,
              isLoading: false,
              isCached: false,
              error: new Error('WiFi required - not on WiFi'),
            });
          }
          return;
        }

        // Download and cache the image
        const newCachedUri = await cacheImage(imageUrl);

        if (isMounted) {
          if (newCachedUri) {
            setState({
              uri: newCachedUri,
              isLoading: false,
              isCached: true,
              error: null,
            });
          } else {
            // Download failed, use fallback or original URL
            setState({
              uri: fallbackUri || imageUrl,
              isLoading: false,
              isCached: false,
              error: new Error('Failed to cache image'),
            });
          }
        }
      } catch (error) {
        if (isMounted) {
          setState({
            uri: fallbackUri || imageUrl,
            isLoading: false,
            isCached: false,
            error: error instanceof Error ? error : new Error('Unknown error'),
          });
        }
      }
    };

    loadImage();

    return () => {
      isMounted = false;
    };
  }, [imageUrl, isOffline, isWifi, downloadWhenOffline, wifiOnly, fallbackUri]);

  return state;
}
