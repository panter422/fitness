import React, { useRef, useEffect } from 'react';
import { Map, Source, Layer, GeolocateControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { MapRef } from 'react-map-gl/maplibre';
import type { LineLayerSpecification } from 'maplibre-gl';
import { FeatureCollection } from 'geojson';

const OPENFREEMAP_DARK_STYLE = 'https://tiles.openfreemap.org/styles/dark';

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
  scrollEnabled = true,
  zoomEnabled = true,
  style,
  trailCoordinates = [],
  trailColor = '#0df2f2',
  trailWidth = 4,
}: MapLibreViewProps) {
  const mapRef = useRef<MapRef>(null);

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

  const trailLayerStyle: LineLayerSpecification = {
    id: 'trail-layer',
    type: 'line',
    source: 'trail-source',
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': trailColor,
      'line-width': trailWidth,
    },
  };

  // Follow region changes
  useEffect(() => {
    if (region && mapRef.current) {
      mapRef.current.flyTo({
        center: [region.longitude, region.latitude],
        zoom: 16,
        duration: 500,
      });
    }
  }, [region?.latitude, region?.longitude]);

  const center = region
    ? { longitude: region.longitude, latitude: region.latitude }
    : initialRegion
      ? { longitude: initialRegion.longitude, latitude: initialRegion.latitude }
      : { longitude: 125.5, latitude: 7.1 }; // Default: Davao del Sur

  return (
    <div style={{ flex: 1, width: '100%', height: '100%', ...style }}>
      <Map
        ref={mapRef}
        initialViewState={{
          longitude: center.longitude,
          latitude: center.latitude,
          zoom: 16,
        }}
        mapStyle={OPENFREEMAP_DARK_STYLE}
        interactive={scrollEnabled}
        scrollZoom={zoomEnabled}
        attributionControl={false}
        style={{ width: '100%', height: '100%' }}
      >
        {showsUserLocation && (
          <GeolocateControl
            positionOptions={{ enableHighAccuracy: true }}
            trackUserLocation
          />
        )}

        {trailCoordinates.length > 1 && (
          <Source id="trail-source" type="geojson" data={trailGeoJSON}>
            <Layer {...trailLayerStyle} />
          </Source>
        )}
      </Map>
    </div>
  );
}
