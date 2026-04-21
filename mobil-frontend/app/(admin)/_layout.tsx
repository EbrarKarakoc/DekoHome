import { Stack } from 'expo-router';
import { useAuthStore } from '@store/authStore';
import { Redirect } from 'expo-router';
import Colors from '@constants/colors';

export default function AdminLayout() {
  const user = useAuthStore((state) => state.user);

  // Security check: only admins can stay here
  if (user?.role !== 'admin') {
    return <Redirect href="/(tabs)" />;
  }

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerTintColor: Colors.primary,
        headerTitleStyle: {
          fontFamily: 'PlayfairDisplay_700Bold',
          fontSize: 18,
        },
        headerStyle: {
          backgroundColor: Colors.surface,
        },
        animation: 'slide_from_bottom',
      }}
    >
      <Stack.Screen
        name="dashboard"
        options={{
          title: 'Yönetici Paneli',
          headerTitle: 'Genel Bakış',
        }}
      />
      <Stack.Screen
        name="categories"
        options={{
          title: 'Kategori Yönetimi',
        }}
      />
      <Stack.Screen
        name="products"
        options={{
          title: 'Ürün Yönetimi',
        }}
      />
    </Stack>
  );
}
