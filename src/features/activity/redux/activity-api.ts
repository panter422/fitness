import { api } from '@/src/services/api';
import type { Activity, ActivityLocation } from '../types';

// Re-export types for consumer convenience
export type { Activity, ActivityLocation };

function normalizeActivityFromApi(raw: unknown): Activity {
  const a = raw as Record<string, unknown>;
  const pathRaw = Array.isArray(a.path) ? a.path : [];
  const path = pathRaw.map((p) => {
    const pt = p as Record<string, unknown>;
    return {
      latitude: Number(pt.latitude),
      longitude: Number(pt.longitude),
      timestamp: Number(pt.timestamp),
    };
  });
  return {
    id: String(a.id),
    title: String(a.title),
    date: Number(a.date),
    distance: Number(a.distance),
    duration: Number(a.duration),
    elevation: Number(a.elevation),
    type: a.type as Activity['type'],
    path,
  };
}

export const activityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query<Activity[], void>({
      query: () => '/activities',
      transformResponse: (response: unknown) =>
        Array.isArray(response)
          ? response.map((row) => normalizeActivityFromApi(row))
          : [],
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Activity' as const, id })),
              { type: 'Activity', id: 'LIST' },
            ]
          : [{ type: 'Activity', id: 'LIST' }],
    }),
    getActivity: builder.query<Activity, string>({
      query: (id) => `/activities/${id}`,
      transformResponse: (response: unknown) => normalizeActivityFromApi(response),
      providesTags: (_result, _error, id) => [{ type: 'Activity', id }],
    }),
    createActivity: builder.mutation<Activity, Activity>({
      query: (activity) => ({
        url: '/activities',
        method: 'POST',
        body: activity,
      }),
      transformResponse: (response: unknown) => normalizeActivityFromApi(response),
      invalidatesTags: [{ type: 'Activity', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetActivitiesQuery,
  useGetActivityQuery,
  useCreateActivityMutation,
} = activityApi;
