import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * On native, localhost in .env points at the phone/emulator, not your PC.
 * Prefer the same host Expo uses for Metro (LAN IP) when the URL is loopback.
 * Android emulator: fall back to 10.0.2.2 (host loopback from the emulator).
 */
function resolveApiBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

  if (Platform.OS === 'web') {
    return fromEnv;
  }

  try {
    const parsed = new URL(fromEnv);
    const isLoopback =
      parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1';

    if (!isLoopback) {
      return fromEnv;
    }

    const hostUri = Constants.expoConfig?.hostUri;
    const devHost = hostUri?.split(':')[0];
    if (devHost && devHost !== 'localhost' && devHost !== '127.0.0.1') {
      parsed.hostname = devHost;
      return parsed.toString().replace(/\/$/, '');
    }

    if (Platform.OS === 'android') {
      parsed.hostname = '10.0.2.2';
      return parsed.toString().replace(/\/$/, '');
    }
  } catch {
    /* invalid EXPO_PUBLIC_API_URL */
  }

  return fromEnv;
}

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: resolveApiBaseUrl(),
    prepareHeaders: (headers: any) => {
      // Add authentication headers here if needed
      return headers;
    },
  }),
  tagTypes: ['User', 'Workout', 'Exercise', 'Activity'],
  endpoints: () => ({}), // Endpoints will be injected by features
});
