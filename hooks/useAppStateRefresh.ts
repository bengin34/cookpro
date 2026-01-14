import { useEffect, useRef } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useQueryClient } from '@tanstack/react-query';

interface UseAppStateRefreshOptions {
  enabled?: boolean;
  refetchOnForeground?: boolean;
  staleTimeThreshold?: number; // Minimum time in ms since last fetch before refetching
}

/**
 * Hook that monitors app state changes and refetches queries when app comes to foreground
 * Useful for keeping data fresh when user returns to the app
 */
export function useAppStateRefresh(options: UseAppStateRefreshOptions = {}) {
  const {
    enabled = true,
    refetchOnForeground = true,
    staleTimeThreshold = 1000 * 60 * 5, // 5 minutes default
  } = options;

  const queryClient = useQueryClient();
  const appState = useRef(AppState.currentState);
  const lastFetchTime = useRef<number>(Date.now());

  useEffect(() => {
    if (!enabled || !refetchOnForeground) return;

    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // App came to foreground
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        const timeSinceLastFetch = Date.now() - lastFetchTime.current;

        // Only refetch if enough time has passed since last fetch
        if (timeSinceLastFetch >= staleTimeThreshold) {
          queryClient.invalidateQueries({ queryKey: ['recipes'] });
          lastFetchTime.current = Date.now();
        }
      }

      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [enabled, refetchOnForeground, staleTimeThreshold, queryClient]);
}
