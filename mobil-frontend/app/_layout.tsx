import '../global.css';
import {
  Inter_400Regular,
  Inter_700Bold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter';
import {
  PlayfairDisplay_700Bold,
  useFonts as usePlayfairFonts,
} from '@expo-google-fonts/playfair-display';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import FlashMessage from 'react-native-flash-message';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { OfflineBanner } from '@components/common/OfflineBanner';
import { useAuthStore } from '@store/authStore';

void SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function RootLayout() {
  const initialize = useAuthStore((state) => state.initialize);
  const isInitialized = useAuthStore((state) => state.isInitialized);

  const [interFontsLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  const [playfairFontsLoaded] = usePlayfairFonts({
    PlayfairDisplay_700Bold,
  });

  const fontsLoaded = interFontsLoaded && playfairFontsLoaded;

  useEffect(() => {
    if (isInitialized && fontsLoaded) {
      SplashScreen.hideAsync().catch(() => undefined);
    }
  }, [isInitialized, fontsLoaded]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  if (!isInitialized || !fontsLoaded) {
    return null;
  }

  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="(auth)" />
          <Stack.Screen name="product/[id]" />
          <Stack.Screen name="category/[id]" />
          <Stack.Screen name="order/checkout" />
          <Stack.Screen name="order/history" />
          <Stack.Screen name="order/[id]" />
          <Stack.Screen name="+not-found" />
        </Stack>
        <OfflineBanner />
        <FlashMessage position="top" />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}
