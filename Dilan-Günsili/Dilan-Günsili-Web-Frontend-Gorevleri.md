# Dilan Günsili — Web Frontend Görevleri

**Proje:** DekoHome Web Uygulaması  
**Frontend Adresi:** [dekohome-api.onrender.com](https://dekohome-api.onrender.com)  
**Kaynak Dosya:** `web-frontend/src/App.tsx`  
**Front-end Test Videosu:** [YouTube_vidom] (https://youtu.be/E1DHQ14ZKjQ?si=_FaVOW9ZlWSp_HTj)

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

## 1. Sepete Ürün Ekleme

**API Endpoint:** `POST /v1/cart/items`  
**Tetiklendiği Sayfalar:** `/` (Ana Sayfa) · `/categories` · `/product/:id`  
**Bileşenler:** `HomePage`, `CategoriesPage`, `ProductPage`

### "Sepete Ekle" Butonu Varyantları

| Sayfa | Buton Stili |
|-------|------------|
| Ana Sayfa | `bg-yellow-600` + `ShoppingBag` ikonu |
| Kategoriler | `bg-slate-900 hover:bg-yellow-600` |
| Ürün Detay | `bg-slate-900 rounded-full` tam genişlik |

> ⚠️ Kart içindeki butonlar `e.preventDefault()` + `e.stopPropagation()` ile korunur (Link tıklamasını engeller).

### Header Sepet Sayacı

```
🛍 [●]  ← Animasyonlu sarı nokta (cartCount > 0 ise)
```

```typescript
// Ping animasyonu
<span className="animate-ping absolute inline-flex h-full w-full
  rounded-full bg-yellow-400 opacity-75" />
<span className="relative inline-flex rounded-full h-3 w-3
  bg-yellow-500 border-[1.5px] border-white" />
```

Sayaç kaynağı:
```typescript
fetch('/v1/cart', { headers: { 'Authorization': `Bearer ${token}` } })
  .then(data => {
    const items = data.items || [];
    setCartCount(items.reduce((acc, item) => acc + item.quantity, 0));
  });
```

### Kullanıcı Deneyimi
- Giriş yapılmamışsa → Toast "Sepete ürün eklemek için giriş yapmalısınız." (error) → `/login`
- **Başarı:** `window.dispatchEvent(new Event('cartUpdated'))` + Toast "Ürün sepete eklendi." (success)
- Ürün detay sayfasında başarı sonrası → `/cart` yönlendirme
- **Hata:** Toast hata mesajı (error)
- 401 → `handleAuthError` → otomatik çıkış

### Teknik Detaylar
```typescript
const handleAddToCart = async (product: any) => {
  const token = localStorage.getItem('token');
  if (!token) { showToast('...', 'error'); navigate('/login'); return; }

  const res = await fetch('/v1/cart/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      productId: String(product._id || product.id),
      quantity: 1
    })
  });

  if (res.ok) {
    window.dispatchEvent(new Event('cartUpdated'));
    showToast('Ürün sepete eklendi.', 'success');
  }
};
```

---

## 2. Sepetten Ürün Silme

**Rota:** `/cart`  
**API Endpoint:** `DELETE /v1/cart/items/{itemId}`  
**Bileşen:** `CartPage` — `handleRemoveItem`

### UI Bileşeni
- Sepet öğesinin sağ alt köşesinde: `Trash2` ikonu + "Sil" metin
- Renk: `text-stone-400 hover:text-red-500`

### Kullanıcı Deneyimi
- Onay dialogu yoktur — hızlı akış
- **Başarı:** Toast "Ürün sepetten silindi" (success)
- Liste anlık güncellenir: `setCartItems(prev => prev.filter(item => item.itemId !== itemId))`
- `window.dispatchEvent(new Event('cartUpdated'))` → Header sayacı düşer
- Silme sonrası sepet toplam tutarı için `GET /v1/cart` yeniden çağrılır
- **Hata:** Toast "Ürün silinemedi" (error)

### Teknik Detaylar
```typescript
const handleRemoveItem = async (itemId: string) => {
  const res = await fetch(`/v1/cart/items/${itemId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (res.ok) {
    setCartItems(prev => prev.filter(item => item.itemId !== itemId));
    window.dispatchEvent(new Event('cartUpdated'));
    // Güncel toplamı almak için sepeti tekrar çek
    const cartRes = await fetch('/v1/cart', { headers: { 'Authorization': `Bearer ${token}` } });
    if (cartRes.ok) { const data = await cartRes.json(); setTotal(data.total || 0); }
    showToast('Ürün sepetten silindi', 'success');
  }
};
```

---

## 3. Sepet Güncelleme (Adet Değiştirme)

**Rota:** `/cart`  
**API Endpoint:** `PUT /v1/cart/items/{itemId}`  
**Bileşen:** `CartPage` — `handleUpdateQuantity`

### UI — Adet Kontrol Grubu

```
┌───┬───┬───┐
│ - │ 3 │ + │    ← border border-stone-200 rounded-lg
└───┴───┴───┘
```

- `-` butonu: `handleUpdateQuantity(item.itemId, item.quantity - 1)`
- `+` butonu: `handleUpdateQuantity(item.itemId, item.quantity + 1)`
- Adet göstergesi: `w-8 text-center font-medium text-sm`

### Validasyon
```typescript
const handleUpdateQuantity = async (itemId: string, newQuantity: number) => {
  if (newQuantity < 1) return; // 0'ın altına düşemez
  // ...
};
```

### Kullanıcı Deneyimi
- Değişiklik anında API'ye gönderilir
- **Başarı:** `setCartItems(data.items)` + `setTotal(data.total)` — tam liste API'den güncellenir
- `window.dispatchEvent(new Event('cartUpdated'))` → Header sayacı güncellenir
- **Hata:** Toast "Miktar güncellenemedi" (error)

### Teknik Detaylar
```typescript
const res = await fetch(`/v1/cart/items/${itemId}`, {
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ quantity: newQuantity })
});

