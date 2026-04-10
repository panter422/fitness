/**
 * Shared Activity types used across the activity feature module.
 */

export interface ActivityLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
}

export interface Activity {
  id: string;
  title: string;
  date: number;
  distance: number;   // in meters
  duration: number;    // in seconds
  elevation: number;   // in meters
  type: 'run' | 'ride' | 'hike';
  path: ActivityLocation[];
}
