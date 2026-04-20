import axios from 'axios';

import { API_BASE_URL, API_TIMEOUT_MS } from '@constants/api';
import { tokenStorage } from '@utils/tokenStorage';

type UnauthorizedHandler = () => void | Promise<void>;

let unauthorizedHandler: UnauthorizedHandler | null = null;

export function setUnauthorizedHandler(handler: UnauthorizedHandler | null): void {
  unauthorizedHandler = handler;
}

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: API_TIMEOUT_MS,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await tokenStorage.get();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch {
      // Keep the request going even if secure storage access fails.
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await tokenStorage.remove();
      if (unauthorizedHandler) {
        await unauthorizedHandler();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
