import * as Network from 'expo-network';
import { useEffect, useState } from 'react';
import { Text, View } from 'react-native';

import Colors from '@constants/colors';

export function OfflineBanner() {
  const [isConnected, setIsConnected] = useState(true);

  useEffect(() => {
    let mounted = true;

    const checkConnection = async () => {
      const state = await Network.getNetworkStateAsync();
      if (!mounted) {
        return;
      }

      setIsConnected(!!state.isConnected && state.isInternetReachable !== false);
    };

    checkConnection().catch(() => undefined);

    const interval = setInterval(() => {
      checkConnection().catch(() => undefined);
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  if (isConnected) {
    return null;
  }

  return (
    <View
      style={{
        backgroundColor: Colors.warning,
        paddingHorizontal: 14,
        paddingVertical: 8,
      }}
    >
      <Text style={{ color: '#FFFFFF', textAlign: 'center', fontWeight: '700' }}>
        Internet baglantisi yok. Cevrimdisi olabilirsiniz.
      </Text>
    </View>
  );
}
