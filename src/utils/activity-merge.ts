import type { Activity } from '@/src/services/activity-api';

/**
 * If the API row has no path but Redux still does (e.g. partial write), keep the local route.
 */
function withBestPath(server: Activity, local: Activity | undefined): Activity {
  if (!local) return server;
  const sLen = server.path?.length ?? 0;
  const lLen = local.path?.length ?? 0;
  if (lLen > 0 && sLen === 0) {
    return { ...server, path: local.path };
  }
  return server;
}

/**
 * Merges server-backed activities with local-only rows (e.g. failed or pending sync).
 * On id collision, server fields win except we preserve a local path when the server has none.
 */
export function mergeActivities(server: Activity[], local: Activity[]): Activity[] {
  const localById = new Map(local.map((a) => [a.id, a]));
  const merged: Activity[] = [];
  const seen = new Set<string>();

  for (const s of server) {
    merged.push(withBestPath(s, localById.get(s.id)));
    seen.add(s.id);
  }

  for (const l of local) {
    if (!seen.has(l.id)) {
      merged.push(l);
      seen.add(l.id);
    }
  }

  merged.sort((a, b) => Number(b.date) - Number(a.date));
  return merged;
}
