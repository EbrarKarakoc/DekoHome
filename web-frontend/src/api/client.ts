import axios, { type AxiosError } from 'axios';

/**
 * Tüm `/v1/*` istekleri için taban adresi.
 * Üretimde farklı API origin'i için `VITE_API_BASE_URL` (örn. `https://api.example.com/v1`).
 */
const baseURL =
  (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE_URL) ||
  '/v1';

/** JSON + istek öncesi JWT (varsa). Admin ve kimlikli istekler için kullanın. */
export const api = axios.create({
  baseURL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('userId');
      window.dispatchEvent(new Event('authChange'));
      const path = window.location.pathname;
      if (path !== '/login' && path !== '/register') {
        window.location.assign('/login');
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(
  error: unknown,
  fallback = 'İstek başarısız'
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const m = (data as { message?: string }).message;
      if (typeof m === 'string' && m.length > 0) return m;
    }
  }
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
