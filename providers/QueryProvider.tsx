import { QueryClient } from '@tanstack/react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ReactNode } from 'react';

// Create a client with offline-first configuration
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 60 * 24, // 24 hours (increased from 10min)
      refetchOnMount: 'always', // Always check for updates on mount
      refetchOnWindowFocus: true, // Refetch when app comes to foreground
      refetchOnReconnect: true, // Refetch when connection restored
      networkMode: 'offlineFirst', // Use cache when offline
    },
  },
});

// Create persister for AsyncStorage
const persister = {
  persistClient: async (client: any) => {
    await AsyncStorage.setItem('REACT_QUERY_OFFLINE_CACHE', JSON.stringify(client));
  },
  restoreClient: async () => {
    const cachedData = await AsyncStorage.getItem('REACT_QUERY_OFFLINE_CACHE');
    return cachedData ? JSON.parse(cachedData) : undefined;
  },
  removeClient: async () => {
    await AsyncStorage.removeItem('REACT_QUERY_OFFLINE_CACHE');
  },
};

interface QueryProviderProps {
  children: ReactNode;
}

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days cache
        buster: 'v1', // Increment to force cache clear
        dehydrateOptions: {
          shouldDehydrateQuery: (query) => {
            // Only persist recipe queries, not transient data
            return query.queryKey[0] === 'recipes';
          },
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}

// Export queryClient for use in other files (e.g., pantryStore)
export { queryClient };
