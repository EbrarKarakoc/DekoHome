# Gülnihal Köse — Web Frontend Görevleri

**Proje:** DekoHome Web Uygulaması  
**Frontend Adresi:** [dekohome-api.onrender.com](https://dekohome-api.onrender.com)  
**Kaynak Dosya:** `web-frontend/src/App.tsx`  
**Front-end Test Videosu:** *(Link buraya eklenecek)*

---

## Genel Bilgiler

| Özellik | Detay |
|---------|-------|
| Framework | React 18 + TypeScript |
| Routing | React Router DOM v6 — `useNavigate`, `useLocation` |
| State Yönetimi | `useState`, `useEffect` hooks |
| Bildirimler | `useToast()` — `ToastProvider` (global context) |
| Auth | `localStorage` → `token`, `user`, `userId` |
| Auth Hata Yönetimi | `handleAuthError(res, navigate, showToast)` — 401 kontrolü |
| Animasyon | `motion/react` (Framer Motion) — `AnimatePresence` |

---

## 1. Kayıt Olma Sayfası

**Rota:** `/register`  
**API Endpoint:** `POST /v1/auth/register`  
**Bileşen:** `RegisterPage`

### Sayfa Yapısı
Sayfa iki sütundan oluşur:
- **Sol sütun:** Tam ekran arka plan görseli (`unsplash — modern iç mekân`) + gradient overlay + slogan metni
- **Sağ sütun:** `#FAF8F4` arka planlı kayıt formu

### Form Alanları

| Alan | Input Tipi | Zorunlu | Detay |
|------|-----------|---------|-------|
| Ad (`ad`) | `text` | ✅ | `User` ikonu ile |
| Soyad (`soyad`) | `text` | ✅ | `User` ikonu ile |
| E-posta (`email`) | `email` | ✅ | `Mail` ikonu ile |
| Şifre (`password`) | `password` | ✅ | `Lock` ikonu ile |
| Şifre Tekrar (`passwordConfirm`) | `password` | ✅ | `History` ikonu ile |

### Form Validasyonu
- Tüm alanlar HTML5 `required` attribute ile zorunlu
- Şifre eşleşme kontrolü: `formData.password !== formData.passwordConfirm` → Toast "Şifreler eşleşmiyor" (error)
- Gönderim öncesi client-side kontrol

### Kullanıcı Deneyimi
- **Gönderim sırasında:** Buton disabled + `Loader2` spinner
- **Başarı:** Toast "Kayıt işlemi başarıyla tamamlanmıştır." (success) → 2 sn sonra `/login` yönlendirme (`setTimeout`)
- **Hata:** Toast ile hata mesajı (error)
- Sosyal giriş butonları: Google ve Facebook (görsel — işlevsel değil)
- Alt link: "Zaten bir hesabınız var mı? **Buradan giriş yapın**" → `/login`

### Teknik Detaylar
```typescript
// State
const [formData, setFormData] = useState({ ad, soyad, email, password, passwordConfirm });
const [loading, setLoading] = useState(false);

// API İsteği
POST /v1/auth/register
Body: { ad, soyad, email, password }

// Başarı sonrası
navigate('/login') // 2 sn delay ile
```

---

## 2. Giriş Yapma Sayfası

**Rota:** `/login`  
**API Endpoint:** `POST /v1/auth/login`  
**Bileşen:** `LoginPage`

### Sayfa Yapısı
- **Sol sütun:** `login-bg.png` tam ekran arka plan görseli
- **Sağ sütun:** Beyaz giriş formu, `rounded-t-[32px]` mobil card efekti

### Form Alanları

| Alan | Input Tipi | Zorunlu |
|------|-----------|---------|
| E-posta | `email` | ✅ |
| Şifre | `password` | ✅ |
| Beni Hatırla | `checkbox` | ❌ |

### Kullanıcı Deneyimi
- **Gönderim sırasında:** `Loader2` spinner
- **Başarı:** Token ve kullanıcı bilgisi `localStorage`'a kaydedilir → `authChange` eventi → "Başarıyla giriş yapıldı." Toast (success) → `/` yönlendirme
- **Hata:** Toast hata mesajı (error)
- Alt link: "Hesabınız yok mu? **Kayıt Ol**" → `/register`
- "Şifremi Unuttum" linki (görsel)

### Teknik Detaylar
```typescript
// Başarılı Giriş Akışı
const data = await res.json();
localStorage.setItem('token', data.token);

const decoded = parseJwt(data.token); // JWT çözümleme
localStorage.setItem('userId', decoded.userId);
localStorage.setItem('user', JSON.stringify({
  id: decoded.userId, email, ad: decoded.ad, soyad: decoded.soyad
}));

window.dispatchEvent(new Event('authChange')); // Header'ı günceller
navigate('/');
```

---

## 3. Kullanıcı Profili Sayfası

**Rota:** `/profile`  
**API Endpoint:** `GET /v1/users/{userId}` · `PUT /v1/users/{userId}`  
**Bileşen:** `ProfilePage`

### Sayfa Yapısı
3 sekmeli layout (`activeTab` state):

| Sekme | İkon | İçerik |
|-------|------|--------|
| Profil Bilgileri | `User` | Ad/soyad güncelleme formu |
| Siparişlerim | `Package` | Sipariş listesi ve iptal |
| Şifre ve Güvenlik | `Lock` | Şifre değiştirme formu |

### Profil Başlık Alanı
- Dairesel avatar (`128×128px`, `ring-4 ring-yellow-500/20`)
- Avatar üzerinde `Camera` butonu → `<input type="file">` tetikler
- Yükleme animasyonu: `Loader2` spinner + progress bar
- Kullanıcı adı: `{user.ad} {user.soyad}` — "DekoHome Üyesi" alt metni

### Sekme 1 — Profil Bilgileri Güncelleme

**Endpoint:** `PUT /v1/users/{userId}`

Form Alanları:
- **Ad** (`ad`): Text input, `User` ikonu
- **Soyad** (`soyad`): Text input, `User` ikonu
- **E-posta**: Disabled — `cursor-not-allowed opacity-70` + uyarı notu: *"E-posta sistemi güvenliği sebebiyle değiştirilemez."*
- **"Değişiklikleri Kaydet"** butonu

```typescript
PUT /v1/users/${userId}
Authorization: Bearer ${token}
Body: { ad, soyad }

// Başarı:
localStorage.setItem('user', JSON.stringify(updatedUser));
window.dispatchEvent(new Event('authChange')); // Header güncellenir
showToast('Profiliniz başarıyla güncellendi.', 'success');
```

### Sekme 2 — Siparişlerim
*(Ebrar Karakoç'un görev alanıyla kesişim — bkz. Sipariş Listeleme)*

### Sekme 3 — Şifre ve Güvenlik
- Mevcut Şifre, Yeni Şifre, Yeni Şifre Tekrar inputları
- Güvenlik uyarısı kutusu (sarı arka plan)
- "Şifreyi Güncelle" butonu → `showToast('Şifreniz başarıyla değiştirildi.', 'success')`

### Çıkış Yapma
```typescript
const handleLogout = () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.dispatchEvent(new Event('authChange'));
  navigate('/login');
};
```

---

## 4. Kategori Seçme (Sidebar Filtre)

**Rota:** `/categories`  
**API Endpoint:** `GET /v1/categories`  
**Bileşenler:** `CategoryTreeItem`, `CategoryDropdownItems`

### Sidebar — Kategori Ağacı (`CategoryTreeItem`)
- Recursive bileşen: ana kateg. → alt kategoriler (iç içe)
- Seçili kategori: `bg-yellow-50 text-yellow-700 font-bold`
- Seçili değil: `text-slate-600 hover:bg-slate-50`
- Her kategori yanında ürün sayısı badge (10px font, yuvarlak)
- Alt kategori açma/kapama: `ChevronRight` ikonu (`rotate-90` açıkken)
- "Temizle" butonu → `setSelectedCategoryIds([])`

### Header Dropdown (`CategoryDropdownItems`)
- `hover` ile açılan kategori menüsü
- Max 8 kategori gösterilir
- Seçim: `localStorage.setItem('selectedCategory', cat._id)` + `categorySelect` eventi

### Ana Sayfa Kategori Grid'i
- 6 kategori, `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6`
- Her kart: yuvarlak ikon + kategori adı
- Hover: `hover:shadow-xl hover:-translate-y-1`

---

## 5. Kategori Silme (Admin)

**API Endpoint:** `DELETE /v1/categories/{categoryId}`

> ⚠️ Yalnızca `role === 'admin'` yetkisindeki kullanıcılar görebilir.

### UI Bileşenleri
- Kategori listesinde sil butonu (`Trash2` ikonu, kırmızı)
- `window.confirm` onay dialogu
- Başarı: Toast (success) + kategori listesi yenilenir
- Hata: Toast (error)

```typescript
// Yetki kontrolü
JSON.parse(localStorage.getItem('user') || '{}').role === 'admin'

// API İsteği
DELETE /v1/categories/${categoryId}
Authorization: Bearer ${token}
```