# Dilan Günsili - Gereksinimler

---

# E-Ticaret Sepet ve Yorum Sistemi Gereksinimleri

**Geliştirici:** Dilan Günsili

Bu doküman, sistemdeki **Sepet Yönetimi** ve **Ürün Yorumları** modüllerine ait API uç noktalarını ve iş kurallarını kapsamaktadır.

---

## 🛍️ Sepet Yönetimi (Cart Management)

Kullanıcıların alışveriş süreçlerini yönettikleri temel fonksiyonları içerir.

### 1. Sepete Ürün Ekleme

* **Endpoint:** `POST /cart/items`
* **Yetki:** 🔐 Giriş Yapmış Kullanıcı
* **Açıklama:** Belirli bir ürünü sepete ekler.
* **Mantık:** Ürün zaten sepette varsa miktar artırılır; yoksa yeni kayıt açılır.
* **Kısıt:** Stok miktarından fazla ekleme yapılamaz. Stok yetersizse hata mesajı döner.



### 2. Sepetten Ürün Silme

* **Endpoint:** `DELETE /cart/items/{itemId}`
* **Yetki:** 🔐 Giriş Yapmış Kullanıcı
* **Açıklama:** Ürünü sepetten tamamen kaldırır. İşlem sonrası sepet toplam tutarı otomatik olarak güncellenir.

### 3. Sepet Güncelleme

* **Endpoint:** `PUT /cart/items/{itemId}`
* **Yetki:** 🔐 Giriş Yapmış Kullanıcı
* **Açıklama:** Sepetteki ürünün miktarını (adet) değiştirir.
* **Mantık:** Yeni miktar üzerinden ara toplam ve genel toplam yeniden hesaplanır.
* **Kısıt:** Yeni miktar mevcut stok sınırları içinde olmalıdır.



### 4. Sepet Listeleme

* **Endpoint:** `GET /cart`
* **Yetki:** 🔐 Giriş Yapmış Kullanıcı
* **Açıklama:** Sepetteki tüm ürünleri detaylarıyla listeler.
* **Gösterilen Veriler:** Ürün adı, görsel, birim fiyat, adet, ara toplam ve sepetin **genel toplamı**.


---

## 💬 Ürün Yorumları (Product Reviews)

Kullanıcı deneyimlerini paylaşma ve ürün puanlama modülüdür.

### 1. Yorum Güncelleme

* **Endpoint:** `PUT /products/{productId}/reviews/{reviewId}`
* **Yetki:** 🔐 Sadece Yorum Sahibi
* **Açıklama:** Mevcut bir yorumun içeriğini veya verilen puanı değiştirir.
* **Mantık:** Güncelleme sonrası ürünün **ortalama puanı** (rating) sistem tarafından otomatik tetiklenerek yeniden hesaplanır.



### 2. Yorum Listeleme

* **Endpoint:** `GET /products/{productId}/reviews`
* **Yetki:** 🌍 Herkese Açık
* **Açıklama:** Bir ürüne ait tüm geri bildirimleri getirir.
* **Özellikler:** Tarih veya puana göre sıralama opsiyonu sunulur.
* **Gösterilen Veriler:** Kullanıcı adı, tarih, puan, yorum içeriği ve ürünün genel puan ortalaması.



---



