
# 🛠️ Şerife Nur Yılmaz | Gereksinim Analizi

Bu doküman, **DekoHome by Meyran** projesi kapsamında Şerife Nur Yılmaz tarafından yönetilen kategori işlemleri, ürün güncellemeleri ve vitrin bileşenlerinin teknik gereksinimlerini içerir.

---

### 📂 Kategori Yönetimi (Category Management)

| Özellik | Metot | Endpoint | Yetki |
| :--- | :--- | :--- | :--- |
| **Kategori Ekleme** | `POST` | `/categories` | Admin |
| **Kategori Güncelleme** | `PUT` | `/categories/{categoryId}` | Admin |
| **Kategori Listeleme** | `GET` | `/categories` | Herkes |
| **Kategori Silme** | `DELETE` | `/categories/{categoryId}` | Admin |

#### 📋 Detaylı Gereksinim Açıklamaları

* **1. Kategori Ekleme (Admin Add Category)**:
    * **Açıklama**: Ürünlerin organize edilmesi için sisteme yeni bir kategori eklenmesini sağlar.
    * **İşlem**: Kategori adı, açıklaması ve üst kategori bilgisi girilerek veritabanına kaydedilir.
    * **Erişim**: Yalnızca admin tarafından gerçekleştirilebilir.

* **2. Kategori Güncelleme (Admin Update Category)**:
    * **Açıklama**: Mevcut bir kategorinin adı, açıklaması veya üst kategori bilgisinin güncellenmesini sağlar.
    * **İşlem**: Güncelleme sonrası değişiklikler anında sisteme yansıtılır.
    * **Erişim**: Yalnızca admin tarafından gerçekleştirilebilir.

* **3. Kategori Listeleme (View Categories)**:
    * **Açıklama**: Sistemde tanımlı tüm kategorilerin listelenmesini sağlar.
    * **İşlem**: Ana kategoriler ve alt kategoriler hiyerarşik yapıda görüntülenir.
    * **Kullanım**: Hem web hem mobil arayüzde menü yapısının oluşturulması için kullanılır.
    * **Erişim**: Tüm kullanıcılar tarafından erişilebilir.

* **4. Kategori Silme (Admin Delete Category)**:
    * **Açıklama**: Sistemde kayıtlı olan ve artık kullanılmayan bir kategorinin silinmesini sağlar.
    * **İşlem**: Silme işlemi öncesinde kategoriye bağlı ürün kontrolü yapılır.
    * **Erişim**: Yalnızca admin tarafından gerçekleştirilebilir.

---

### 📦 Ürün & Vitrin İşlemleri (Product & Showcase)

#### 🔄 5. Ürün Güncelleme (Admin Update Product)
* **API Metodu**: `PUT /products/{productId}`
* **Açıklama**: Mevcut bir ürünün adı, açıklaması, fiyatı, stok miktarı veya kategori bilgisinin güncellenmesini sağlar.
* **Detay**: Güncelleme sonrası değişiklikler ürün sayfasına anında yansıtılır.
* **Yetki**: Yalnızca admin tarafından gerçekleştirilebilir.

#### 🔍 6. Ürün Listeleme (View Products)
* **API Metodu**: `GET /products`
* **Açıklama**: Sistemde kayıtlı tüm ürünlerin listelenmesini sağlar.
* **Detay**: Ürünler kategoriye, fiyata veya isme göre filtrelenebilir ve sıralanabilir.
* **Yetki**: Tüm kullanıcılar tarafından erişilebilir.

#### 🖼️ 7. Slayt Görüntüleme (View Sliders)
* **API Metodu**: `GET /sliders`
* **Açıklama**: Ana sayfada gösterilecek promosyon ve kampanya slaytlarının listelenmesini sağlar.
* **Detay**: Her slayt için başlık, görsel, yönlendirme bağlantısı ve sıra bilgisi döndürülür.
* **Yetki**: Tüm kullanıcılar tarafından erişilebilir.