import { Platform } from 'react-native';

const PROD_API_BASE_URL = 'https://dekohome-api.onrender.com/v1';
const ANDROID_DEV_API_BASE_URL = 'http://10.0.2.2:3000/v1';
const IOS_DEV_API_BASE_URL = 'http://localhost:3000/v1';

export const API_TIMEOUT_MS = 15000;

export function getApiBaseUrl(): string {
  if (__DEV__) {
    return Platform.OS === 'android' ? ANDROID_DEV_API_BASE_URL : IOS_DEV_API_BASE_URL;
  }

  return PROD_API_BASE_URL;
}

export const API_BASE_URL = getApiBaseUrl();
