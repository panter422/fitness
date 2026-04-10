/**
 * GraphHopper Map Matching Service
 * 
 * Sends recorded GPS traces to a self-hosted GraphHopper instance
 * for route snapping (map matching). Returns snapped coordinates
 * that align with actual roads and paths.
 */

export interface GpsPoint {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface MatchedRoute {
  snappedPath: { latitude: number; longitude: number }[];
  distance: number;  // meters
  time: number;      // milliseconds
}

const DEFAULT_GRAPHHOPPER_URL = process.env.EXPO_PUBLIC_GRAPHHOPPER_URL || 'http://134.185.81.1:8989';

/**
 * Convert GPS points to GPX XML format for GraphHopper's /match endpoint
 */
function toGpxXml(points: GpsPoint[]): string {
  const trackpoints = points
    .map((p) => {
      const time = new Date(p.timestamp).toISOString();
      return `      <trkpt lat="${p.latitude}" lon="${p.longitude}"><time>${time}</time></trkpt>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<gpx version="1.1" creator="StreetEnergyTracker">
  <trk>
    <trkseg>
${trackpoints}
    </trkseg>
  </trk>
</gpx>`;
}

/**
 * Send a GPS trace to GraphHopper for map matching (route snapping)
 * 
 * @param gpsPoints - Array of GPS points with lat, lng, and timestamp
 * @param serverUrl - GraphHopper server URL (defaults to env variable)
 * @returns Snapped route with coordinates, distance, and time
 */
export async function matchGpsTrace(
  gpsPoints: GpsPoint[],
  serverUrl: string = DEFAULT_GRAPHHOPPER_URL,
): Promise<MatchedRoute> {
  if (gpsPoints.length < 2) {
    throw new Error('At least 2 GPS points are required for map matching');
  }

  const gpxXml = toGpxXml(gpsPoints);

  const response = await fetch(`${serverUrl}/match?profile=foot&type=json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/gpx+xml',
    },
    body: gpxXml,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Map matching failed: ${response.status} - ${errorText}`);
  }

  const data = await response.json();

  // GraphHopper returns paths[0] with points encoded as a polyline
  const matchedPath = data.paths?.[0];
  if (!matchedPath) {
    throw new Error('No matched path returned from GraphHopper');
  }

  // Decode the encoded polyline from GraphHopper
  const snappedPath = decodePolyline(matchedPath.points);

  return {
    snappedPath,
    distance: matchedPath.distance || 0,
    time: matchedPath.time || 0,
  };
}

/**
 * Decode a Google-encoded polyline string into an array of coordinates.
 * GraphHopper uses this format by default for the "points" field.
 */
function decodePolyline(encoded: string): { latitude: number; longitude: number }[] {
  const points: { latitude: number; longitude: number }[] = [];
  let index = 0;
  let lat = 0;
  let lng = 0;

  while (index < encoded.length) {
    let b: number;
    let shift = 0;
    let result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlat = result & 1 ? ~(result >> 1) : result >> 1;
    lat += dlat;

    shift = 0;
    result = 0;

    do {
      b = encoded.charCodeAt(index++) - 63;
      result |= (b & 0x1f) << shift;
      shift += 5;
    } while (b >= 0x20);

    const dlng = result & 1 ? ~(result >> 1) : result >> 1;
    lng += dlng;

    points.push({
      latitude: lat / 1e5,
      longitude: lng / 1e5,
    });
  }

  return points;
}
