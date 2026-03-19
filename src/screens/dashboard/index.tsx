import { View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Clock, Route, Activity, Trophy, ArrowUpRight } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/src/store';
import Animated, { FadeInDown } from 'react-native-reanimated';

export default function DashboardScreen() {
  const savedActivities = useSelector((state: RootState) => state.activities.activities);

  const totalDistance = savedActivities.reduce((acc, curr) => acc + curr.distance, 0) / 1000;
  const totalSeconds = savedActivities.reduce((acc, curr) => acc + curr.duration, 0);
  const totalHours = Math.floor(totalSeconds / 3600);
  const totalMins = Math.floor((totalSeconds % 3600) / 60);
  
  const stats = [
    {
      label: 'Total Active Time',
      value: `${totalHours}h ${totalMins}m`,
      icon: Clock,
      color: '#0df2f2', // Teal
    },
    {
      label: 'Total Distance',
      value: `${totalDistance.toFixed(1)} km`,
      icon: Route,
      color: '#ff00ff', // Magenta/Pink
    },
    {
      label: 'Activities',
      value: `${savedActivities.length}`,
      icon: Activity,
      color: '#25f447', // Lime
    },
  ];

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-12 pb-24">
        {/* Header */}
        <View className="mb-8 flex-row items-center justify-between">
          <View>
            <Text className="text-zinc-500 text-sm font-bold uppercase tracking-widest">Athlete</Text>
            <Text style={{ fontFamily: 'BarlowCondensed-Bold' }} className="text-4xl text-white uppercase italic">
              YOUR STATS
            </Text>
          </View>
          <TouchableOpacity className="h-10 w-10 rounded-full border border-zinc-800 items-center justify-center">
            <Text className="text-zinc-400">AJ</Text>
          </TouchableOpacity>
        </View>

        {/* Hero Cards */}
        {stats.map((stat, i) => (
          <Animated.View 
            entering={FadeInDown.delay(i * 100).duration(600).springify()}
            key={i} 
            className="mb-4 overflow-hidden rounded-2xl bg-zinc-900 border-l-4" 
            style={{ borderLeftColor: stat.color }}
          >
            <View className="p-5 flex-row items-center justify-between">
              <View className="flex-row items-center">
                <View className="h-12 w-12 rounded-xl bg-zinc-800/50 items-center justify-center mr-4">
                  <stat.icon size={24} color={stat.color} strokeWidth={2.5} />
                </View>
                <View>
                  <Text className="text-zinc-500 text-xs font-bold uppercase tracking-tighter">
                    {stat.label}
                  </Text>
                  <Text style={{ fontFamily: 'BarlowCondensed-Bold' }} className="text-3xl text-white italic">
                    {stat.value}
                  </Text>
                </View>
              </View>
              <ArrowUpRight size={20} color="#3f3f46" />
            </View>
            
            {/* Gritty paint splashes (simulated with absolute views) */}
            <View className="absolute -right-4 -bottom-4 h-16 w-16 opacity-10" style={{ backgroundColor: stat.color, transform: [{ rotate: '45deg' }] }} />
          </Animated.View>
        ))}

        {/* Highlights / Badges */}
        <View className="mt-8 mb-4">
          <Text className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-4">Achievements</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} className="flex-row">
            {[
              { label: '100km Club', color: '#0df2f2' },
              { label: 'Early Bird', color: '#ff00ff' },
              { label: 'Trail Blazer', color: '#25f447' },
              { label: 'Iron Heart', color: '#facc15' },
            ].map((badge, i) => (
              <View key={i} className="mr-3 p-3 rounded-xl bg-zinc-900 border border-zinc-800 items-center justify-center">
                <Trophy size={20} color={badge.color} className="mb-2" />
                <Text className="text-zinc-500 text-[10px] uppercase font-bold">{badge.label}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Weekly Progress Simulation */}
        <View className="mt-8 p-6 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden">
          <Text className="text-zinc-500 text-sm font-bold uppercase tracking-widest mb-6">Weekly Intensity</Text>
          <View className="flex-row items-end justify-between h-32">
            {[40, 70, 45, 90, 60, 30, 80].map((h, i) => (
              <View key={i} className="w-8 rounded-full bg-zinc-800/80 items-center justify-end overflow-hidden">
                <View className="w-full bg-cyan-400 rounded-full" style={{ height: `${h}%`, opacity: 0.8 }} />
              </View>
            ))}
          </View>
          <View className="flex-row justify-between mt-4">
            {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
              <Text key={i} className="text-zinc-600 text-[10px] font-bold w-8 text-center">{d}</Text>
            ))}
          </View>
        </View>
        
        <View className="h-32" />
      </ScrollView>
    </SafeAreaView>
  );
}
