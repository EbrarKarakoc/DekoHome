import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const TOKEN_KEY = 'auth_token';

function canUseSecureStore(): boolean {
  if (Platform.OS === 'web') {
    return false;
  }

  return (
    typeof SecureStore.setItemAsync === 'function' &&
    typeof SecureStore.getItemAsync === 'function' &&
    typeof SecureStore.deleteItemAsync === 'function'
  );
}

export const tokenStorage = {
  async save(token: string): Promise<void> {
    if (canUseSecureStore()) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      return;
    }

    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  async get(): Promise<string | null> {
    if (canUseSecureStore()) {
      return SecureStore.getItemAsync(TOKEN_KEY);
    }

    return AsyncStorage.getItem(TOKEN_KEY);
  },

  async remove(): Promise<void> {
    if (canUseSecureStore()) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      return;
    }

    await AsyncStorage.removeItem(TOKEN_KEY);
  },
};
