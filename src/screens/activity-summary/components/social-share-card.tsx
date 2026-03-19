import React, { forwardRef } from 'react';
import { View } from 'react-native';
import { Text } from 'react-native-paper';
import { MapPin, Route, Clock } from 'lucide-react-native';
import { MapView, Polyline, PROVIDER_GOOGLE } from '@/src/components/maps/safe-map-view';

interface SocialShareCardProps {
  activity: {
    title: string;
    distance: number;
    duration: number;
    date: number;
    path: { latitude: number; longitude: number; timestamp: number }[];
  };
}

export const SocialShareCard = forwardRef<View, SocialShareCardProps>(({ activity }, ref) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View 
      ref={ref} 
      collapsable={false}
      style={{ width: 400, height: 400, backgroundColor: '#09090b', padding: 24, borderRadius: 0 }}
    >
      {/* Background Glow */}
      <View style={{ position: 'absolute', top: -50, right: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#0df2f2', opacity: 0.1 }} />
      <View style={{ position: 'absolute', bottom: -50, left: -50, width: 200, height: 200, borderRadius: 100, backgroundColor: '#ff00ff', opacity: 0.1 }} />

      <View className="flex-1 justify-between">
        <View>
          <Text style={{ fontFamily: 'BarlowCondensed-Bold' }} className="text-zinc-500 text-xs uppercase tracking-widest mb-1">Activity Record</Text>
          <Text style={{ fontFamily: 'BarlowCondensed-Bold' }} className="text-4xl text-white uppercase italic leading-none mb-2">
            {activity.title}
          </Text>
          <View className="flex-row items-center">
            <MapPin size={10} color="#0df2f2" />
            <Text className="text-zinc-400 text-[10px] ml-1 font-bold uppercase tracking-widest">
              {new Date(activity.date).toLocaleDateString()}
            </Text>
          </View>
        </View>

        {/* Mini Map Snapshot for Sharing */}
        <View className="h-32 w-full rounded-2xl overflow-hidden border border-zinc-800 my-4 bg-zinc-900">
           <MapView
            provider={PROVIDER_GOOGLE}
            className="flex-1"
            customMapStyle={darkMapStyle}
            initialRegion={{
              latitude: activity.path[0].latitude,
              longitude: activity.path[0].longitude,
              latitudeDelta: 0.01,
              longitudeDelta: 0.01,
            }}
            liteMode
          >
            <Polyline
              coordinates={activity.path}
              strokeColor="#0df2f2"
              strokeWidth={4}
            />
          </MapView>
        </View>

        <View className="flex-row justify-between items-end">
          <View>
            <View className="flex-row items-center mb-1">
              <Route size={12} color="#0df2f2" />
              <Text className="text-zinc-500 text-[8px] uppercase font-bold ml-1.5">Distance</Text>
            </View>
            <Text style={{ fontFamily: 'BarlowCondensed-Bold' }} className="text-3xl text-white italic">
              {(activity.distance / 1000).toFixed(2)} <Text className="text-sm">KM</Text>
            </Text>
          </View>

          <View className="items-end">
             <View className="flex-row items-center mb-1">
              <Clock size={12} color="#ff00ff" />
              <Text className="text-zinc-500 text-[8px] uppercase font-bold ml-1.5">Duration</Text>
            </View>
            <Text style={{ fontFamily: 'BarlowCondensed-Bold' }} className="text-3xl text-white italic text-right">
              {formatTime(activity.duration)}
            </Text>
          </View>
        </View>

        <View className="mt-4 pt-4 border-t border-zinc-900 flex-row justify-between items-center">
          <Text className="text-zinc-700 text-[8px] font-bold uppercase tracking-widest">Street Energy Tracker</Text>
          <View className="flex-row">
            <View className="h-2 w-2 rounded-full bg-cyan-400 mr-1" />
            <View className="h-2 w-2 rounded-full bg-pink-500 mr-1" />
            <View className="h-2 w-2 rounded-full bg-zinc-800" />
          </View>
        </View>
      </View>
    </View>
  );
});

SocialShareCard.displayName = 'SocialShareCard';

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#18181b" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#71717a" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#18181b" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#27272a" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#09090b" }] }
];
