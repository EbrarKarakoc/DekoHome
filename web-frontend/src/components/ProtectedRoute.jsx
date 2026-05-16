import React, { useContext, useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

/** Provider yoksa bu sembol kullanılır; kullanıcı bilgisi localStorage'dan okunur. */
const AUTH_CTX_MISSING = Symbol('auth-user-context-missing');

/**
 * İsteğe bağlı: Uygulama genelinde kullanıcıyı context üzerinden sağlarsanız
 * <AuthUserContext.Provider value={user}> sarmalayıcısı kullanın (user: object | null).
 */
export const AuthUserContext = React.createContext(AUTH_CTX_MISSING);

function readUserFromStorage() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
}

/** @param {Record<string, unknown> | null} user */
export function isAdminUser(user) {
  if (!user) return false;
  if (user.isAdmin === true) return true;
  const r = String(user.role ?? '').trim().toLowerCase();
  return r === 'admin';
}

/**
 * @param {{ children: React.ReactNode }} props
 */
export default function ProtectedRoute({ children }) {
  const ctxUser = useContext(AuthUserContext);
  const location = useLocation();

  const [allowed, setAllowed] = useState(() => {
    const user = ctxUser === AUTH_CTX_MISSING ? readUserFromStorage() : ctxUser;
    return isAdminUser(user);
  });

  useEffect(() => {
    const sync = () => {
      const user = ctxUser === AUTH_CTX_MISSING ? readUserFromStorage() : ctxUser;
      setAllowed(isAdminUser(user));
    };
    sync();

    if (ctxUser === AUTH_CTX_MISSING) {
      window.addEventListener('authChange', sync);
      window.addEventListener('storage', sync);
      return () => {
        window.removeEventListener('authChange', sync);
        window.removeEventListener('storage', sync);
      };
    }
  }, [ctxUser]);

  if (!allowed) {
    const user = ctxUser === AUTH_CTX_MISSING ? readUserFromStorage() : ctxUser;
    const token =
      typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    /** Oturum yoksa girişe gönder (panel “görünmüyor” hissini azaltır). */
    if (!user || !token) {
      return (
        <Navigate to="/login" replace state={{ from: location.pathname }} />
      );
    }
    /** Giriş var ama admin değil → ana sayfa */
    return <Navigate to="/" replace />;
  }

  return children;
}
