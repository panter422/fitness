import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

// Define a service using a base URL and expected endpoints
export const api = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000',
    prepareHeaders: (headers: any) => {
      // Add authentication headers here if needed
      return headers;
    },
  }),
  tagTypes: ['User', 'Workout', 'Exercise'],
  endpoints: () => ({}), // Endpoints will be injected by features
});
