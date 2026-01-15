import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  type: string | null;
  isWifi: boolean;
}

const defaultNetworkStatus: NetworkStatus = {
  isOnline: true,
  isOffline: false,
  type: null,
  isWifi: false,
};

const NetworkStatusContext = createContext<NetworkStatus>(defaultNetworkStatus);

interface NetworkStatusProviderProps {
  children: ReactNode;
}

/**
 * Provider that shares a single NetInfo listener across all components.
 * This prevents creating duplicate listeners when multiple components
 * use the useNetworkStatus hook (e.g., many RecipeCards with useCachedImage).
 */
export function NetworkStatusProvider({ children }: NetworkStatusProviderProps) {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>(defaultNetworkStatus);

  useEffect(() => {
    // Get initial network state
    NetInfo.fetch().then((state) => {
      setNetworkStatus({
        isOnline: state.isConnected ?? true,
        isOffline: !(state.isConnected ?? true),
        type: state.type,
        isWifi: state.type === 'wifi',
      });
    });

    // Subscribe to network state changes (single listener for entire app)
    const unsubscribe = NetInfo.addEventListener((state) => {
      setNetworkStatus({
        isOnline: state.isConnected ?? true,
        isOffline: !(state.isConnected ?? true),
        type: state.type,
        isWifi: state.type === 'wifi',
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <NetworkStatusContext.Provider value={networkStatus}>
      {children}
    </NetworkStatusContext.Provider>
  );
}

/**
 * Hook to access the shared network status.
 * Uses the context provided by NetworkStatusProvider.
 */
export function useNetworkStatusContext(): NetworkStatus {
  return useContext(NetworkStatusContext);
}
