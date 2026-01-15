import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';
import { useQueryClient } from '@tanstack/react-query';

import { useColorScheme } from '@/components/useColorScheme';
import { QueryProvider } from '@/providers/QueryProvider';
import { NetworkStatusProvider } from '@/providers/NetworkStatusProvider';
import { fetchRecipes } from '@/lib/recipesApi';
import { initImageCache } from '@/lib/imageCache';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: 'onboarding',
};

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // Initialize image cache directory on app launch
  useEffect(() => {
    initImageCache();
  }, []);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <QueryProvider>
      <NetworkStatusProvider>
        <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
          <PrefetchWrapper>
            <Stack>
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen
                name="recipes/[id]"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="recipes/[id]/cook"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen
                name="shopping-list"
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen name="dialogs" options={{ headerShown: false }} />
            </Stack>
          </PrefetchWrapper>
        </ThemeProvider>
      </NetworkStatusProvider>
    </QueryProvider>
  );
}

function PrefetchWrapper({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Background prefetch recipes on app launch (non-blocking)
    queryClient.prefetchQuery({
      queryKey: ['recipes'],
      queryFn: fetchRecipes,
      staleTime: 1000 * 60 * 5, // 5 minutes
    });
  }, [queryClient]);

  return <>{children}</>;
}
