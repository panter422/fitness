import { View, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { Text, Avatar } from 'react-native-paper';
import { Settings, LogOut, ChevronRight, Map, Heart, Shield } from 'lucide-react-native';

export default function ProfileScreen() {
  return (
    <SafeAreaView className="flex-1 bg-zinc-950">
      <ScrollView className="flex-1 px-6 pt-12">
        {/* Profile Header */}
        <View className="items-center mb-8">
          <View className="p-1 rounded-full border-2 border-cyan-400 mb-4">
            <Avatar.Text size={80} label="AJ" style={{ backgroundColor: '#18181b' }} />
          </View>
          <Text style={{ fontFamily: 'BarlowCondensed-Bold' }} className="text-3xl text-white uppercase italic">
            ALEX JOHNSON
          </Text>
          <Text className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Trail Blazer • Level 42</Text>
        </View>

        {/* Quick Stats */}
        <View className="flex-row justify-between mb-8 bg-zinc-900/50 p-4 rounded-3xl border border-zinc-800">
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-lg">1,240</Text>
            <Text className="text-zinc-600 text-[10px] uppercase font-bold">Followers</Text>
          </View>
          <View className="w-px h-8 bg-zinc-800 self-center" />
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-lg">850</Text>
            <Text className="text-zinc-600 text-[10px] uppercase font-bold">Following</Text>
          </View>
          <View className="w-px h-8 bg-zinc-800 self-center" />
          <View className="items-center flex-1">
            <Text className="text-white font-bold text-lg">156</Text>
            <Text className="text-zinc-600 text-[10px] uppercase font-bold">Runs</Text>
          </View>
        </View>

        {/* Settings List */}
        <View className="bg-zinc-900 rounded-3xl border border-zinc-800 overflow-hidden mb-8">
          {[
            { label: 'My Gear', icon: Map, color: '#0df2f2' },
            { label: 'Health Integration', icon: Heart, color: '#ff00ff' },
            { label: 'Privacy & Safety', icon: Shield, color: '#25f447' },
            { label: 'Settings', icon: Settings, color: '#52525b' },
          ].map((item, i) => (
            <TouchableOpacity 
              key={i} 
              className={`flex-row items-center justify-between p-5 ${i !== 0 ? 'border-t border-zinc-800/50' : ''}`}
            >
              <View className="flex-row items-center">
                <item.icon size={20} color={item.color} />
                <Text className="text-zinc-300 ml-4 font-bold">{item.label}</Text>
              </View>
              <ChevronRight size={16} color="#3f3f46" />
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity className="flex-row items-center justify-center p-5 bg-zinc-900 rounded-3xl border border-zinc-800 mb-24">
          <LogOut size={20} color="#ef4444" />
          <Text className="text-red-500 ml-3 font-bold uppercase tracking-widest text-xs">Sign Out</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
