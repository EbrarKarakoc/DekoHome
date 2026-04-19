# Dilan Günsili'nin Mobil Backend Görevleri
**Mobil Front-end ile Back-end Bağlanmış Test Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Sepete Ürün Ekleme Servisi
- **API Endpoint:** `POST /cart/items`
- **Görev:** Mobil uygulamada kullanıcıların sepete ürün ekleme işlemini gerçekleştiren servis entegrasyonu
- **İşlevler:**
  - Ürün kimliği ve adet bilgisini toplama
  - JWT token ile yetkili istek gönderme
  - Ürün sepette varsa miktarı artırma, yoksa yeni satır ekleme
  - Stok yetersizse kullanıcıya anlamlı hata mesajı gösterme
  - Başarılı işlem sonrası sepet özetini güncelleme
- **Teknik Detaylar:**
  - Authentication header kullanımı (Bearer Token)
  - Request body modelleme (productId, quantity)
  - Hata yönetimi (400 Bad Request, 401 Unauthorized, 404 Not Found)
  - Loading state ve retry mekanizması

## 2. Sepetten Ürün Silme Servisi
- **API Endpoint:** `DELETE /cart/items/{itemId}`
- **Görev:** Mobil uygulamada seçili sepet öğesini tamamen kaldıran servis entegrasyonu
- **İşlevler:**
  - Silinecek sepet öğesi kimliğini belirleme
  - Silme işlemi öncesi kullanıcı onayı alma
  - API'ye yetkili DELETE isteği gönderme
  - Başarılı işlem sonrası sepet toplamını ve ürün listesini yenileme
  - Hata durumunda kullanıcıya geri bildirim gösterme
- **Teknik Detaylar:**
  - Destructive action için confirmation dialog
  - Cache invalidation ve UI senkronizasyonu
  - Hata yönetimi (401, 403, 404)
  - Offline durumda güvenli fallback mesajı

## 3. Sepet Güncelleme Servisi
- **API Endpoint:** `PUT /cart/items/{itemId}`
- **Görev:** Mobil uygulamada sepet ürün miktarını güncelleme servis entegrasyonu
- **İşlevler:**
  - Kullanıcının artırma/azaltma aksiyonlarını yakalama
  - Yeni miktarı API'ye gönderme
  - Ara toplam ve genel toplamı güncel veriye göre yeniden hesaplatma
  - Stok sınırları dışındaki miktarlarda kullanıcıyı uyarma
  - Başarılı işlem sonrası sepet ekranını anlık güncelleme
- **Teknik Detaylar:**
  - Request body modelleme (quantity)
  - Optimistic UI update ve hata durumunda rollback
  - Hata yönetimi (400, 401, 404)
  - Loading state ve debounce stratejisi (hızlı tıklamalar için)

## 4. Sepet Listeleme Servisi
- **API Endpoint:** `GET /cart`
- **Görev:** Kullanıcının sepetini detaylı şekilde listeleyen servis entegrasyonu
- **İşlevler:**
  - JWT ile kimlik doğrulamalı GET isteği gönderme
  - Ürün adı, görsel, birim fiyat, adet ve ara toplam bilgilerini gösterme
  - Sepetin genel toplamını ekranda hesaplanan değerle uyumlu sunma
  - Pull-to-refresh ile manuel yenileme desteği
  - Boş sepet durumunda uygun Empty State gösterimi
- **Teknik Detaylar:**
  - Response parsing ve tip güvenli modelleme
  - -Cacheleme stratejisi (son bilinen sepet verisi)
  - Hata yönetimi (401, 403, 404, 500)
  - Skeleton/loading ve empty state yönetimi

  ## 5. Yorum Güncelleme Servisi
- **API Endpoint:** `PUT /products/{productId}/reviews/{reviewId}`
- **Görev:** Ürüne ait tüm yorumları mobil uygulamada listeleyen servis entegrasyonu
- **İşlevler:**
  - Sadece yorum sahibinin güncelleme yapabilmesini sağlama
  - Yeni yorum metni ve puanı gönderme
  - Başarılı güncelleme sonrası yorum listesini yenileme
  - Güncelleme sonrasında ürün puan ortalamasını güncel gösterme
  - Hata durumunda kullanıcıya uygun uyarı verme
- **Teknik Detaylar:**
  - Request body modelleme (rating, comment)
  - Yetki kontrolü kaynaklı hata yönetimi (403 Forbidden)
  - Hata yönetimi (400, 401, 403, 404)
  - UI tarafında optimistic update ve rollback yaklaşımı

   ## 6. Yorum Listeleme Servisi
- **API Endpoint:** `GET /products/{productId}/reviews`
- **Görev:** Ürüne ait tüm yorumları mobil uygulamada listeleyen servis entegrasyonu
- **İşlevler:**
  - Ürün kimliğiyle yorumları API'den çekme
  - Kullanıcı adı, tarih, puan ve yorum metnini gösterme
  - Tarih veya puana göre sıralama seçeneklerini sunma
  - Ürünün genel puan ortalamasını görünür şekilde gösterme
  - Veri yoksa kullanıcıya boş durum mesajı gösterme
- **Teknik Detaylar:**
  - Açık endpoint tüketimi (herkese açık erişim)
  - Liste performansı için pagination veya lazy loading desteği
  - Hata yönetimi (404 Not Found, 500 Internal Server Error)
  - Cacheleme ve tekrar deneme (retry) mekanizması



