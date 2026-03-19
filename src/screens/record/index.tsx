import { useActivityTracker } from "@/src/hooks/use-activity-tracker";
import { addActivity } from "@/src/store/activitySlice";
import { router } from "expo-router";
import {
  Clock,
  Map as MapIcon,
  Pause,
  Play,
  Route,
  Square,
} from "lucide-react-native";
import React, { useState } from "react";
import { TouchableOpacity, View } from "react-native";
import { MapView, Polyline, PROVIDER_GOOGLE } from "@/src/components/maps/safe-map-view";
import { Text } from "react-native-paper";
import Animated, {
  FadeInDown,
  FadeInRight,
  FadeInUp,
} from "react-native-reanimated";
import { useDispatch } from "react-redux";

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export default function RecordScreen() {
  const dispatch = useDispatch();
  const {
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
  } = useActivityTracker();

  const [mapType, setMapType] = useState<"standard" | "satellite">("standard");

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs > 0 ? hrs + ":" : ""}${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStop = () => {
    const finalData = stopRecording();
    const id = Math.random().toString(36).substring(7);

    dispatch(
      addActivity({
        id,
        title: "New Activity",
        date: Date.now(),
        distance: finalData.distance,
        duration: finalData.duration,
        elevation: Math.floor(finalData.distance / 50), // mocked elevation
        path: finalData.path.map((p) => ({
          latitude: p.latitude,
          longitude: p.longitude,
          timestamp: p.timestamp,
        })),
        type: "run",
      }),
    );

    router.push(`/activity/${id}` as any);
  };

  return (
    <View className="flex-1 bg-zinc-950">
      {/* Map View */}
      {currentLocation ? (
        <MapView
          provider={PROVIDER_GOOGLE}
          className="flex-1"
          customMapStyle={darkMapStyle}
          mapType={mapType}
          initialRegion={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          region={{
            latitude: currentLocation.latitude,
            longitude: currentLocation.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          }}
          showsUserLocation
          followsUserLocation
        >
          {path.length > 1 && (
            <Polyline
              coordinates={path}
              strokeColor="#0df2f2" // Teal
              strokeWidth={6}
            />
          )}
        </MapView>
      ) : (
        <View className="flex-1 items-center justify-center">
          <Text className="text-zinc-500 font-bold uppercase tracking-widest">
            Searching for GPS...
          </Text>
        </View>
      )}

      {/* Top Overlay Stats */}
      <Animated.View
        entering={FadeInDown.duration(600).springify()}
        className="absolute top-12 left-6 right-6 flex-row justify-between"
      >
        {[
          {
            label: "Time",
            val: formatTime(elapsedTime),
            icon: Clock,
            color: "#0df2f2",
          },
          {
            label: "Distance",
            val: `${(distance / 1000).toFixed(2)} km`,
            icon: Route,
            color: "#ff00ff",
          },
        ].map((stat, i) => (
          <View
            key={i}
            className="bg-zinc-900/90 border border-zinc-800 p-4 rounded-3xl w-[48%] backdrop-blur-md"
          >
            <View className="flex-row items-center mb-1">
              <stat.icon size={12} color={stat.color} strokeWidth={3} />
              <Text className="text-zinc-500 text-[10px] uppercase font-bold ml-1.5 tracking-tighter">
                {stat.label}
              </Text>
            </View>
            <Text
              style={{ fontFamily: "BarlowCondensed-Bold" }}
              className="text-2xl text-white italic"
            >
              {stat.val}
            </Text>
          </View>
        ))}
      </Animated.View>

      {/* Map Toggle */}
      <AnimatedTouchableOpacity
        entering={FadeInRight.delay(400).duration(600).springify()}
        onPress={() =>
          setMapType(mapType === "standard" ? "satellite" : "standard")
        }
        className="absolute bottom-40 right-6 h-12 w-12 rounded-full bg-zinc-900/90 border border-zinc-800 items-center justify-center"
      >
        <MapIcon size={20} color="#0df2f2" />
      </AnimatedTouchableOpacity>

      {/* Control Panel */}
      <Animated.View
        entering={FadeInUp.duration(600).springify()}
        className="absolute bottom-0 left-0 right-0 p-8 pt-12 rounded-t-[40px] bg-zinc-950 border-t border-zinc-900"
      >
        <View className="flex-row justify-between items-center">
          <View>
            <Text className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">
              Current Speed
            </Text>
            <View className="flex-row items-baseline">
              <Text
                style={{ fontFamily: "BarlowCondensed-Bold" }}
                className="text-4xl text-white italic"
              >
                {currentLocation?.speed
                   ? (currentLocation.speed * 3.6).toFixed(1)
                  : "0.0"}
              </Text>
              <Text className="text-zinc-600 text-[10px] font-bold ml-1 uppercase">
                KM/H
              </Text>
            </View>
          </View>

          <View className="flex-row space-x-4">
            {!isRecording ? (
              <TouchableOpacity
                onPress={startRecording}
                className="h-20 w-20 rounded-full bg-cyan-400 items-center justify-center shadow-lg shadow-cyan-500/50"
              >
                <Play size={32} color="#000" fill="#000" />
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={isPaused ? resumeRecording : pauseRecording}
                  className={`h-20 w-20 rounded-full items-center justify-center ${isPaused ? "bg-cyan-400" : "bg-zinc-800 border-2 border-zinc-700"}`}
                >
                  {isPaused ? (
                    <Play size={32} color="#000" fill="#000" />
                  ) : (
                    <Pause size={32} color="#fff" fill="#fff" />
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleStop}
                  className="h-20 w-20 rounded-full bg-red-500 items-center justify-center shadow-lg shadow-red-500/50"
                >
                  <Square size={28} color="#fff" fill="#fff" />
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Animated.View>
    </View>
  );
}

const darkMapStyle = [
  { elementType: "geometry", stylers: [{ color: "#18181b" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#71717a" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#18181b" }] },
  {
    featureType: "administrative.country",
    elementType: "geometry.stroke",
    stylers: [{ color: "#3f3f46" }],
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#27272a" }],
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#09090b" }],
  },
];
