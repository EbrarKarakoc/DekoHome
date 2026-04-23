# Şerife Nur Yılmaz'ın Mobil Backend Görevleri
**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek]

## 1. Kategori Güncelleme Servisi
- **API Endpoint:** `PUT /categories/{categoryId}`
- **Görev:** Sistemde kayıtlı mevcut kategorilerin isim, açıklama ve hiyerarşik yapı bilgilerini güncelleyen servis entegrasyonu
- **İşlevler:**
  - İstek atan kullanıcının Admin yetkilerini doğrulama
  - Gönderilen payload ile belirtilen kategori dokümanını güncelleme
  - İsim, açıklama vb. değiştirilebilir metadata alanlarını veri tabanında revize etme
  - Veri tabanında eşleşmeyen kategori ID'si durumunda hata mesajı fırlatma
- **Teknik Detaylar:**
  - Authentication JWT header kullanımı (Bearer Token + Admin Role)
  - Request body modelleme (name, description, parentCategoryId)
  - Hata yönetimi (400 Bad Request, 401 Unauthorized, 404 Not Found, 403 Forbidden)
  - Güncelleme sonrası istemciye en güncel JSON modelini döndürme

## 2. Kategori Listeleme Servisi
- **API Endpoint:** `GET /categories`
- **Görev:** Veritabanındaki tüm ana ve alt kategorileri düzenli bir hiyerarşik (ağaç) yapıda mobilize eden servis entegrasyonu
- **İşlevler:**
  - Ana kategori ve bunlara bağlı alt kategorileri listeleyerek JSON ağacı oluşturma
  - Üye statüsü fark etmeksizin tüm kullanıcılara erişim sunma
  - Arayüz menülerinde dinamik yapılandırma için veri setini optimize etme
- **Teknik Detaylar:**
  - Açık endpoint erişimi (kimlik doğrulaması gerektirmez)
  - Hafif hızlı veri getirme (lazy loading/tree parsing)
  - Hata yönetimi (500 Internal Server Error)
  - Cache mekanizması ve gereksiz veritabanı yükünü önleme stratejileri

## 3. Ürün Ekleme Servisi
- **API Endpoint:** `POST /products`
- **Görev:** Envantere yeni mobilya ve ürün ekleme işlemi için backend sunucu tarafı veri yönetimi entegrasyonu
- **İşlevler:**
  - Form verilerinin eksiksizliğini kontrol etme (isim, fiyat, görsel vd.)
  - Veritabanına yeni ürün dokümanı oluşturma
  - Geçerli bir Kategori ID ile referans eşleşmesi yapma
  - Yeni ürün kimliğini oluşturup istemciye dönme
- **Teknik Detaylar:**
  - Yetki denetimi (Sadece Admin yetkilendirmesi)
  - Form validasyonu ve constraint kontrolleri
  - Request payload modelleme (name, description, price, stock, categoryId, imageUrls)
  - Hata yönetimi (400 Invalid Input, 401/403 Role Constraints)

## 4. Ürün Güncelleme Servisi
- **API Endpoint:** `PUT /products/{productId}`
- **Görev:** Envanterdeki mevcut ürünün fiyat, stok, görsel ve teknik detay verilerinin güncellenmesi akışı
- **İşlevler:**
  - Belirtilen productId üzerinden veritabanında ürünü tespit etme
  - Yeni fiyat veya ürün detay bilgilerinin kaydını gerçekleştirme
  - Stok güncellemelerini eş zamanlı işleme ve onaylama
  - Kayıt sonrası revize edilmiş ürün nesnesi datasını dönme
- **Teknik Detaylar:**
  - Partial update/overwrite mantığı ile veritabanı yansıtması
  - Request body tip denetimleri (number için price, array için images)
  - Hata yönetimi (401, 403 (Sadece admin), 404 Not Found)

## 5. Ürün Listeleme Servisi
- **API Endpoint:** `GET /products`
- **Görev:** Tüm projeyi kapsayan ürün verisi havuzunun mobil ve front-end tarafa kontrollü ve performanslı sunulması
- **İşlevler:**
  - Query sorgusuna göre (kategori, isim) spesifik veri getirme
  - Veritabanından gelen verileri sayfalayarak (pagination) limitli dönme
  - Gelen liste içerisinde sıralamayı yönetme
- **Teknik Detaylar:**
  - Sayfalama (Limit, offset/pageParam bazlı yapı)
  - Response parsing ile Product array modellemesi
  - Genel erişimli endpointe izin verme

## 6. Ürün Silme Servisi
- **API Endpoint:** `DELETE /products/{productId}`
- **Görev:** Hatalı girilen veya satışı durdurulan öğelerin veritabanından kalıcı olarak yok edilmesi
- **İşlevler:**
  - Silme komutu gelince öncelikle "Aktif Sipariş Kontrolü" mekanizmasını tetikleme
  - Kargo süreci devam eden ürünlerde silme işlemini engelleyerek durumu front-end'e bildirme
  - Eğer bağımlı kayıt yoksa ürün verisini Collection'dan kalıcı silme
- **Teknik Detaylar:**
  - Admin yetkisi ve token doğrulama
  - Multi-collection sorgusu (Order ve Product ilişkisi okuması)
  - Hata yönetimi (400 Custom Constraint Warning, 401, 403, 404)
  - 204 No Content veya hata durumunda 400 JSON döndürme
