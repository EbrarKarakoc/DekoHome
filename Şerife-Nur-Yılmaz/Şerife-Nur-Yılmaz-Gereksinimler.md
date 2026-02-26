# 🛠️ Şerife Nur Yılmaz | Gereksinim Analizi & API Tasarımı

Bu doküman, **DekoHome by Meyran** projesi kapsamında Şerife Nur Yılmaz tarafından yönetilen kategori yönetimi, ürün operasyonları ve vitrin bileşenlerinin teknik gereksinimlerini içermektedir.

---

### 📂 Kategori Yönetimi (Category Management)

#### 📋 Kategori Gereksinim Detayları

* **1. Kategori Güncelleme (Update Category)**:
    * **API Metodu**: `PUT /categories/{categoryId}`
    * **Açıklama**: Mevcut bir kategorinin adı, açıklaması veya hiyerarşik (üst kategori) bilgisinin güncellenmesini sağlar.
    * **Detay**: Güncelleme sonrası değişiklikler sistem genelinde anlık olarak yansıtılır.
    * **Yetki**: Yalnızca admin tarafından gerçekleştirilebilir.

* **2. Kategori Listeleme (View Categories)**:
    * **API Metodu**: `GET /categories`
    * **Açıklama**: Sistemde tanımlı tüm kategorilerin hiyerarşik yapıda listelenmesini sağlar.
    * **Kullanım**: Hem web hem mobil arayüzde menü yapısının oluşturulması için kullanılır.
    * **Erişim**: Tüm kullanıcılar tarafından erişilebilir.

---

### 📦 Ürün & Vitrin İşlemleri (Product & Showcase)

#### 📋 Ürün ve Vitrin Gereksinim Detayları

* **3. Ürün Ekleme (Add New Product)**:
    * **API Metodu**: `POST /products`
    * **Açıklama**: Sisteme yeni mobilya veya dekorasyon ürünlerinin eklenmesini sağlar.
    * **İşlem**: Ürün adı, açıklaması, fiyatı, stok miktarı ve görselleri gibi bilgiler veritabanına kaydedilir.
    * **Yetki**: Yalnızca admin tarafından gerçekleştirilebilir.

* **4. Ürün Güncelleme (Update Product Details)**:
    * **API Metodu**: `PUT /products/{productId}`
    * **Açıklama**: Mevcut bir ürünün adı, açıklaması, fiyatı, stok miktarı veya kategori bilgisinin revize edilmesini sağlar.
    * **Detay**: Güncelleme sonrası değişiklikler ürün sayfasına anında yansıtılır.
    * **Yetki**: Yalnızca admin tarafından gerçekleştirilebilir.

* **5. Ürün Listeleme (Browse Products)**:
    * **API Metodu**: `GET /products`
    * **Açıklama**: Sistemde kayıtlı tüm ürünlerin bir liste halinde sunulmasını sağlar.
    * **Özellik**: Ürünler kategoriye, fiyata veya isme göre filtrelenebilir ve sıralanabilir.
    * **Performans**: Sayfalama desteği ile hem web hem mobil uygulamada verimli çalışır.

* **6. Slayt Görüntüleme (View Showcase Sliders)**:
    * **API Metodu**: `GET /sliders`
    * **Açıklama**: Ana sayfada gösterilecek promosyon ve kampanya slaytlarının listelenmesini sağlar.
    * **İçerik**: Her slayt için başlık, görsel, yönlendirme bağlantısı ve sıra bilgisi döndürülür.
    * **Erişim**: Tüm kullanıcılar tarafından erişilebilir.