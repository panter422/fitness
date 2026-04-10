import { useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useSelector } from 'react-redux';
import { useCreateActivityMutation, useGetActivitiesQuery } from '@/src/services/activity-api';
import type { RootState } from '@/src/store';

/**
 * After a successful activity list fetch, POST any local activities whose ids
 * are not on the server yet. Retries when the app returns to the foreground.
 */
export function useSyncActivitiesWithServer() {
  const { data: server = [], isSuccess, isFetching } = useGetActivitiesQuery();
  const local = useSelector((s: RootState) => s.activities.activities);
  const [createActivity] = useCreateActivityMutation();
  const inFlight = useRef(new Set<string>());
  const appState = useRef(AppState.currentState);
  const [foregroundTick, setForegroundTick] = useState(0);

  useEffect(() => {
    const onChange = (next: AppStateStatus) => {
      if (appState.current.match(/inactive|background/) && next === 'active') {
        setForegroundTick((n) => n + 1);
      }
      appState.current = next;
    };
    const sub = AppState.addEventListener('change', onChange);
    return () => sub.remove();
  }, []);

  const serverIdsStr = server
    .map((a) => a.id)
    .sort()
    .join(',');
  const localIdsStr = local
    .map((a) => a.id)
    .sort()
    .join(',');

  useEffect(() => {
    if (!isSuccess || isFetching) return;

    const serverIds = new Set(server.map((a) => a.id));
    const toSync = local.filter((l) => !serverIds.has(l.id));
    if (toSync.length === 0) return;

    let cancelled = false;

    const run = async () => {
      for (const activity of toSync) {
        if (cancelled) return;
        if (inFlight.current.has(activity.id)) continue;
        inFlight.current.add(activity.id);
        try {
          await createActivity(activity).unwrap();
        } catch {
          // Leave off server; user can retry via foreground or next fetch cycle
        } finally {
          inFlight.current.delete(activity.id);
        }
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [
    isSuccess,
    isFetching,
    serverIdsStr,
    localIdsStr,
    server,
    local,
    createActivity,
    foregroundTick,
  ]);
}
