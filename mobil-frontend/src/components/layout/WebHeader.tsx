import { useRouter } from 'expo-router';
import { ChevronDown, Home, ShoppingBag } from 'lucide-react-native';
import { View, Text, Pressable } from 'react-native';

export default function WebHeader() {
  const router = useRouter();

  return (
    <View className="flex-row items-center justify-center bg-[#FAFAF9] pt-6 pb-2 w-full z-50">
      <View className="flex-row items-center gap-10 md:gap-16">
        
        {/* Logo / Anasayfa */}
        <Pressable 
          className="flex-row items-center gap-2 active:opacity-70 transition-opacity"
          onPress={() => router.replace('/(tabs)')}
        >
          <Home size={32} color="#D48806" strokeWidth={2.5} />
          <Text className="font-playfair text-[28px] text-[#0f172a] font-bold tracking-tight">DekoHome</Text>
        </Pressable>

        {/* Kategoriler */}
        <Pressable 
          className="flex-row items-center gap-2 active:opacity-70 transition-opacity"
          onPress={() => router.replace('/(tabs)/categories')}
        >
          <Text className="text-[#0f172a] font-inter-bold text-[16px]">Kategoriler</Text>
          <ChevronDown size={18} color="#334155" strokeWidth={2} />
        </Pressable>

        {/* Sepetim */}
        <Pressable 
          className="flex-row items-center gap-2 active:opacity-70 transition-opacity"
          onPress={() => router.replace('/(tabs)/cart')}
        >
          <ShoppingBag size={22} color="#334155" strokeWidth={2} />
          <Text className="text-[#0f172a] font-inter-bold text-[16px]">Sepetim</Text>
        </Pressable>

      </View>
    </View>
  );
}