if (res.ok) {
  const data = await res.json();
  setCartItems(data.items);   // Güncel liste
  setTotal(data.total);       // Güncel toplam
  window.dispatchEvent(new Event('cartUpdated'));
}
```

---

## 4. Sepet Listeleme

**Rota:** `/cart`  
**API Endpoint:** `GET /v1/cart`  
**Bileşen:** `CartPage`

### Sayfa Yapısı

**İki sütun Grid:**

```
┌────────────────────────────┬──────────────────────┐
│  Alışveriş Sepeti          │  Sipariş Özeti        │
│  "Eviniz için 3 harika..." │  Sticky top-28        │
│                            │                       │
│  [Ürün Kartı]              │  Ara Toplam  1.200 TL │
│  [Ürün Kartı]              │  Kargo       Ücretsiz │
│  [Ürün Kartı]              │  ─────────────────── │
│                            │  Toplam   1.200 TL ←  │
│                            │  (text-yellow-600)    │
│                            │                       │
│                            │  [Ödeme Yap →]        │
│                            │  [Alışverişe Devam]   │
└────────────────────────────┴──────────────────────┘
```

### Sepet Öğe Kartı

```
┌──────────────────────────────────────────────────────┐
│ [📷 128×128px]  Ürün Adı                  270 TL    │
│                 ┌───┬───┬───┐   [🗑 Sil]            │
│                 │ - │ 3 │ + │                        │
│                 └───┴───┴───┘                        │
└──────────────────────────────────────────────────────┘
```

- Görsel: `w-32 aspect-square` + `object-cover` + fallback: `picsum`
- Fiyat: `item.price × item.quantity` → `toLocaleString('tr-TR') TL`
- Kart stili: `bg-white p-6 rounded-xl border border-stone-100 shadow-sm`

### Sipariş Özeti Paneli (Sticky)
- `sticky top-28` — scroll'da sabit kalır
- Kargo: doğrudan **"Ücretsiz"** (`text-green-600`)
- "Ödeme Yap" → `/checkout` yönlendirme
- "Alışverişe Devam Et" → `/categories`

### Boş Sepet Durumu
```
        [🛍 Büyük ikon — text-stone-300]
  Sepetinizde ürün bulunmuyor
  Hemen alışverişe başlayarak sepetinizi doldurabilirsiniz.
                [Alışverişe Başla]  → /categories
```

### Yükleme ve Yetki Kontrolü
```typescript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (!token) {
    showToast('Sepetinizi görmek için giriş yapmalısınız.', 'info');
    navigate('/login');
    return;
  }
  fetchCartAndProducts();
}, [navigate]);
```

### Teknik Detaylar
```typescript
// State
const [cartItems, setCartItems] = useState<any[]>([]);
const [total, setTotal]         = useState(0);
const [loading, setLoading]     = useState(true);

// Fetch Akışı (paralel)
const prodRes  = await fetch('/v1/products');          // Ürün detayları
const cartRes  = await fetch('/v1/cart', {             // Sepet içeriği
  headers: { 'Authorization': `Bearer ${token}` }
});
const cartData = await cartRes.json();
setCartItems(cartData.items || []);
setTotal(cartData.total || 0);
```

---

## 5. Yorum Güncelleme

**Rota:** `/product/:id` — yorum kartı  
**API Endpoint:** `PUT /v1/reviews/{reviewId}`  
**Bileşen:** `ProductPage` — `handleSubmitReview` (düzenleme modu)

### Görünürlük Koşulu
`Edit` ikonu butonu şu koşulda görünür:
```typescript
currentUser?.id === review.userId  // Yalnızca yorum sahibi
```

### UI Bileşeni
- Yorum kartında sarı `Edit` ikonu butonu: `text-yellow-600 hover:bg-yellow-50`
- Tıklandığında:
  1. `setReviewToEdit(review)` → mevcut yorum state'e kaydedilir
  2. `setIsReviewModalOpen(true)` → ReviewModal açılır
  3. Modal `initialRating={reviewToEdit.rating}` ve `initialComment={reviewToEdit.comment}` ile dolup gelir

### ReviewModal — Düzenleme Modu

Modal başlık: "Yorum Yap" (aynı modal, düzenleme verisini taşır)

```
★ ★ ★ ★ ☆  ← Mevcut puanla başlar
"İyi"

