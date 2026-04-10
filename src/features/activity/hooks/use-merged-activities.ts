import { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useGetActivitiesQuery } from '../redux/activity-api';
import type { RootState } from '@/src/store';
import { mergeActivities } from '../utils/activity-merge';

export function useMergedActivities() {
  const { data: server = [], isLoading, isError, refetch, isFetching, isSuccess } =
    useGetActivitiesQuery();
  const local = useSelector((s: RootState) => s.activities.activities);

  const activities = useMemo(() => mergeActivities(server, local), [server, local]);

  return {
    activities,
    isLoading,
    isError,
    isFetching,
    isSuccess,
    refetch,
  };
}
