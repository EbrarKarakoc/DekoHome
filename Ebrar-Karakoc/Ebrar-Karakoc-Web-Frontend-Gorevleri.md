# Ebrar Karakoç — Web Frontend Görevleri

**Proje:** DekoHome Web Uygulaması  
**Frontend Adresi:** [dekohome-api.onrender.com](https://dekohome-api.onrender.com)  
**Kaynak Dosya:** `web-frontend/src/App.tsx`  
**Front-end Test Videosu:** *(Link buraya eklenecek)*

---

## Genel Bilgiler

| Özellik | Detay |
|---------|-------|
| Framework | React 18 + TypeScript |
| Routing | React Router DOM v6 — `useNavigate` |
| State Yönetimi | `useState`, `useEffect` hooks |
| Bildirimler | `useToast()` — global context |
| Auth | Bearer token → `localStorage.getItem('token')` |
| Auth Hata Yönetimi | `handleAuthError(res, navigate, showToast)` — 401 → logout |
| Animasyon | `motion/react` — `AnimatePresence` |

---

## 1. Sipariş Oluşturma

**Rota:** `/checkout`  
**API Endpoint:** `POST /v1/orders`  
**Bileşen:** `CheckoutPage`

### Sayfa Yapısı

**12 sütun Grid:** Sol (`lg:col-span-8`) + Sağ Özet (`lg:col-span-4`)

**Sol Panel — 2 Adım:**

#### Adım 1 — Teslimat Bilgileri

| Alan | Tipi | Detay |
|------|------|-------|
| Ad Soyad | `text` | `defaultValue` kullanıcı bilgisinden (`user.ad + user.soyad`) |
| E-posta | `email` | `defaultValue` kullanıcı bilgisinden (`user.email`) |
| Adres | `textarea` 3 satır | `value={address}` — zorunlu alan |

#### Adım 2 — Ödeme Yöntemi

Radio input ile seçim:

| Seçenek | İkon | Detay |
|---------|------|-------|
| Kredi / Banka Kartı | `CreditCard` | Seçilince kart detay formu açılır |
| Havale / EFT | — | Banka hesabına doğrudan transfer |

Kredi Kartı Detay Formu (seçildiğinde görünür):

| Alan | Açıklama |
|------|----------|
| Kart Üzerindeki İsim | Metin girişi |
| Kart Numarası | Son 4 hane `paymentLast4` state'e kaydedilir |
| Son Kullanma (AA/YY) | Metin girişi |
| CVV | `type="password"` |

**Sağ Panel — Sipariş Özeti:**

```
┌─────────────────────────────────────┐
│  Sipariş Özeti                      │
│                                     │
│  [64×64 img] Ürün Adı (x2)         │
│              2.500 TL               │
│                                     │
│  Ara Toplam          2.500 TL       │
│  Kargo               Ücretsiz       │
│  ─────────────────────────────      │
│  Toplam              2.500 TL       │
│                                     │
│  [Siparişi Tamamla 🔒]             │
│  256-bit SSL ile güvenli ödeme      │
└─────────────────────────────────────┘
```

### Validasyon
```typescript
if (!address.trim()) {
  showToast('Lütfen teslimat adresinizi girin.', 'error');
  return;
}
```

### Kullanıcı Deneyimi
- Giriş yoksa → Toast + `/login` yönlendirme
- Boş sepette → Toast "Sepetiniz boş." + `/cart` yönlendirme
- Gönderim sırasında: buton `disabled` + `Loader2` spinner
- **Başarı:** Toast "Siparişiniz başarıyla alındı!" (success) → `/profile` yönlendirme
- **Hata:** Toast hata mesajı (error)

### Teknik Detaylar
```typescript
// State
const [address, setAddress] = useState('');
const [paymentMethod, setPaymentMethod] = useState('Kredi / Banka Kartı');
const [paymentLast4, setPaymentLast4] = useState('4912');
const [submitting, setSubmitting] = useState(false);

// API İsteği
POST /v1/orders
Authorization: Bearer ${token}
Content-Type: application/json
Body: {
  address,
  note: 'Web üzerinden sipariş',
  paymentMethod,
  paymentLast4
}
```

---

## 2. Sipariş İptali

**Rota:** `/profile` → "Siparişlerim" sekmesi  
**API Endpoint:** `DELETE /v1/orders/{orderId}`  
**Bileşen:** `ProfilePage` — `handleCancelOrder`

### Görünürlük Koşulu

"İptal Et" butonu yalnızca şu durumlar için görünür:
```typescript
order.status === 'Hazırlanıyor' ||
order.status === 'Onaylandı'   ||
order.status === 'Beklemede'
```

### UI Bileşeni
- Sipariş kartında "İptal Et" butonu — `bg-red-50 hover:bg-red-100 text-red-600 border border-red-100`
- `window.confirm` onay dialogu: *"Bu siparişi iptal etmek istediğinize emin misiniz?"*

### Kullanıcı Deneyimi
- İptal onaylanmazsa → işlem durur (`return`)
- **Başarı:** Toast "Sipariş başarıyla iptal edildi." (success) + sipariş durumu UI'da "İptal Edildi" olarak güncellenir (sayfa yenilenmeden, optimistic güncelleme)
- **Hata:** Toast hata mesajı (error)

### Teknik Detaylar
```typescript
const handleCancelOrder = async (orderId: string) => {
  const token = localStorage.getItem('token');
  if (!token) return;

  if (!window.confirm('Bu siparişi iptal etmek istediğinize emin misiniz?')) return;

  const res = await fetch(`/v1/orders/${orderId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (handleAuthError(res, navigate, showToast)) return;

  if (res.ok) {
    showToast('Sipariş başarıyla iptal edildi.', 'success');
    // Optimistic UI güncellemesi:
    setOrders(orders.map(o =>
      o.id === orderId ? { ...o, status: 'İptal Edildi' } : o
    ));
  } else {
    const data = res.status !== 204 ? await res.json() : {};
    throw new Error(data.message || 'Sipariş iptal edilemedi');
  }
};
```

---

## 3. Sipariş Güncelleme

**API Endpoint:** `PUT /v1/orders/{orderId}`

### Kullanıcı — Adres Güncelleme
- Kargoya verilmemiş siparişlerde (`Onaylandı` veya `Hazırlanıyor`) adres güncellenebilir
- Backend yetki kontrolü: Sipariş sahibi veya admin izni gerekli
- Başarı → Toast (success)

### Admin — Sipariş Durumu Güncelleme
Sipariş durumu akışı:
```
Onaylandı → Hazırlanıyor → Kargoya Verildi → Teslim Edildi
                                                    ↕
                                              İptal Edildi
```

### Teknik Detaylar
```typescript
PUT /v1/orders/${orderId}
Authorization: Bearer ${token}
Content-Type: application/json

// Kullanıcı — adres güncelleme
Body: { address: "Yeni adres..." }

// Admin — durum güncelleme
Body: { status: "Kargoya Verildi" }
```

> ⚠️ Backend (`PUT /v1/orders/:orderId`) tam olarak implemente edilmiştir. Kullanıcı yalnızca adres güncelleyebilir, admin hem adres hem durum değiştirebilir.

---

## 4. Sipariş Listeleme

**Rota:** `/profile` → "Siparişlerim" sekmesi (`activeTab === 'orders'`)  
**API Endpoint:** `GET /v1/orders`  
**Bileşen:** `ProfilePage`

### Profil Sayfası Sekme Yapısı

```
┌──────────────────┬──────────────────┬──────────────────┐
│ 👤 Profil Bilgi. │ 📦 Siparişlerim  │ 🔒 Şifre/Güven. │
└──────────────────┴──────────────────┴──────────────────┘
```

### Sipariş Listesi Görünümü

```
┌─────────────────────────────────────────────────┐
│ [🟡 Onaylandı] • #AB12CD34       10 Nisan 2025 │
│                           Sipariş Tutarı        │
│                                    1.250 TL     │
│ [📦] [📦] [📦]                                  │
│                   [Detaylar] [İptal Et]         │
└─────────────────────────────────────────────────┘
```

### Durum Renk Kodları

| Durum | Tailwind Sınıfları |
|-------|-------------------|
| Hazırlanıyor | `bg-blue-100 text-blue-800` |
| Kargoya Verildi | `bg-purple-100 text-purple-800` |
| Teslim Edildi | `bg-green-100 text-green-800` |
| İptal Edildi | `bg-red-100 text-red-800` |
| Onaylandı / Beklemede | `bg-yellow-100 text-yellow-800` |

### Genişletilmiş Detay Paneli (Animasyonlu)

`expandedOrderId === order.id` → `motion.div` ile `height: 0 → auto` animasyonu

```
┌─────────────────────────────────────────────────────┐
│ 🚚 Teslimat Bilgileri    │ 💳 Ödeme Yöntemi        │
│ Ad Soyad                 │ [MC logo] Kredi Kartı   │
│ Adres metni              │ **** **** **** 4912      │
│ ℹ️ Kargo: Yurtiçi Kargo  │                         │
├─────────────────────────────────────────────────────┤
│ 📦 Sipariş İçeriği (3 Ürün)                        │
│ [img] Ürün Adı    Adet: 2    1.250 TL  [✏️ Yorum]  │
│ [img] Ürün Adı    Adet: 1      850 TL  [✏️ Yorum]  │
└─────────────────────────────────────────────────────┘
```

**Sol — Teslimat Bilgileri:**
- Ad Soyad (kullanıcı bilgisinden), adres metni, "Kargo: Yurtiçi Kargo" `Info` ikonu ile

**Sağ — Ödeme Yöntemi:**
- Kart logo (kırmızı + turuncu daire = Mastercard temsili)
- `**** **** **** ${order.paymentLast4 || '4912'}`

**Alt — Sipariş İçeriği:**
- Her ürün: görsel (64×64px `w-16 h-16`) + ad + adet + tutar + **"Yorum Yap"** butonu

### Ürün Üzerinden Yorum Yapma (Sipariş Detayından)
```typescript
// "Yorum Yap" butonuna tıklandığında:
setSelectedProductForReview({ id: item.productId, name: item.name });
setIsReviewModalOpen(true);
// ReviewModal açılır → handleReviewSubmit ile POST /v1/products/${id}/reviews
```

### Yükleme ve Boş Durumlar

**Yükleniyor:** `Loader2` beyaz kart içinde dönen spinner  
**Sipariş yok:**
```
┌─────────────────────────────────────┐
│         [📦 Büyük ikon]            │
│  Henüz siparişiniz bulunmuyor      │
│  [Alışverişe Başla →]  → /categories│
└─────────────────────────────────────┘
```

### Teknik Detaylar
```typescript
// State
const [orders, setOrders] = useState<any[]>([]);
const [loadingOrders, setLoadingOrders] = useState(true);
const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
const [selectedProductForReview, setSelectedProductForReview] = useState<{ id: string; name: string } | null>(null);

// Fetch
const res = await fetch('/v1/orders', {
  headers: { 'Authorization': `Bearer ${token}` }
});
if (handleAuthError(res, navigate, showToast)) return;
if (res.ok) {
  const data = await res.json();
  setOrders(Array.isArray(data) ? data : []);
}
```

---

## 5. Yorum Ekleme

**Rota:** `/product/:id` → "Yorum Yap" butonu  
**API Endpoint:** `POST /v1/products/{productId}/reviews`  
**Bileşen:** `ProductPage` + `ReviewModal`

### UI — Yorum Bölümü Üst Özet

```
★ ★ ★ ★ ☆  4.2   (18 Değerlendirme)
[En Yeni ▼]    [Yorum Yap]
```

- Ortalama puan: `reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length`
- Yıldız gösterimi: `Star` (dolu), `StarHalf` (yarım), `Star` (boş — `text-stone-300`)
- Sıralama seçenekleri: En Yeni, En Eski, En Yüksek Puan, En Düşük Puan, A-Z, Z-A

### ReviewModal Bileşeni

```
┌─────────────────────────────┐
│ Yorum Yap           [✕]    │
│ {Ürün Adı}                  │
│                             │
│   ★  ★  ★  ★  ☆            │
│         "İyi"               │
│                             │
│ YORUMUNUZ                   │
│ ┌─────────────────────┐     │
│ │ Ürün hakkında...    │     │
│ └─────────────────────┘     │
│                             │
│ [Değerlendirmeyi Gönder]    │
└─────────────────────────────┘
```

- Modal arka planı: `bg-slate-900/60 backdrop-blur-sm` — tıklayınca kapanır
- Modal animasyonu: `motion.div` ile `scale: 0.9 → 1`, `opacity: 0 → 1`

### Yıldız Puanlama Mantığı
```typescript
{[1, 2, 3, 4, 5].map(star => (
  <button
    onMouseEnter={() => setHover(star)}
    onMouseLeave={() => setHover(0)}
    onClick={() => setRating(star)}
    className="transition-transform active:scale-90"
  >
    <Star className={(hover || rating) >= star
      ? 'fill-yellow-500 text-yellow-500'
      : 'text-slate-300'} />
  </button>
))}

// Puan etiketi
1→'Çok Kötü' | 2→'Kötü' | 3→'Normal' | 4→'İyi' | 5→'Harika!'
```

### Kullanıcı Deneyimi
- Yorum metni boşsa "Değerlendirmeyi Gönder" butonu `disabled + opacity-50`
- Giriş yapılmamışsa → Toast "Yorum yapmak için giriş yapın." + `/login` yönlendirme
- **Başarı:** Toast "Yorumunuz eklendi." (success) + yorum `[yeniYorum, ...eskiYorumlar]` listesine eklenir
- **Hata:** Toast hata mesajı (error)
- Modal her durumda kapanır (`setIsReviewModalOpen(false)`)

### Yorum Düzenleme (Mevcut Yorumu Güncelleme)

Yorum sahibi, kendi yorumundaki `Edit` ikonuna tıklayarak ReviewModal'ı düzenleme modunda açabilir:

```typescript
// Düzenleme butonuna tıklandığında:
setReviewToEdit(review);
setIsReviewModalOpen(true);
// Modal açıldığında initialRating ve initialComment mevcut değerlerle dolar
```

### Teknik Detaylar
```typescript
// Yeni yorum ekleme
POST /v1/products/${product._id}/reviews
Authorization: Bearer ${token}
Content-Type: application/json
Body: { rating, comment }

// Başarı sonrası
const newReview = await res.json();
setReviews([newReview, ...reviews]);

// Düzenleme modunda (reviewToEdit varsa)
PUT /v1/products/${product._id}/reviews/${reviewToEdit.id}
Authorization: Bearer ${token}
Body: { rating, comment }

// Başarı sonrası
setReviews(reviews.map(r =>
  (r.id || r._id) === (reviewToEdit.id || reviewToEdit._id)
    ? { ...r, rating, comment }
    : r
));
```

---

## 6. Yorum Silme

**Rota:** `/product/:id` — yorum kartı  
**API Endpoint:** `DELETE /v1/products/{productId}/reviews/{reviewId}`  
**Bileşen:** `ProductPage` — `handleDeleteReview`

### Görünürlük Koşulu
```typescript
(currentUser?.role === 'admin') || (currentUser?.id === review.userId)
```
Admin tüm yorumları silebilir, kullanıcı yalnızca kendi yorumunu silebilir.

### UI Bileşeni

```
┌──────────────────────────────────────────────┐
│ [EB] Ebrar Karakoç         ★★★★☆  [✏️] [🗑] │
│      10 Nisan 2025                           │
│ "Ürün kalitesi çok iyi, hızlı kargo."       │
└──────────────────────────────────────────────┘
```

- Yorum kartının sağ üst köşesinde `Trash2` ikonu butonu
- Renk: `text-red-500 hover:bg-red-50 rounded-xl`
- `window.confirm` dialogu: *"Bu yorumu silmek istediğinize emin misiniz?"*

### Kullanıcı Deneyimi
- Onay reddedilirse → işlem iptal (return)
- **Başarı:** Toast "Yorum başarıyla silindi." (success)
- Yorum listeden kaldırılır: `setReviews(reviews.filter(r => (r.id || r._id) !== reviewId))`
- **Hata:** Toast "Yorum silinemedi." (error)
- 401 yanıtı → `handleAuthError` ile otomatik çıkış

### Teknik Detaylar
```typescript
const handleDeleteReview = async (reviewId: string) => {
  if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;

  const token = localStorage.getItem('token');
  const res = await fetch(`/v1/products/${product._id}/reviews/${reviewId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (handleAuthError(res, navigate, showToast)) return;

  if (res.ok || res.status === 204) {
    showToast('Yorum başarıyla silindi.', 'success');
    setReviews(reviews.filter(r => (r.id || r._id) !== reviewId));
  } else {
    showToast('Yorum silinemedi.', 'error');
  }
};
```
