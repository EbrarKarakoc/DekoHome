# Web Frontend Görev Dağılımı

**Web Frontend Adresi:** [dekohome.onrender.com](https://dekohome-api.onrender.com)

Bu dokümanda, web uygulamasının kullanıcı arayüzü (UI) ve kullanıcı deneyimi (UX) görevleri listelenmektedir. Her grup üyesi, kendisine atanan sayfaların tasarımı, implementasyonu ve kullanıcı etkileşimlerinden sorumludur.

---

## Grup Üyelerinin Web Frontend Görevleri

1. [Gülnihal Köse'nin Web Frontend Görevleri](Gülnihal-Köse/Gülnihal-Köse-Web-Frontend-Gorevleri.md)
2. [Şerife Nur Yılmaz'ın Web Frontend Görevleri](Şerife-Nur-Yılmaz/Şerife-Nur-Yılmaz-Web-Frontend-Gorevleri.md)
3. [Ebrar Karakoç'un Web Frontend Görevleri](Ebrar-Karakoc/Ebrar-Karakoc-Web-Frontend-Gorevleri.md)
4. [Dilan Günsili'nin Web Frontend Görevleri](Dilan-Günsili/Dilan-Günsili-Web-Frontend-Gorevleri.md)

---

## Teknoloji Yığını

- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS
- **Animasyon:** Framer Motion (motion/react)
- **HTTP İstekleri:** Fetch API
- **State Management:** React Context API + useState/useEffect hooks
- **Icon Library:** Lucide React
- **Deployment:** Render (Static Site)

---

## Genel Web Frontend Prensipleri

### 1. Responsive Tasarım
- **Mobile-First Approach:** Önce mobil tasarım, sonra desktop
- **Breakpoints:**
  - Mobile: < 768px
  - Tablet: 768px - 1024px
  - Desktop: > 1024px
- **Flexible Layouts:** Tailwind CSS Grid ve Flexbox kullanımı
- **Touch-Friendly:** Minimum 44x44px touch targets

### 2. Tasarım Sistemi
- **CSS Framework:** Tailwind CSS
- **Renk Paleti:** Sarı-beyaz-koyu gri (Yellow #ca8a04, Slate #0f172a)
- **Tipografi:** Serif + Sans-serif kombinasyonu (font-serif / font-sans)
- **Spacing:** 4px tabanlı Tailwind spacing sistemi
- **Iconography:** Lucide React icon kütüphanesi
- **Component Library:** Custom reusable bileşenler (Header, Footer, Toast, HeroSlider)

### 3. Performans Optimizasyonu
- **Code Splitting:** Route bazlı sayfa bileşenleri
- **Lazy Loading:** Ürün görselleri (referrerPolicy="no-referrer")
- **Minification:** Vite prod build otomatik minifier
- **Caching:** localStorage ile token ve kullanıcı verisi

### 4. SEO (Search Engine Optimization)
- **Meta Tags:** Title, description
- **Semantic HTML:** Proper HTML5 semantic elements (header, nav, main, section, footer)
- **Alt Text:** Ürün görselleri için alt attribute

### 5. Erişilebilirlik (Accessibility)
- **Keyboard Navigation:** Tab order, interaktif elemanlar
- **ARIA:** AlertCircle, CheckCircle, Info ikonları ile bildirimler
- **Focus Indicators:** Tailwind focus:ring utilities
- **Screen Reader:** Anlamlı button ve link metinleri

### 6. Browser Compatibility
- **Modern Browsers:** Chrome, Firefox, Safari, Edge (son 2 versiyon)
- **CSS Prefixes:** Tailwind autoprefixer
- **Feature Detection:** LocalStorage, Fetch API

### 7. State Management
- **Global State:** React Context API (ToastContext)
- **Local State:** useState hooks (form state, loading state, error state)
- **Server State:** Custom fetch hooks
- **Auth State:** localStorage + custom event (authChange)

### 8. Routing
- **Client-Side Routing:** React Router DOM v6
- **Mevcut Rotalar:**
  - `/` → Ana Sayfa
  - `/categories` → Ürün Listesi
  - `/product/:id` → Ürün Detay
  - `/cart` → Sepet
  - `/login` → Giriş
  - `/register` → Kayıt
  - `/profile` → Kullanıcı Profili
  - `/orders` → Siparişlerim
- **Protected Routes:** Token kontrolü ile sayfa koruması
- **404 Handling:** Geçersiz ürün ID için fallback

### 9. API Entegrasyonu
- **HTTP Client:** Fetch API
- **Base URL:** `/v1/` (Vite proxy veya relative path)
- **Auth:** Bearer Token (localStorage'dan okunur)
- **Error Handling:** handleAuthError utility fonksiyonu (401 → logout)
- **Loading States:** Loader2 spinner bileşeni

### 10. Bildirim Sistemi (Toast)
- **ToastProvider:** Context tabanlı global bildirim sistemi
- **Toast Tipleri:** success (yeşil), error (kırmızı), info (mavi)
- **Animasyon:** Framer Motion ile yumuşak giriş/çıkış
- **Süre:** 5 saniye otomatik kapanma

### 11. Build ve Deployment
- **Build Tool:** Vite
- **Environment Variables:** .env dosyası (VITE_API_URL)
- **CI/CD:** GitHub → Render otomatik deploy
- **Hosting:** Render Static Site