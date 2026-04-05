# Şerife Nur Yılmaz — Web Frontend Görevleri

**Proje:** DekoHome Web Uygulaması  
**Frontend Adresi:** [dekohome-api.onrender.com](https://dekohome-api.onrender.com)  
**Kaynak Dosya:** `web-frontend/src/App.tsx`  
**Front-end Test Videosu:** [![▶ Videoyu İzle](https://img.shields.io/badge/YouTube-Gereksinim%20Videosu-red?logo=youtube&style=for-the-badge)](https://youtu.be/1f85hezQsTw?si=NvyQYOwkbsZ1cV05)

> [!NOTE]
> **Front-end Entegrasyon Durumu Hakkında Not:**
>
> Üstlendiğim gereksinimlerden **"Kategori Listeleme"** ve **"Ürün Listeleme"** (`GET`) metotları front-end tarafına başarıyla entegre edilmiş olup, veriler web sitemizin arayüzünde dinamik olarak sergilenmektedir *(videoda gösterilmiştir)*.
>
> Ancak **Ekleme, Silme ve Güncelleme** (`POST`, `PUT`, `DELETE`) işlemleri için projemizin Admin Paneli arayüzü henüz geliştirme aşamasında olduğundan, bu metotların veri akışı ve veritabanı yansımaları **Postman** üzerinden test edilip web sitemizin canlı arayüzünden anlık olarak doğrulanmıştır.

---

## Genel Bilgiler

| Özellik | Detay |
|---------|-------|
| Framework | React 18 + TypeScript |
| Routing | React Router DOM v6 |
| State Yönetimi | `useState`, `useEffect` hooks |
| Bildirimler | `useToast()` — global context |
| Admin Kontrolü | `JSON.parse(localStorage.getItem('user')).role === 'admin'` |
| Auth Hata Yönetimi | `handleAuthError(res, navigate, showToast)` |

---

## 1. Kategori Güncelleme (Admin)

**Rota:** `/categories` — admin görünümü  
**API Endpoint:** `PUT /v1/categories/{categoryId}`

> ⚠️ Yalnızca `role === 'admin'` yetkisindeki kullanıcılar erişebilir.

### UI Bileşenleri
- Kategori listesinde "Düzenle" butonu (`Edit` ikonu) — yalnızca admin için görünür
- Düzenleme formu / modal:

| Alan | Mevcut Değer | Açıklama |
|------|-------------|----------|
| Kategori Adı | Dolu | Zorunlu, min. 2 karakter |
| Açıklama | Dolu | Opsiyonel |
| Üst Kategori | Seçili | Parent kategori değiştirme |

- **"Kaydet"** butonu (sarı) — değişiklik yoksa `disabled`
- **"İptal"** butonu (gri) — formu kapatır

### Kullanıcı Deneyimi
- Başarı → Toast "Kategori güncellendi." (success) + `GET /v1/categories` ile liste yenilenir
- Hata → Toast "Güncelleme başarısız ." (error)
- 401 yanıtı → `handleAuthError` ile otomatik çıkış + `/login` yönlendirme

### Teknik Detaylar
```typescript
PUT /v1/categories/${categoryId}
Authorization: Bearer ${token}
Content-Type: application/json
Body: { name, description, parentId }
```

---

## 2. Kategori Listeleme

**Rota:** `/categories`, `/` (Ana Sayfa), Header  
**API Endpoint:** `GET /v1/categories`  
**Bileşenler:** `CategoryTreeItem`, `CategoryDropdownItems`, `HomePage`

### Header Dropdown — `CategoryDropdownItems`

```
Tüm Ürünler (link)
─────────────────
Oturma Odası
  ↳ Koltuklar
  ↳ Sehpalar
Yatak Odası
  ↳ Yataklar
...
```

- `hover` ile açılır (CSS `group-hover:opacity-100`)
- `fetch('/v1/categories')` → `useState<Category[]>`
- Max 8 kategori: `cats.slice(0, 8)`
- Seçim: `localStorage.setItem('selectedCategory', cat._id)` + `categorySelect` eventi dispatch

### Ana Sayfa Kategori Bölümü

- `grid-cols-2 sm:grid-cols-3 lg:grid-cols-6` — 6 kategori
- Boş API durumunda statik fallback: Oturma Odası, Yatak Odası, Mutfak, Ofis, Depolama, Dekorasyon
- Kart: Yuvarlak ikon (Lucide) + kategori adı
- Hover: `hover:shadow-xl hover:-translate-y-1 hover:border-yellow-100`
- İkon eşleme: `getIcon(cat.name)` — Sofa, Bed, Utensils, Briefcase, Package, Sparkles

### Sidebar Kategori Ağacı — `CategoryTreeItem`

Recursive bileşen, hiyerarşik yapıyı render eder:

```
[✓] Oturma Odası        (12) ▼
    ├── Koltuklar        (5)
    └── Sehpalar         (7)
[ ] Yatak Odası          (8) ▼
    └── Yataklar         (8)
```

- Seçili: `bg-yellow-50 text-yellow-700 font-bold`
- Ürün sayısı: `getProductCount(category)` — kendi + tüm alt kategoriler recursive sayılır
- Alt kategori toggle: `ChevronRight` → `rotate-90` açıkken
- Padding: `paddingLeft: ${level * 12 + 12}px` — derinlik göstergesi

### Teknik Detaylar

```typescript
interface Category {
  _id: string;
  name: string;
  description?: string;
  children?: Category[];
}

// Fetch
fetch('/v1/categories')
  .then(res => res.json())
  .then(data => setCategories(Array.isArray(data) ? data : (data.data || [])));
```

---

## 3. Ürün Ekleme (Admin)

**Rota:** `/categories` — üst sağ köşe (admin görünümü)  
**API Endpoint:** `POST /v1/products`

> ⚠️ Yalnızca `role === 'admin'` yetkisindeki kullanıcılar görebilir.

### UI — "Yeni Ürün Ekle (Admin)" Butonu

```
[📦 Yeni Ürün Ekle (Admin)]  ← slate-900 arka plan, sadece admin
```

Prompt tabanlı sıralı veri girişi:

| Sıra | Alan | Tip | Varsayılan |
|------|------|-----|-----------|
| 1 | Ürün Adı | text | — |
| 2 | Fiyat | number | — |
| 3 | Açıklama | text | — |
| 4 | Kategori İsmi | text | — |
| 5 | Stok Miktarı | number | `10` |
| 6 | Görsel URL'leri | text (virgülle ayrılmış) | — |

### Kategori Çözümleme
```typescript
// Kategori adından ID çözümleme
fetch('/v1/categories')
  .then(cats => {
    const findInTree = (items: Category[]): Category | undefined => {
      for (const c of items) {
        if (c.name === categoryName) return c;
        if (c.children) {
          const found = findInTree(c.children);
          if (found) return found;
        }
      }
    };
    const cat = findInTree(cats);
    if (!cat) { alert('Hatalı kategori ismi!'); return; }
    // Ürün ekle...
  });
```

### API İsteği
```typescript
POST /v1/products
Authorization: Bearer ${token}
Content-Type: application/json
Body: {
  name,
  price: Number(price),
  description: desc,
  categoryId: cat._id,
  stock: Number(stock),
  images: imageUrls.split(',').map(s => s.trim()),
  imageUrl: images[0] || ''
}
```

### Kullanıcı Deneyimi
- Başarı → `alert('Ürün başarıyla eklendi!')` + `window.location.reload()`
- Hata → `alert('Ekleme başarısız: ' + errorMessage)`

---

## 4. Ürün Güncelleme (Admin)

**Rota:** `/product/:id` — ürün detay sayfası  
**API Endpoint:** `PUT /v1/products/{productId}`

> ⚠️ Yalnızca `role === 'admin'` yetkisindeki kullanıcılar görebilir.

### UI Bileşenleri
- Ürün detay sayfasında "Ürünü Düzenle" butonu (admin için)
- Modal / inline form:

| Alan | Mevcut Değer | Zorunlu |
|------|-------------|---------|
| Ürün Adı | Dolu | ✅ |
| Fiyat (TL) | Dolu | ✅ |
| Açıklama | Dolu | ✅ |
| Kategori | Dropdown seçimi | ✅ |
| Stok | Dolu | ✅ |
| Görsel URL | Dolu | ❌ |

- **"Kaydet"** (sarı) · **"İptal"** (gri)

### Kullanıcı Deneyimi
- Başarı → Toast "Ürün güncellendi." (success) + sayfa verisi yenilenir
- Hata → Toast "Güncelleme başarısız." (error)

---

## 5. Ürün Listeleme

**Rota:** `/` (ana sayfa) + `/categories`  
**API Endpoint:** `GET /v1/products`  
**Bileşenler:** `HomePage`, `CategoriesPage`

### Ana Sayfa — Öne Çıkan Ürünler (ilk 4 ürün)

```
[Ürün Görseli 4:5]
Ürün Adı
Kısa açıklama
1.250 TL
[🛍 Sepete Ekle]
```

- `products.slice(0, 4)` — ilk 4 ürün
- `Link to="/product/${prod._id}"` — kartın tamamı tıklanabilir
- `e.preventDefault() + e.stopPropagation()` — "Sepete Ekle" butonu link içinde

### Kategoriler Sayfası — Tüm Ürünler

Grid ve Filtreleme:

```
[Sidebar]     [Ürün Grid — 3 sütun]
Kategoriler   ┌────┬────┬────┐
[ ] Yatak     │Ürün│Ürün│Ürün│
[✓] Koltuk    ├────┼────┼────┤
              │Ürün│Ürün│Ürün│
              └────┴────┴────┘
              [← Filtreleri Temizle →]
```

| Özellik | Detay |
|---------|-------|
| Grid | `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3` |
| Görsel | `aspect-[4/5]`, `object-cover`, `group-hover:scale-105` |
| Kategori Badge | Görsel üzeri `bg-white/90 backdrop-blur` |
| Fiyat | `toLocaleString('tr-TR')` TL |
| Hover | `hover:shadow-xl` kart efekti |

### Arama & Filtreleme Mantığı
```typescript
// Metin araması
const matchesSearch = product.name.toLowerCase().includes(searchQuery) ||
                      product.desc.toLowerCase().includes(searchQuery);

// Kategori filtresi — hiyerarşik
const getAllChildIds = (c: Category): string[] => {
  let ids = [String(c._id)];
  c.children?.forEach(child => { ids = [...ids, ...getAllChildIds(child)]; });
  return ids;
};
```

### Boş Durum
```
[🔍 Büyük ikon]
Ürün bulunamadı
[Filtreleri Temizle]
```

### Teknik Detaylar
```typescript
interface Product {
  _id?: string;
  id?: number;
  name: string;
  price: number;
  desc: string;
  category: string;
  categoryId?: string;
  imageUrl: string;
}

// Fetch
fetch('/v1/products')
  .then(data => {
    const products = Array.isArray(data) ? data : (data.products || data.data || []);
    setAllProducts(products);
  });
```

---

## 6. Ürün Silme (Admin)

**Rota:** `/product/:id` — ürün detay sayfası  
**API Endpoint:** `DELETE /v1/products/{productId}`

> ⚠️ Yalnızca `role === 'admin'` yetkisindeki kullanıcılar görebilir.

### UI Bileşenleri
- "Ürünü Sil" butonu — kırmızı, yalnızca admin
- `window.confirm` onay dialogu: *"Bu ürünü silmek istediğinize emin misiniz?"*

### Kullanıcı Deneyimi
- Başarı → Toast "Ürün silindi." (success) + `/categories` yönlendirme
- Hata → Toast "Silme işlemi başarısız." (error)

### Teknik Detaylar
```typescript
// Yetki kontrolü
const isAdmin = JSON.parse(localStorage.getItem('user') || '{}').role === 'admin';

// API İsteği
DELETE /v1/products/${productId}
Authorization: Bearer ${token}
```