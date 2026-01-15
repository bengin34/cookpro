import { useNetworkStatusContext } from '@/providers/NetworkStatusProvider';

export interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  type: string | null;
  isWifi: boolean;
}

/**
 * Hook to access the shared network status from NetworkStatusProvider.
 *
 * IMPORTANT: This hook now uses a shared context instead of creating
 * individual NetInfo listeners. This prevents performance issues when
 * many components (e.g., RecipeCards) use this hook simultaneously.
 *
 * Make sure NetworkStatusProvider is wrapped around your app in _layout.tsx.
 */
export function useNetworkStatus(): NetworkStatus {
  return useNetworkStatusContext();
}
