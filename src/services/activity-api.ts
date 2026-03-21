import { api } from './api';

export interface ActivityLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface Activity {
  id: string;
  title: string;
  date: number;
  distance: number;
  duration: number;
  elevation: number;
  type: 'run' | 'ride' | 'hike';
  path: ActivityLocation[];
}

export const activityApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getActivities: builder.query<Activity[], void>({
      query: () => '/activities',
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
      providesTags: (result, error, id) => [{ type: 'Activity', id }],
    }),
    createActivity: builder.mutation<Activity, Activity>({
      query: (activity) => ({
        url: '/activities',
        method: 'POST',
        body: activity,
      }),
      invalidatesTags: [{ type: 'Activity', id: 'LIST' }],
    }),
  }),
});

export const {
  useGetActivitiesQuery,
  useGetActivityQuery,
  useCreateActivityMutation,
} = activityApi;