[Mevcut yorum metni ile dolu textarea]

[Değerlendirmeyi Gönder]
```

### Kullanıcı Deneyimi
- **Başarı:** Toast "Yorumunuz güncellendi." (success)
- UI anlık güncellenir (sayfa yenilenmeden):
  ```typescript
  setReviews(reviews.map(r =>
    (r.id || r._id) === (reviewToEdit.id || reviewToEdit._id)
      ? { ...r, rating, comment }
      : r
  ));
  ```
- **Hata:** Toast "Yorum güncellenemedi." (error)
- Her durumda: `setIsReviewModalOpen(false)` + `setReviewToEdit(null)`

### Teknik Detaylar
```typescript
// handleSubmitReview — düzenleme dalı
if (reviewToEdit) {
  const res = await fetch(`/v1/reviews/${reviewToEdit.id || reviewToEdit._id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ rating, comment })
  });

  if (res.ok) {
    showToast('Yorumunuz güncellendi.', 'success');
    setReviews(reviews.map(r =>
      (r.id || r._id) === (reviewToEdit.id || reviewToEdit._id)
        ? { ...r, rating, comment } : r
    ));
  } else {
    showToast('Yorum güncellenemedi.', 'error');
  }
}
```

---

## 6. Yorum Listeleme

**Rota:** `/product/:id` — "Müşteri Deneyimleri" bölümü  
**API Endpoint:** `GET /v1/products/{productId}/reviews`  
**Bileşen:** `ProductPage`

### Genel Puan Özeti

```
★ ★ ★ ★ ☆   4.2   (18 Değerlendirme)
```

```typescript
// Ortalama hesaplama
const avg = reviews.length > 0
  ? reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length
  : 0;

// Yıldız render
idx + 1 <= avg    → <Star className="fill-current" />      // Dolu
idx + 0.5 <= avg  → <StarHalf className="fill-current" />  // Yarım
diğer             → <Star className="text-stone-300" />    // Boş
```

### Sıralama Dropdown'u

| Değer | Sıralama |
|-------|---------|
| `newest` (varsayılan) | Tarihe göre azalan (en yeni) |
| `oldest` | Tarihe göre artan (en eski) |
| `highest` | Puana göre azalan |
| `lowest` | Puana göre artan |
| `az` | Kullanıcı adına göre A→Z |
| `za` | Kullanıcı adına göre Z→A |

```typescript
const sortedReviews = [...reviews].sort((a, b) => {
  switch (sortBy) {
    case 'oldest':  return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    case 'highest': return b.rating - a.rating;
    case 'lowest':  return a.rating - b.rating;
    case 'az':      return (a.userName || '').localeCompare(b.userName || '');
    case 'za':      return (b.userName || '').localeCompare(a.userName || '');
    default:        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
  }
});
```

### Yorum Kartı

```
┌────────────────────────────────────────────────────┐
│ [AK]  Ahmet Kaya              ★ ★ ★ ★ ☆  [✏] [🗑] │
│       10 Nisan 2025                                │
│                                                    │
│ "Ürün gerçekten çok kaliteli, hızlı kargo..."     │
└────────────────────────────────────────────────────┘
```

| Eleman | Detay |
|--------|-------|
| Avatar | `w-12 h-12` dairesel badge, kullanıcı adından `substring(0,2)` baş harfler |
| Ad | `review.userName \|\| 'Anonim'` |
| Tarih | `toLocaleDateString('tr-TR', { day:'numeric', month:'long', year:'numeric' })` |
| Yıldızlar | Dolu: `fill-current`, Boş: `text-stone-300` — `scale-75` boyutunda |
| Yorum | `italic` font, `"..."` tırnak içinde |
| Edit butonu | Yalnızca yorum sahibine → `text-yellow-600 hover:bg-yellow-50` |
| Sil butonu | Yorum sahibi + Admin → `text-red-500 hover:bg-red-50` |

### Boş Durum
```
Henüz yorum yapılmamış. İlk yorumu siz yapın!
```

### Teknik Detaylar
```typescript
// Fetch — sayfa yüklendiğinde
fetch(`/v1/products/${found._id}/reviews`)
  .then(res => res.json())
  .then(data => setReviews(Array.isArray(data) ? data : []));

// State
const [reviews, setReviews] = useState<any[]>([]);
const [sortBy, setSortBy]   = useState<'newest'|'oldest'|'highest'|'lowest'|'az'|'za'>('newest');
const [currentUser, setCurrentUser] = useState<any>(null);

// Kullanıcı bilgisi
const storedUser = localStorage.getItem('user');
if (storedUser) setCurrentUser(JSON.parse(storedUser));
```