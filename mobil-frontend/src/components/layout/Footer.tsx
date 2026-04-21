import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Home } from 'lucide-react-native';
import { FontAwesome } from '@expo/vector-icons';

export default function Footer() {
  return (
    <View className="bg-slate-900 pt-16 pb-10 px-8">
      <View className="items-center mb-10">
        <View className="flex-row items-center gap-2 mb-4">
          <Home size={28} color="#D48806" />
          <Text className="text-white font-playfair text-2xl">DekoHome</Text>
        </View>
        <Text className="text-slate-400 text-sm text-center italic leading-relaxed px-4">
          "Evinizi Hikayeleştirin. Modern tasarımlar, akıllı çözümler ve hayatınızı kolaylaştıran dokunuşlar."
        </Text>
      </View>

      <View className="flex-row justify-center gap-6 mb-10">
        <Pressable className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center">
            <FontAwesome name="instagram" size={18} color="#94a3b8" />
        </Pressable>
        <Pressable className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center">
            <FontAwesome name="twitter" size={18} color="#94a3b8" />
        </Pressable>
        <Pressable className="w-10 h-10 rounded-full bg-slate-800 items-center justify-center">
            <FontAwesome name="facebook" size={18} color="#94a3b8" />
        </Pressable>
      </View>

      <View className="border-t border-slate-800 pt-8 items-center">
        <Text className="text-slate-500 text-[10px] mb-2">© 2024 DekoHome. Tüm hakları saklıdır.</Text>
        <View className="flex-row gap-4">
             <Text className="text-slate-600 text-[10px]">Gizlilik Politikası</Text>
             <Text className="text-slate-600 text-[10px]">Kullanım Şartları</Text>
        </View>
      </View>
    </View>
  );
}
