import React, { useState, useEffect, useRef } from 'react';
import { View, Text, Image, Dimensions, FlatList, Pressable } from 'react-native';
import { ChevronRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

const slides = [
  {
    image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1600&q=80",
    title: "Evinizdeki Konforu",
    subtitle: "Yeniden Tanımlayın",
    description: "Modern ve şık tasarımlarla yaşam alanlarınıza yeni bir soluk getirin. Kalite ve estetiğin mükemmel uyumu."
  },
  {
    image: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=1600&q=80",
    title: "Huzurlu Uykular,",
    subtitle: "Modern Dokunuşlar",
    description: "Yatak odanızda İskandinav esintileriyle huzuru hissedin. Fonksiyonel ve göz alıcı çözümler sizi bekliyor."
  },
  {
    image: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1600&q=80",
    title: "Mutfakta Estetik ve",
    subtitle: "Fonksiyonellik",
    description: "Lezzetli anlarınıza eşlik edecek, her ayrıntısı özenle düşünülmüş mutfak ve yemek odası tasarımları."
  }
];

export default function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      const nextIndex = (current + 1) % slides.length;
      setCurrent(nextIndex);
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
    }, 6000);
    return () => clearInterval(timer);
  }, [current]);

  const renderItem = ({ item }: { item: typeof slides[0] }) => (
    <View style={{ width }} className="px-4 md:px-10">
      <View className="relative h-[400px] md:h-[650px] rounded-2xl md:rounded-3xl overflow-hidden">
        <Image
          source={{ uri: item.image }}
          className="absolute inset-0 w-full h-full"
          resizeMode="cover"
        />
        {/* Overlay matches the web gradient */}
        <View className="absolute inset-0 bg-black/40 justify-center p-8 md:p-16">
          <Text className="text-white font-playfair text-4xl md:text-6xl font-bold leading-tight tracking-tight">
            {item.title}
          </Text>
          <Text className="text-[#D48806] font-playfair text-4xl md:text-6xl font-bold leading-tight tracking-tight mb-5 shadow-sm">
            {item.subtitle}
          </Text>
          <Text className="text-white text-sm md:text-lg font-inter font-medium max-w-sm md:max-w-lg mb-8 leading-relaxed">
            {item.description}
          </Text>
          <Pressable className="bg-[#D48806] self-start px-6 md:px-8 py-3 md:py-4 rounded-full flex-row items-center gap-2 active:opacity-90 transition-opacity shadow-lg">
            <Text className="text-white text-sm md:text-base font-inter-bold">Koleksiyonu Keşfet</Text>
            <ChevronRight size={18} color="white" strokeWidth={2.5} />
          </Pressable>
        </View>
      </View>
    </View>
  );

  return (
    <View className="mb-12 mt-4 relative">
      <FlatList
        ref={flatListRef}
        data={slides}
        renderItem={renderItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={(e) => {
          const index = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrent(index);
        }}
        keyExtractor={(_, index) => index.toString()}
      />
      
      {/* Pagination moved inside over the image, matching the screenshots */}
      <View className="absolute bottom-6 left-0 right-0 flex-row justify-center gap-2.5 z-10">
        {slides.map((_, i) => (
          <View
            key={i}
            className={`h-1.5 transition-all duration-300 rounded-full ${
              current === i ? 'bg-[#D48806] w-12' : 'bg-white/40 w-8'
            }`}
          />
        ))}
      </View>
    </View>
  );
}
