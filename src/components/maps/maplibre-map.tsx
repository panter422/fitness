import React, { useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import MapLibreGL from '@maplibre/maplibre-react-native';
import { FeatureCollection } from 'geojson';


const OPENFREEMAP_BRIGHT_STYLE = 'https://tiles.openfreemap.org/styles/bright';

export interface MapLibreViewProps {
  initialRegion?: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  region?: {
    latitude: number;
    longitude: number;
    latitudeDelta?: number;
    longitudeDelta?: number;
  };
  showsUserLocation?: boolean;
  followsUserLocation?: boolean;
  scrollEnabled?: boolean;
  zoomEnabled?: boolean;
  pitchEnabled?: boolean;
  className?: string;
  style?: any;
  trailCoordinates?: { latitude: number; longitude: number }[];
  trailColor?: string;
  trailWidth?: number;
  children?: React.ReactNode;
}

export default function MapLibreView({
  initialRegion,
  region,
  showsUserLocation = false,
  followsUserLocation = false,
  scrollEnabled = true,
  zoomEnabled = true,
  style,
  trailCoordinates = [],
  trailColor = '#0df2f2',
  trailWidth = 4,
}: MapLibreViewProps) {
  const cameraRef = useRef<any>(null);

  // Build GeoJSON for the trail
  const trailGeoJSON: FeatureCollection = {
    type: 'FeatureCollection',
    features: trailCoordinates.length > 1
      ? [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: trailCoordinates.map((c) => [c.longitude, c.latitude]),
            },
          },
        ]
      : [],
  };

  // Follow user location when region changes
  useEffect(() => {
    if (region && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [region.longitude, region.latitude],
        zoomLevel: 16,
        animationDuration: 500,
      });
    }
  }, [region?.latitude, region?.longitude, region]);

  const centerCoord = region
    ? [region.longitude, region.latitude]
    : initialRegion
      ? [initialRegion.longitude, initialRegion.latitude]
      : [125.5, 7.1]; // Default: Davao del Sur

  return (
    <View style={[styles.container, style]}>
      <MapLibreGL.MapView
        style={styles.map}
        mapStyle={OPENFREEMAP_BRIGHT_STYLE}
        scrollEnabled={scrollEnabled}
        zoomEnabled={zoomEnabled}
        pitchEnabled={false}
        attributionEnabled={false}
        logoEnabled={false}
      >
        <MapLibreGL.Camera
          ref={cameraRef}
          defaultSettings={{
            centerCoordinate: centerCoord,
            zoomLevel: 16,
          }}
          followUserLocation={followsUserLocation}
        />

        {showsUserLocation && (
          <MapLibreGL.UserLocation
            visible={true}
            animated={true}
            renderMode="native"
          />
        )}

        {trailCoordinates.length > 1 && (
          <MapLibreGL.ShapeSource id="trail-source" shape={trailGeoJSON}>
            <MapLibreGL.LineLayer
              id="trail-layer"
              style={{
                lineColor: trailColor,
                lineWidth: trailWidth,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </MapLibreGL.ShapeSource>
        )}
      </MapLibreGL.MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
});
