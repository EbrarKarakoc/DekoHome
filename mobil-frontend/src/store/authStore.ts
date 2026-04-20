import { create } from 'zustand';

import { setUnauthorizedHandler } from '@api/client';
import type { User } from '@/types';
import { decodeJwt, isTokenExpired } from '@utils/jwtDecode';
import { tokenStorage } from '@utils/tokenStorage';

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  initialize: () => Promise<void>;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

function mapTokenToUser(token: string): User | null {
  const payload = decodeJwt(token);
  if (!payload) {
    return null;
  }

  return {
    id: payload.userId,
    email: '',
    ad: payload.ad,
    soyad: payload.soyad,
    role: payload.role,
  };
}

export const useAuthStore = create<AuthState>((set) => {
  setUnauthorizedHandler(async () => {
    await tokenStorage.remove();
    set({ token: null, user: null, isAuthenticated: false });
  });

  return {
    token: null,
    user: null,
    isAuthenticated: false,
    isInitialized: false,

    initialize: async () => {
      try {
        const token = await tokenStorage.get();

        if (token && !isTokenExpired(token)) {
          const user = mapTokenToUser(token);
          if (user) {
            set({ token, user, isAuthenticated: true });
            return;
          }
        }

        if (token) {
          await tokenStorage.remove();
        }

        set({ token: null, user: null, isAuthenticated: false });
      } finally {
        set({ isInitialized: true });
      }
    },

    login: async (token: string) => {
      await tokenStorage.save(token);
      const user = mapTokenToUser(token);

      if (!user) {
        await tokenStorage.remove();
        set({ token: null, user: null, isAuthenticated: false });
        return;
      }

      set({ token, user, isAuthenticated: true });
    },

    logout: async () => {
      await tokenStorage.remove();
      set({ token: null, user: null, isAuthenticated: false });
    },

    setUser: (user) => {
      set({ user });
    },
  };
});
