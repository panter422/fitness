import React, { useRef } from 'react';
import { View, ScrollView, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { Text } from 'react-native-paper';
import { useLocalSearchParams, router } from 'expo-router';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { MapView, Polyline, PROVIDER_GOOGLE } from '@/components/safe-map-view';
import { Share2, X, MapPin, Clock, Route, Zap, TrendingUp } from 'lucide-react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';
import { SocialShareCard } from '@/components/social-share-card';

export default function ActivitySummaryScreen() {
  const { id } = useLocalSearchParams();
  const shareCardRef = useRef<View>(null);
  
  const activity = useSelector((state: RootState) => 
    state.activities.activities.find(a => a.id === id)
  );

  const handleShare = async () => {
    try {
      const uri = await captureRef(shareCardRef, {
        format: 'png',
        quality: 0.8,
      });

      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      } else {
        Alert.alert('Sharing not available', 'Save the screenshot to your gallery instead.');
      }
    } catch (error) {
      console.error('Failed to capture share card:', error);
      Alert.alert('Error', 'Failed to generate share image.');
    }
  };

  if (!activity) {
    return (
      <View className="flex-1 bg-zinc-950 items-center justify-center">
        <Text className="text-white">Activity not found</Text>
      </View>
    );
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="h-10 w-10 rounded-full bg-zinc-900 items-center justify-center">
            <X size={20} color="#fff" />
          </TouchableOpacity>
          <Text style={{ fontFamily: 'BarlowCondensed-Bold' }} className="text-xl text-white uppercase italic">Activity Recap</Text>
          <TouchableOpacity 
            onPress={handleShare}
            className="h-10 w-10 rounded-full bg-zinc-900 items-center justify-center"
          >
            <Share2 size={20} color="#0df2f2" />
          </TouchableOpacity>
        </View>

        {/* Hidden Social Share Card for capture */}
        <View style={{ position: 'absolute', top: -1000, left: -1000 }}>
          <SocialShareCard ref={shareCardRef} activity={activity} />
        </View>

        {/* Hero Title */}
        <View className="mb-6">
          <Text style={{ fontFamily: 'BarlowCondensed-Bold' }} className="text-4xl text-white uppercase italic leading-none">
            {activity.title}
          </Text>
          <View className="flex-row items-center mt-2">
            <MapPin size={12} color="#52525b" />
            <Text className="text-zinc-500 text-xs ml-1 font-bold uppercase tracking-widest">
              {new Date(activity.date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}
            </Text>
          </View>
        </View>

        {/* Map Snapshot */}
        <View className="h-60 rounded-3xl overflow-hidden border border-zinc-900 mb-8">
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
            scrollEnabled={false}
            zoomEnabled={false}
          >
            <Polyline
              coordinates={activity.path}
              strokeColor="#0df2f2"
              strokeWidth={4}
            />
          </MapView>
        </View>

        {/* Key Stats Row */}
        <View className="flex-row justify-between mb-8">
          {[
            { label: 'Distance', val: `${(activity.distance / 1000).toFixed(2)}`, unit: 'KM', icon: Route, color: '#0df2f2' },
            { label: 'Duration', val: formatTime(activity.duration), unit: 'MIN', icon: Clock, color: '#ff00ff' },
            { label: 'Avg Pace', val: `${(activity.duration / (activity.distance/1000)).toFixed(1)}`, unit: 'M/K', icon: Zap, color: '#25f447' },
          ].map((stat, i) => (
            <View key={i} className="items-center flex-1">
              <View className="h-10 w-10 rounded-full bg-zinc-900 items-center justify-center mb-2">
                <stat.icon size={16} color={stat.color} />
              </View>
              <Text className="text-zinc-600 text-[10px] uppercase font-bold mb-1">{stat.label}</Text>
              <View className="flex-row items-baseline">
                <Text style={{ fontFamily: 'BarlowCondensed-Bold' }} className="text-2xl text-white italic">{stat.val}</Text>
                <Text className="text-zinc-600 text-[8px] font-bold ml-0.5">{stat.unit}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Elevation Chart Placeholder */}
        <View className="p-6 rounded-3xl bg-zinc-900 border border-zinc-800 mb-8">
          <View className="flex-row justify-between items-center mb-6">
            <Text className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Elevation</Text>
            <View className="flex-row items-center">
              <TrendingUp size={14} color="#25f447" />
              <Text className="text-white text-xs font-bold ml-1">{activity.elevation}m Gain</Text>
            </View>
          </View>
          <View className="h-20 flex-row items-end justify-between">
            {[20, 45, 30, 60, 80, 50, 40, 70, 90, 65].map((h, i) => (
              <View key={i} className="w-[8%] bg-zinc-800/50 rounded-t-sm" style={{ height: `${h}%` }}>
                <View className="w-full bg-cyan-400 opacity-30" style={{ height: '100%' }} />
              </View>
            ))}
          </View>
        </View>

        <TouchableOpacity 
          onPress={() => router.push('/explore')}
          className="h-16 w-full bg-cyan-400 rounded-3xl items-center justify-center mb-12 shadow-lg shadow-cyan-500/50"
        >
          <Text className="text-black font-bold uppercase tracking-widest">Back to Feed</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#18181b" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#71717a" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#18181b" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#27272a" }] },
  { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#09090b" }] }
];
