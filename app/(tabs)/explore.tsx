import { View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Calendar, ChevronRight } from 'lucide-react-native';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { router } from 'expo-router';

export default function FeedScreen() {
  const savedActivities = useSelector((state: RootState) => state.activities.activities);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-12 pb-24">
        {/* Header */}
        <View className="mb-8">
          <Text style={{ fontFamily: 'BarlowCondensed-Bold' }} className="text-4xl text-white uppercase italic">
            ACTIVITY FEED
          </Text>
          <View className="flex-row mt-4 space-x-2">
            {['Day', 'Week', 'Month'].map((tab, i) => (
              <TouchableOpacity 
                key={tab} 
                className={`px-6 py-2 rounded-full border ${i === 0 ? 'bg-cyan-400 border-cyan-400' : 'border-zinc-800'}`}
              >
                <Text className={`text-xs font-bold uppercase tracking-widest ${i === 0 ? 'text-black' : 'text-zinc-500'}`}>
                  {tab}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Activity Cards */}
        {savedActivities.length === 0 ? (
          <View className="items-center justify-center p-12 bg-zinc-900 rounded-3xl border border-dashed border-zinc-800">
            <Text className="text-zinc-500 uppercase font-bold text-xs tracking-widest">No runs recorded yet</Text>
            <TouchableOpacity onPress={() => router.push('/record' as any)} className="mt-4">
              <Text className="text-cyan-400 font-bold uppercase text-[10px]">Start your first run</Text>
            </TouchableOpacity>
          </View>
        ) : (
          savedActivities.map((activity) => (
            <TouchableOpacity 
              key={activity.id} 
              onPress={() => router.push(`/activity/${activity.id}` as any)}
              className="mb-6 rounded-3xl bg-zinc-900 border border-zinc-800 overflow-hidden"
            >
              <View className="p-6">
                <View className="flex-row justify-between items-start mb-4">
                  <View>
                    <Text style={{ fontFamily: 'BarlowCondensed-Bold' }} className="text-2xl text-white uppercase italic">
                      {activity.title}
                    </Text>
                    <View className="flex-row items-center mt-1">
                      <Calendar size={12} color="#52525b" />
                      <Text className="text-zinc-500 text-[10px] ml-1 uppercase font-bold tracking-widest">
                        {new Date(activity.date).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color="#3f3f46" />
                </View>

                <View className="flex-row justify-between border-t border-zinc-800 pt-4">
                  <View className="items-center">
                    <Text className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Dist</Text>
                    <View className="flex-row items-baseline">
                      <Text className="text-white text-lg font-bold">{(activity.distance / 1000).toFixed(2)}</Text>
                      <Text className="text-zinc-600 text-[10px] ml-0.5">KM</Text>
                    </View>
                  </View>
                  <View className="items-center">
                    <Text className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Time</Text>
                    <View className="flex-row items-baseline">
                      <Text className="text-white text-lg font-bold">{formatDuration(activity.duration)}</Text>
                    </View>
                  </View>
                  <View className="items-center">
                    <Text className="text-zinc-500 text-[10px] uppercase font-bold mb-1">Elev</Text>
                    <View className="flex-row items-baseline">
                      <Text className="text-white text-lg font-bold">{activity.elevation}</Text>
                      <Text className="text-zinc-600 text-[10px] ml-0.5">M</Text>
                    </View>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
        <View className="h-32" />
      </ScrollView>
    </SafeAreaView>
  );
}
