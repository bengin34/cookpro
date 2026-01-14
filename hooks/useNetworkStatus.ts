import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

interface NetworkStatus {
  isOnline: boolean;
  isOffline: boolean;
  type: string | null;
  isWifi: boolean;
}

export function useNetworkStatus(): NetworkStatus {
  const [networkStatus, setNetworkStatus] = useState<NetworkStatus>({
    isOnline: true,
    isOffline: false,
    type: null,
    isWifi: false,
  });

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

    // Subscribe to network state changes
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

  return networkStatus;
}
