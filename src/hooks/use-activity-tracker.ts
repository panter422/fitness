import { useState, useEffect, useRef } from 'react';
import * as Location from 'expo-location';
import { matchGpsTrace } from '@/src/services/map-matching';

export interface ActivityLocation {
  latitude: number;
  longitude: number;
  timestamp: number;
  altitude: number | null;
  speed: number | null;
}

export function useActivityTracker() {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  const [distance, setDistance] = useState(0); // in meters
  const [path, setPath] = useState<ActivityLocation[]>([]);
  const [currentLocation, setCurrentLocation] = useState<ActivityLocation | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

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
        const newPoint: ActivityLocation = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
          altitude: location.coords.altitude,
          speed: location.coords.speed,
        };

        setCurrentLocation(newPoint);

        if (isRecording && !isPaused) {
          setPath(prev => {
            if (prev.length > 0) {
              const lastPoint = prev[prev.length - 1];
              const d = calculateDistance(
                lastPoint.latitude,
                lastPoint.longitude,
                newPoint.latitude,
                newPoint.longitude
              );
              setDistance(prevDist => prevDist + d);
            }
            return [...prev, newPoint];
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

  const startRecording = () => {
    setIsRecording(true);
    setIsPaused(false);
    setElapsedTime(0);
    setDistance(0);
    setPath([]);
  };

  const pauseRecording = () => setIsPaused(true);
  const resumeRecording = () => setIsPaused(false);
  const stopRecording = () => {
    setIsRecording(false);
    setIsPaused(false);
    // Return final activity data for saving
    return {
      path,
      distance,
      duration: elapsedTime,
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
