import { View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Clock, Route, Activity, Trophy, ArrowUpRight } from 'lucide-react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useMergedActivities } from '@/src/features/activity';

export default function DashboardScreen() {
  const { activities: savedActivities } = useMergedActivities();

  const totalDistance = savedActivities.reduce((acc, curr) => acc + Number(curr.distance), 0) / 1000;
  const totalSeconds = savedActivities.reduce((acc, curr) => acc + Number(curr.duration), 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMins = Math.floor((totalSeconds % 3600) / 60);

  const stats = [
    {
      label: 'Total Active Time',
      value: `${totalHours}h ${totalMins}m`,
      icon: Clock,
      color: '#0df2f2',
    },
    {
      label: 'Total Distance',
      value: `${totalDistance.toFixed(1)} km`,
      icon: Route,
      color: '#ff00ff',
    },
    {
      label: 'Activities',
      value: `${savedActivities.length}`,
      icon: Activity,
      color: '#25f447',
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-background">
      <ScrollView className="flex-1 px-6 pt-12 pb-24">
        {/* Header */}
        <View className="mb-8 flex-row items-center justify-between">
          <View>
            <Text className="text-zinc-500 text-sm font-bold uppercase tracking-widest font-lexend">Athlete</Text>
            <Text className="text-4xl text-text uppercase italic font-lexend-black">
              YOUR STATS
            </Text>
          </View>
          <TouchableOpacity className="h-10 w-10 rounded-full border border-zinc-800 items-center justify-center bg-card">
            <Text className="text-zinc-400 font-lexend">AJ</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Cards with Color Glow Effect */}
        {stats.map((stat, i) => (
          <Animated.View
            entering={FadeInDown.delay(i * 100).duration(600).springify()}
            key={i}
            className="mb-4 overflow-hidden rounded-2xl border-l-4"
            style={{ borderLeftColor: stat.color }}
          >
            {/* Card body with layered glow */}
            <View className="bg-card relative">
              {/* Color glow layer — faint tint from the accent color */}
              <View
                className="absolute inset-0 opacity-[0.08]"
                style={{ backgroundColor: stat.color }}
              />
              {/* Radial-ish corner glow */}
              <View
                className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-[0.12]"
                style={{ backgroundColor: stat.color }}
              />

              <View className="p-5 flex-row items-center justify-between">
                <View className="flex-row items-center">
                  {/* Icon container with color tint */}
                  <View
                    className="h-12 w-12 rounded-xl items-center justify-center mr-4"
                    style={{ backgroundColor: `${stat.color}20` }}
                  >
                    <stat.icon size={24} color={stat.color} strokeWidth={2.5} />
                  </View>
                  <View>
                    <Text className="text-zinc-500 text-xs font-bold uppercase tracking-tighter font-lexend">
                      {stat.label}
                    </Text>
                    <Text className="text-3xl text-text italic font-lexend-bold">
                      {stat.value}
                    </Text>
                  </View>
                </View>
                <ArrowUpRight size={20} color="#3f3f46" />
              </View>

              {/* Paint splash accent */}
              <View
                className="absolute -right-4 -bottom-4 h-16 w-16 opacity-[0.15]"
                style={{ backgroundColor: stat.color, transform: [{ rotate: '45deg' }] }}
              />
            </View>
          </Animated.View>
        ))}

        {/* Achievements */}
        <View className="mt-8 mb-4">
          <Text className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-4 font-lexend">Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {[
              { label: '100km Club', color: '#0df2f2' },
              { label: 'Early Bird', color: '#ff00ff' },
              { label: 'Trail Blazer', color: '#25f447' },
              { label: 'Iron Heart', color: '#facc15' },
            ].map((badge, i) => (
              <View
                key={i}
                className="mr-3 p-3 rounded-xl border border-zinc-800 items-center justify-center bg-card relative overflow-hidden"
                style={{ minWidth: 80 }}
              >
                {/* Subtle tint overlay */}
                <View
                  className="absolute inset-0 opacity-[0.06]"
                  style={{ backgroundColor: badge.color }}
                />
                <Trophy size={20} color={badge.color} />
                <Text className="text-zinc-500 text-[10px] uppercase font-bold font-lexend mt-2">{badge.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Weekly Progress */}
        <View className="mt-8 p-6 rounded-3xl bg-card border border-zinc-800 overflow-hidden relative">
          {/* Subtle gradient simulation — top highlight layer */}
          <View className="absolute top-0 left-0 right-0 h-24 bg-zinc-700/10 rounded-t-3xl" />

          <Text className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-6 font-lexend">Weekly Intensity</Text>
          <View className="flex-row items-end justify-between h-32">
            {[40, 70, 45, 90, 60, 30, 80].map((h, i) => (
              <View key={i} className="w-8 rounded-full bg-zinc-800/80 items-center justify-end overflow-hidden">
                {/* Gradient-like bar: stack two colors */}
                <View className="w-full rounded-full overflow-hidden" style={{ height: `${h}%` }}>
                  <View className="flex-1 bg-primary opacity-90" />
                  <View className="absolute bottom-0 w-full h-1/2 bg-tertiary opacity-40" />
                </View>
              </View>
            ))}
          </View>
          <View className="flex-row justify-between mt-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <Text key={i} className="text-zinc-600 text-[10px] font-bold w-8 text-center font-lexend">{d}</Text>
            ))}
          </View>
        </View>

        <View className="h-32" />
      </ScrollView>
    </SafeAreaView>
  );
}
