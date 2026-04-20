import { Platform } from 'react-native';

const PROD_API_BASE_URL = 'https://dekohome-api.onrender.com/v1';
const ANDROID_DEV_API_BASE_URL = 'http://10.0.2.2:3000/v1';
const IOS_DEV_API_BASE_URL = 'http://localhost:3000/v1';

export const API_TIMEOUT_MS = 15000;

export function getApiBaseUrl(): string {
  const envBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL?.trim();
  if (envBaseUrl) {
    const normalized = envBaseUrl.replace(/\/$/, '');
    return normalized.endsWith('/v1') ? normalized : `${normalized}/v1`;
  }

  if (__DEV__) {
    if (Platform.OS === 'web') {
      // Web dev uses local backend to avoid CORS issues
      return 'http://localhost:3000/v1';
    }

    return Platform.OS === 'android' ? ANDROID_DEV_API_BASE_URL : IOS_DEV_API_BASE_URL;
  }

  return PROD_API_BASE_URL;
}

export const API_BASE_URL = getApiBaseUrl();
