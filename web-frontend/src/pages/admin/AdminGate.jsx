import React, { useEffect, useState } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { isAdminUser } from '../../components/ProtectedRoute.jsx';
import AdminLayout from './AdminLayout.jsx';
import styles from './Admin.module.css';

function readStorageUser() {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u && typeof u === 'object' ? u : null;
  } catch {
    return null;
  }
}

/** Tarayıcıda JWT payload (doğrulama yapmaz; eksik localStorage kullanıcısını tamamlar). */
function decodeJwtPayload(token) {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      window
        .atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    const p = JSON.parse(jsonPayload);
    return p && typeof p === 'object' ? p : null;
  } catch {
    return null;
  }
}

function userIdFromPayload(p) {
  if (!p) return '';
  const rawId = p.userId;
  if (typeof rawId === 'string' && rawId.length > 0) return rawId;
  if (
    rawId &&
    typeof rawId === 'object' &&
    rawId !== null &&
    '$oid' in rawId
  ) {
    return String(rawId.$oid);
  }
  if (rawId != null) return String(rawId);
  return '';
}

/**
 * Oturumu tek kaynakta düzenle: bazen token vardır ama `user` localStorage yazılmamıştır /
 * eski sürümde isAdmin atanmamış olabilir. JWT rolü daha güvenilirdir.
 */
function reconcileSessionFromStorage() {
  const token = localStorage.getItem('token');
  let user = readStorageUser();
  const payload = token ? decodeJwtPayload(token) : null;

  if (!token) {
    return { token: null, user: null };
  }

  if (!payload) {
    return { token, user };
  }

  const id = userIdFromPayload(payload);
  const roleRaw = String(payload.role ?? '').trim().toLowerCase();
  const roleNorm = roleRaw === 'admin' ? 'admin' : 'user';
  const roleIsAdmin = roleNorm === 'admin';

  if (!user) {
    if (!id) {
      return { token, user: null };
    }
    user = {
      id,
      email: typeof payload.email === 'string' ? payload.email : '',
      ad: typeof payload.ad === 'string' ? payload.ad : '',
      soyad: typeof payload.soyad === 'string' ? payload.soyad : '',
      role: roleNorm,
      isAdmin: roleIsAdmin,
    };
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('userId', id);
    return { token, user };
  }

  const merged = {
    ...user,
    id: user.id ?? id,
    email:
      typeof user.email === 'string' && user.email.length > 0
        ? user.email
        : typeof payload.email === 'string'
          ? payload.email
          : '',
    ad: typeof user.ad === 'string' ? user.ad : (typeof payload.ad === 'string' ? payload.ad : ''),
    soyad:
      typeof user.soyad === 'string'
        ? user.soyad
        : typeof payload.soyad === 'string'
          ? payload.soyad
          : '',
    role: roleNorm,
    isAdmin: roleIsAdmin,
  };

  try {
    if (JSON.stringify(merged) !== JSON.stringify(user)) {
      localStorage.setItem('user', JSON.stringify(merged));
      if (merged.id) localStorage.setItem('userId', String(merged.id));
    }
  } catch {
    /* ignore quota */
  }

  return { token, user: merged };
}

/** /admin için: oturum yoksa giriş, admin değilse bilgilendirme, admin ise kabuk */
export default function AdminGate() {
  const location = useLocation();
  const [session, setSession] = useState(() => reconcileSessionFromStorage());

  useEffect(() => {
    const sync = () => setSession(reconcileSessionFromStorage());
    sync();
    window.addEventListener('authChange', sync);
    window.addEventListener('storage', sync);
    return () => {
      window.removeEventListener('authChange', sync);
      window.removeEventListener('storage', sync);
    };
  }, []);

  const { token, user } = session;

  if (!token || !user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search || ''}`,
        }}
      />
    );
  }

  if (!isAdminUser(user)) {
    return (
      <div className={styles.gateDeniedWrap}>
        <div className={styles.gateDeniedCard}>
          <h1 className={styles.gateDeniedTitle}>Yönetim paneli</h1>
          <p className={styles.gateDeniedText}>
            Bu alan yalnızca yönetici hesapları içindir. Veritabanı üzerinden kategori ve ürün işlemleri için hesabınızın{' '}
            <strong>admin</strong> rolünde olması gerekir. Gerekirse yöneticiden rol ataması isteyin veya proje kökünde{' '}
            <code style={{ fontSize: '0.85em' }}>npm run create-admin</code> ile bir admin hesabı oluşturun.
          </p>
          <p className={styles.gateDeniedHint}>
            İpucu: Giriş yaptığınız adres ile paneli hep aynı tutun (<strong>localhost</strong> ile{' '}
            <strong>127.0.0.1</strong> farklı çerez / depolama alanı kullanır).
          </p>
          <div className={styles.gateDeniedActions}>
            <Link to="/" className={styles.gateBtnPrimary}>
              Mağazaya dön
            </Link>
            <Link
              to="/login"
              className={styles.gateBtnGhost}
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                localStorage.removeItem('userId');
                window.dispatchEvent(new Event('authChange'));
              }}
            >
              Farklı hesapla giriş
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <AdminLayout />;
}
