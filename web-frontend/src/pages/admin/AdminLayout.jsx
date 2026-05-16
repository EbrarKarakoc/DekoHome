import React from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import { LayoutGrid, Package, Store } from 'lucide-react';
import styles from './Admin.module.css';

/**
 * Admin kabuğu (pastel yan menü). Alt rotalar: /admin/categories, /admin/products
 */
export default function AdminLayout() {
  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar} aria-label="Yönetim menüsü">
        <div className={styles.brandBlock}>
          <div className={styles.brand}>DekoHome</div>
          <span className={styles.brandSub}>Yönetim paneli</span>
        </div>
        <nav className={styles.nav}>
          <NavLink
            to="/admin/categories"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <LayoutGrid className={styles.navIcon} strokeWidth={1.85} aria-hidden />
            Kategoriler
          </NavLink>
          <NavLink
            to="/admin/products"
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
            }
          >
            <Package className={styles.navIcon} strokeWidth={1.85} aria-hidden />
            Ürünler
          </NavLink>
        </nav>
        <div className={styles.footerLink}>
          <Link to="/" className={styles.storeLink}>
            <Store className={styles.navIcon} strokeWidth={1.85} aria-hidden />
            Mağazaya dön
          </Link>
        </div>
      </aside>
      <main className={styles.main}>
        <div className={styles.mainInner}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
