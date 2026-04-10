import { useGetActivityQuery } from '../redux/activity-api';
import { useMergedActivities } from './use-merged-activities';

export function useActivityById(id: string | string[] | undefined) {
  const resolved = typeof id === 'string' ? id : Array.isArray(id) ? id[0] : undefined;
  const { activities, isLoading: listLoading } = useMergedActivities();
  const fromList = resolved ? activities.find((a) => a.id === resolved) : undefined;

  const { data: fromApi, isLoading: detailLoading } = useGetActivityQuery(resolved!, {
    skip: !resolved || !!fromList,
  });

  const activity = fromList ?? fromApi;
  const isLoading =
    !!resolved && !activity && (listLoading || detailLoading);

  return { activity, isLoading };
}
