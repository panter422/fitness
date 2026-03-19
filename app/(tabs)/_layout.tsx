import { Tabs } from 'expo-router';
import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withRepeat, 
  withTiming, 
  withSequence,
  interpolate,
  Extrapolate
} from 'react-native-reanimated';

import { HapticTab } from '@/components/haptic-tab';
import { LayoutDashboard, History, CirclePlay } from 'lucide-react-native';

function GlowPulse({ focused }: { focused: boolean }) {
  const pulse = useSharedValue(1);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000 }),
        withTiming(1, { duration: 1000 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulse.value }],
      opacity: interpolate(pulse.value, [1, 1.2], [0.3, 0], Extrapolate.CLAMP),
    };
  });

  return (
    <View className="items-center justify-center">
      <Animated.View 
        style={[{ position: 'absolute', width: 64, height: 64, borderRadius: 32, backgroundColor: focused ? '#ff00ff' : '#0df2f2' }, animatedStyle]} 
      />
      <View className={`h-16 w-16 -mt-8 rounded-full bg-zinc-900 border-2 items-center justify-center elevation-lg shadow-xl shadow-black ${focused ? 'border-pink-500' : 'border-zinc-800'}`}>
        <CirclePlay size={32} color={focused ? '#ff00ff' : '#0df2f2'} strokeWidth={2.5} />
      </View>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#0df2f2', // Teal
        tabBarInactiveTintColor: '#52525b',
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#09090b', // zinc-950
          borderTopColor: '#18181b',
          height: 80,
          paddingBottom: 20,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Stats',
          tabBarIcon: ({ color }) => <LayoutDashboard size={24} color={color} />,
        }}
      />
      
      {/* Central Record Button Placeholder */}
      <Tabs.Screen
        name="record"
        options={{
          title: 'Record',
          tabBarIcon: ({ focused }) => <GlowPulse focused={focused} />,
          tabBarLabel: () => null,
        }}
      />

      <Tabs.Screen
        name="explore"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <History size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
