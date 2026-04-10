import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { PaperProvider } from 'react-native-paper';
import * as SplashScreen from 'expo-splash-screen';
import { useFonts } from 'expo-font';
import { 
  Lexend_400Regular, 
  Lexend_700Bold, 
  Lexend_900Black 
} from '@expo-google-fonts/lexend';
import { Inter_400Regular, Inter_700Bold } from '@expo-google-fonts/inter';
import { useEffect } from 'react';
import 'react-native-reanimated';

import '../global.css';
import { store, persistor } from '@/src/store';
import { useSyncActivitiesWithServer } from '@/src/features/activity';

function ActivitySyncBootstrap() {
  useSyncActivitiesWithServer();
  return null;
}

SplashScreen.preventAutoHideAsync();

const NitroTrailTheme = {
  ...DarkTheme,
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: '#0df2f2',
    background: '#0a0a0a',
    card: '#18181b',
    text: '#ffffff',
    border: '#27272a',
    notification: '#ff00ff',
  },
};

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const [loaded, error] = useFonts({
    'Lexend-Regular': Lexend_400Regular,
    'Lexend-Bold': Lexend_700Bold,
    'Lexend-Black': Lexend_900Black,
    'Inter-Regular': Inter_400Regular,
    'Inter-Bold': Inter_700Bold,
  });

  useEffect(() => {
    if (loaded || error) {
      SplashScreen.hideAsync();
    }
  }, [loaded, error]);

  if (!loaded && !error) {
    return null;
  }

  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <PaperProvider>
          <ThemeProvider value={NitroTrailTheme}>
            <ActivitySyncBootstrap />
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="activity/[id]" options={{ presentation: 'modal', title: 'Activity Summary' }} />
            </Stack>
            <StatusBar style="light" />
          </ThemeProvider>
        </PaperProvider>
      </PersistGate>
    </Provider>
  );
}
