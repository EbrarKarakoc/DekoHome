import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSequence, withTiming } from 'react-native-reanimated';

import Colors from '@constants/colors';
import { useCartStore } from '@store/cartStore';

function AnimatedCartIcon({ color, size, itemCount }: { color: string; size: number; itemCount: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    if (itemCount <= 0) {
      return;
    }

    scale.value = withSequence(withTiming(1.25, { duration: 120 }), withTiming(1, { duration: 140 }));
  }, [itemCount, scale]);

  const badgeStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <View>
      <Ionicons color={color} name="bag-outline" size={size} />
      {itemCount > 0 ? (
        <Animated.View
          style={[
            {
              position: 'absolute',
              top: -6,
              right: -10,
              minWidth: 18,
              height: 18,
              borderRadius: 999,
              backgroundColor: Colors.primary,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 4,
            },
            badgeStyle,
          ]}
        >
          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '700' }}>
            {itemCount > 99 ? '99+' : itemCount}
          </Text>
        </Animated.View>
      ) : null}
    </View>
  );
}

export default function TabsLayout() {
  const itemCount = useCartStore((state) => state.itemCount);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarStyle: {
          backgroundColor: Colors.surface,
          borderTopColor: Colors.border,
          height: 60,
          paddingBottom: 6,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Ana Sayfa',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="home-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Kesfet',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="search-outline" size={size} />,
        }}
      />
      <Tabs.Screen
        name="cart"
        options={{
          title: 'Sepet',
          tabBarIcon: ({ color, size }) => <AnimatedCartIcon color={color} size={size} itemCount={itemCount} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          tabBarIcon: ({ color, size }) => <Ionicons color={color} name="person-outline" size={size} />,
        }}
      />
    </Tabs>
  );
}
