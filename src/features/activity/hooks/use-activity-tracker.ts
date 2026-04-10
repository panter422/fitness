import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { matchGpsTrace } from '../utils/map-matching';

export interface ActivityLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude: number | null;
  speed: number | null;
}

/** ~San Francisco — used when simulating without a real GPS fix. */
const DEV_SIM_DEFAULT_LAT = 37.7749;
const DEV_SIM_DEFAULT_LNG = -122.4194;

export function useActivityTracker() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [distance, setDistance] = useState(0); // in meters
  const [path, setPath] = useState<ActivityLocation[]>([]);
  const [currentLocation, setCurrentLocation] = useState<ActivityLocation | null>(null);
  const [devSimulatedWalk, setDevSimulatedWalk] = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  /** Latest values for stopRecording — state closures can lag one frame behind GPS updates. */
  const pathRef = useRef<ActivityLocation[]>([]);
  const distanceRef = useRef(0);
  const elapsedRef = useRef(0);
  const devSimulatedWalkRef = useRef(false);
  const simStepRef = useRef(0);
  const isRecordingRef = useRef(isRecording);
  const isPausedRef = useRef(isPaused);

  useEffect(() => {
    devSimulatedWalkRef.current = devSimulatedWalk;
  }, [devSimulatedWalk]);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);
  useEffect(() => {
    isPausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    pathRef.current = path;
  }, [path]);
  useEffect(() => {
    distanceRef.current = distance;
  }, [distance]);
  useEffect(() => {
    elapsedRef.current = elapsedTime;
  }, [elapsedTime]);

  // Dev: map preview without waiting for emulator GPS
  useEffect(() => {
    if (!__DEV__ || !devSimulatedWalk || currentLocation) return;
    const t = Date.now();
    setCurrentLocation({
      latitude: DEV_SIM_DEFAULT_LAT,
      longitude: DEV_SIM_DEFAULT_LNG,
      timestamp: t,
      altitude: null,
      speed: null,
    });
  }, [devSimulatedWalk, currentLocation]);

  // Timer Logic
  useEffect(() => {
    if (isRecording && !isPaused) {
      timerRef.current = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording, isPaused]);

  // Location Logic
  const startLocationTracking = useRef(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') return;

    locationSubscription.current = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        distanceInterval: 5, // update every 5 meters
      },
      (location) => {
        if (devSimulatedWalkRef.current && isRecordingRef.current) {
          return;
        }

        const newPoint: ActivityLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
          altitude: location.coords.altitude,
          speed: location.coords.speed,
        };

        setCurrentLocation(newPoint);

        if (isRecordingRef.current && !isPausedRef.current) {
          setPath(prev => {
            if (prev.length > 0) {
              const lastPoint = prev[prev.length - 1];
              const d = calculateDistance(
                lastPoint.latitude,
                lastPoint.longitude,
                newPoint.latitude,
                newPoint.longitude
              );
              setDistance(prevDist => {
                const next = prevDist + d;
                distanceRef.current = next;
                return next;
              });
            }
            const next = [...prev, newPoint];
            pathRef.current = next;
            return next;
          });
        }
      }
    );
  });

  useEffect(() => {
    startLocationTracking.current();
    return () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
      }
    };
  }, [isRecording, isPaused]);

  // __DEV__: fake ~6 m steps along a short path while recording
  useEffect(() => {
    if (!__DEV__ || !devSimulatedWalk || !isRecording || isPaused) return;

    simStepRef.current = 0;
    const id = setInterval(() => {
      simStepRef.current += 1;
      const i = simStepRef.current;
      const prev = pathRef.current;
      const last = prev[prev.length - 1];
      if (!last) return;

      const dLat = 0.000054;
      const dLon = Math.sin(i * 0.4) * 0.000018;
      const newPoint: ActivityLocation = {
        latitude: last.latitude + dLat,
        longitude: last.longitude + dLon,
        timestamp: Date.now(),
        altitude: null,
        speed: 2.2,
      };

      const d = calculateDistance(
        last.latitude,
        last.longitude,
        newPoint.latitude,
        newPoint.longitude
      );

      setCurrentLocation(newPoint);
      setDistance(dist => {
        const next = dist + d;
        distanceRef.current = next;
        return next;
      });
      setPath(p => {
        const next = [...p, newPoint];
        pathRef.current = next;
        return next;
      });
    }, 750);

    return () => clearInterval(id);
  }, [devSimulatedWalk, isRecording, isPaused]);

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setElapsedTime(0);
    setDistance(0);
    distanceRef.current = 0;
    setPath([]);
    pathRef.current = [];

    if (__DEV__ && devSimulatedWalk) {
      const base =
        currentLocation ??
        ({
          latitude: DEV_SIM_DEFAULT_LAT,
          longitude: DEV_SIM_DEFAULT_LNG,
          timestamp: Date.now(),
          altitude: null,
          speed: null,
        } satisfies ActivityLocation);
      const seed: ActivityLocation = {
        latitude: base.latitude,
        longitude: base.longitude,
        timestamp: Date.now(),
        altitude: base.altitude,
        speed: base.speed ?? 2,
      };
      setCurrentLocation(seed);
      setPath([seed]);
      pathRef.current = [seed];
    }
  };

  const pauseRecording = () => setIsPaused(true);
  const resumeRecording = () => setIsPaused(false);
  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    return {
      path: pathRef.current,
      distance: distanceRef.current,
      duration: elapsedRef.current,
      endTime: Date.now(),
    };
  };

  const snapToRoads = async () => {
    if (path.length < 2) return null;
    try {
      const result = await matchGpsTrace(path);
      setPath(result.snappedPath.map(p => ({
        ...p,
        timestamp: Date.now(), // dummy timestamp for snapped points
        altitude: null,
        speed: null
      })));
      setDistance(result.distance);
      return result;
    } catch (error) {
      console.error('Failed to snap to roads:', error);
      return null;
    }
  };

  return {
    isRecording,
    isPaused,
    elapsedTime,
    distance,
    path,
    currentLocation,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    snapToRoads,
    devSimulatedWalk,
    setDevSimulatedWalk,
  };
};

// Haversine formula for distance
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000; // Earth radius in meters
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}
