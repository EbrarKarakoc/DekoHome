# Şerife Nur Yılmaz - Gereksinimler

---

## 1. Kategori Ekleme (Admin Add Category)

**Açıklama:**

- **API Metodu:** `POST /categories`
- Satıcı veya yönetici, ürünleri organize etmek amacıyla sisteme yeni bir kategori ekleyebilir.
- Kategori adı, açıklaması ve varsa üst kategori bilgileri girilerek veritabanına kaydedilir.
- Bu işlem yalnızca admin yetkisine sahip kullanıcılar tarafından gerçekleştirilebilir.

---

## 2. Kategori Güncelleme (Admin Update Category)

**Açıklama:**

- **API Metodu:** `PUT /categories/{categoryId}`
- Mevcut bir kategorinin ismi, açıklaması veya hiyerarşik konumu değiştirilebilir.
- Yapılan güncellemeler veritabanında anlık olarak işlenir ve kullanıcı arayüzüne yansıtılır.
- Yalnızca admin yetkisiyle erişilebilir bir fonksiyondur.

---

## 3. Kategori Listeleme (View Categories)

**Açıklama:**

- **API Metodu:** `GET /categories`
- Sistemde tanımlı tüm kategoriler, kullanıcıların ürünlere hızlı erişmesi için hiyerarşik yapıda listelenir.
- Hem web hem mobil arayüzde menü yapısının dinamik oluşturulması için kullanılır.
- Tüm kullanıcılar (misafir veya kayıtlı) tarafından görüntülenebilir.

---

## 4. Kategori Silme (Admin Delete Category)

**Açıklama:**

- **API Metodu:** `DELETE /categories/{categoryId}`
- İhtiyaç duyulmayan veya yanlış açılan kategorilerin sistemden kaldırılmasını sağlar.
- Silme işlemi öncesinde kategorinin boş olup olmadığı kontrol edilerek veri bütünlüğü korunur.
- Yalnızca yönetici (admin) profili tarafından gerçekleştirilebilir.

---

## 5. Ürün Güncelleme (Admin Update Product)

**Açıklama:**

- **API Metodu:** `PUT /products/{productId}`
- Satıcı, mevcut bir ürünün fiyatını, stok miktarını, açıklamasını veya kategori bilgisini güncelleyebilir.
- Güncelleme sonrası değişiklikler ürün sayfasına anında yansıtılır.

---

## 6. Ürünleri Listeleme (View Products)

**Açıklama:**

- **API Metodu:** `GET /products`
- Sistemde kayıtlı tüm ürünlerin bir liste halinde sunulmasını sağlar.
- Ürünler kategoriye, fiyata veya isme göre filtrelenebilir ve sıralanabilir.
- Sayfalama desteği ile yüksek performanslı çalışma hedeflenir.

---

## 7. Kampanya Slaytlarını Görüntüle (View Promo Sliders)

**Açıklama:**

- **API Metodu:** `GET /sliders`
- Ana sayfada gösterilecek olan promosyon ve kampanya slaytlarının listesini getirir.
- Her slayt başlık, görsel ve yönlendirme bağlantısı içerir.
- Dinamik banner gösterimi için tüm kullanıcılar tarafından erişilebilir.
