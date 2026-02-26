# Şerife Nur Yılmaz - Gereksinimler

---

## 1. Kategori Ekleme (Admin Add Category)
**Açıklama:**
- **API Metodu:** `POST /categories`
- Ürünlerin organize edilmesi için sisteme yeni bir kategori eklenmesini sağlar.
- Kategori adı, açıklaması ve üst kategori bilgisi girilerek veritabanına kaydedilir.
- Yalnızca admin tarafından gerçekleştirilebilir.

---

## 2. Kategori Güncelleme (Admin Update Category)
**Açıklama:**
- **API Metodu:** `PUT /categories/{categoryId}`
- Mevcut bir kategorinin adı, açıklaması veya üst kategori bilgisinin güncellenmesini sağlar.
- Güncelleme sonrası değişiklikler anında sisteme yansıtılır.
- Yalnızca admin tarafından gerçekleştirilebilir.

---

## 3. Kategori Listeleme (View Categories)
**Açıklama:**
- **API Metodu:** `GET /categories`
- Sistemde tanımlı tüm kategorilerin listelenmesini sağlar.
- Ana kategoriler ve alt kategoriler hiyerarşik yapıda görüntülenir.
- Hem web hem mobil arayüzde menü yapısının oluşturulması için kullanılır.
- Tüm kullanıcılar tarafından erişilebilir.

---

## 4. Kategori Silme (Admin Delete Category)
**Açıklama:**
- **API Metodu:** `DELETE /categories/{categoryId}`
- Sistemde kayıtlı olan ve artık kullanılmayan bir kategorinin silinmesini sağlar.
- Silme işlemi öncesinde kategoriye bağlı ürün kontrolü yapılır.
- Yalnızca admin tarafından gerçekleştirilebilir.

---

## 5. Ürün Güncelleme (Admin Update Product)
**Açıklama:**
- **API Metodu:** `PUT /products/{productId}`
- Mevcut bir ürünün adı, açıklaması, fiyatı, stok miktarı veya kategori bilgisinin güncellenmesini sağlar.
- Güncelleme sonrası değişiklikler ürün sayfasına anında yansıtılır.
- Yalnızca admin tarafından gerçekleştirilebilir.

---

## 6. Ürün Listeleme (View Products)
**Açıklama:**
- **API Metodu:** `GET /products`
- Sistemde kayıtlı tüm ürünlerin listelenmesini sağlar.
- Ürünler kategoriye, fiyata veya isme göre filtrelenebilir ve sıralanabilir.
- Tüm kullanıcılar tarafından erişilebilir.

---

## 7. Slayt Görüntüleme (View Sliders)
**Açıklama:**
- **API Metodu:** `GET /sliders`
- Ana sayfada gösterilecek promosyon ve kampanya slaytlarının listelenmesini sağlar.
- Her slayt için başlık, görsel, yönlendirme bağlantısı ve sıra bilgisi döndürülür.
- Tüm kullanıcılar tarafından erişilebilir.
