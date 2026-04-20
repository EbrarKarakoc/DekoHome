import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Not Found' }} />
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 20, fontWeight: '700', marginBottom: 12 }}>This screen does not exist.</Text>
        <Link href="/" style={{ color: '#CA8A04', fontWeight: '600' }}>
          Go to home screen
        </Link>
      </View>
    </>
  );
}
