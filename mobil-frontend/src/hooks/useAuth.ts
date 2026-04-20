import { router } from 'expo-router';
import { showMessage } from 'react-native-flash-message';

import { authApi } from '@api/auth';
import { useAuthStore } from '@store/authStore';
import { useCartStore } from '@store/cartStore';
import type { LoginRequest, RegisterRequest } from '@/types';
import { getErrorMessage } from '@utils/error';
import { hapticError, hapticSuccess, hapticTap } from '@utils/haptics';

export function useAuth() {
  const login = useAuthStore((state) => state.login);
  const logout = useAuthStore((state) => state.logout);
  const clearCart = useCartStore((state) => state.clearCart);

  const handleLogin = async (payload: LoginRequest): Promise<void> => {
    try {
      await hapticTap();
      const response = await authApi.login(payload);
      await login(response.token);
      await hapticSuccess();
      showMessage({ message: 'Hos geldiniz!', type: 'success' });
      router.replace('/tabs');
    } catch (error) {
      await hapticError();
      showMessage({ message: getErrorMessage(error), type: 'danger' });
      throw error;
    }
  };

  const handleRegister = async (payload: RegisterRequest): Promise<void> => {
    try {
      await hapticTap();
      await authApi.register(payload);
      await hapticSuccess();
      showMessage({ message: 'Hesabiniz olusturuldu', type: 'success' });
      router.replace('/(auth)/login');
    } catch (error) {
      await hapticError();
      showMessage({ message: getErrorMessage(error), type: 'danger' });
      throw error;
    }
  };

  const handleLogout = async (): Promise<void> => {
    await hapticTap();
    clearCart();
    await logout();
    await hapticSuccess();
    router.replace('/(auth)/login');
  };

  return { handleLogin, handleRegister, handleLogout };
}
