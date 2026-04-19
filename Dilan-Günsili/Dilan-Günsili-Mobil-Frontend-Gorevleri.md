# Dilan Günsili'nin Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** [Link buraya eklenecek](https://example.com)

## 1. Sepete Ürün Ekleme Ekranı
- **API Endpoint:** `POST /cart/items`
- **Görev:** Kullanıcının ürün detayından veya liste ekranından sepete ürün ekleme akışının mobil tarafta tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Ürün adet seçici (stepper veya plus/minus)
  - Sepete Ekle butonu
  - Stok bilgisi ve stok uyarı metni
  - İşlem sırasında loading indicator
  - Başarılı ekleme sonrası mini sepet özeti veya toast
- **Form Validasyonu:**
  - Quantity değeri 1’den küçük olamaz
  - Quantity stoktan büyük olamaz
  - Ürün kimliği olmadan istek atılamaz
  - Giriş yapılmamış kullanıcı için yetki uyarısı gösterilir
- **Kullanıcı Deneyimi:**
  - Başarılı işlemde anlık geri bildirim ve sepet badge güncellemesi
  - Stok yetersizliğinde anlaşılır hata mesajı
  - Ağ hatasında retry seçeneği
  - Hızlı ardışık tıklamalarda buton kilitleme
- **Teknik Detaylar:**
  - JWT ile yetkili istek (Bearer token)
  - Request body: productId, quantity
  - Cache invalidation: sepet verisi ve toplam tutar
  - Error handling: 400, 401, 404, 409

## 2. Sepetten Ürün Silme Akışı
- **API Endpoint:** `DELETE /cart/items/{itemId}`
- **Görev:** Sepet ekranında seçilen kalemin tamamen kaldırılması için UI akışının tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Her satırda Sil aksiyonu (ikon veya swipe action)
  - Onay dialogu (Bu ürünü sepetten kaldırmak istiyor musunuz?)
  - Silme sırasında satır bazlı loading durumu
  - Başarılı işlem sonrası güncel sepet listesi
- **Kullanıcı Deneyimi:**
  - Destructive işlem için kırmızı vurgu
  - İptal seçeneği her zaman görünür
  - Silme sonrası toplam tutarın anlık güncellenmesi
  - Hata durumunda kullanıcı dostu geri bildirim
- **Teknik Detaylar:**
  - itemId üzerinden DELETE isteği
  - Başarılı silme sonrası GET /cart ile veri senkronu
  - Error handling: 401, 403/401, 404
  - Offline durumda fallback hata mesajı

## 3. Sepet Güncelleme Ekranı
- **API Endpoint:** `PUT /cart/items/{itemId}`
- **Görev:** Sepet kalemi miktarını artırma ve azaltma akışının implementasyonu
- **UI Bileşenleri:**
  - Satır bazlı adet kontrolü (minus, value, plus)
  - Ara toplam ve genel toplam alanları
  - Güncelleme sırasında satır loading göstergesi
  - Geçersiz miktarda uyarı metni
- **Form Validasyonu:**
  - Quantity en az 1 olmalı
  - Quantity stok sınırını aşmamalı
  - Geçersiz formatta değer engellenmeli
- **Kullanıcı Deneyimi:**
  - Optimistic update ile hızlı arayüz tepkisi
  - Hata olursa rollback ile eski değere dönme
  - Çok hızlı tıklamalarda debounce/throttle
  - Toplam tutarın anlık güncellenmesi
- **Teknik Detaylar:**
  - Request body: quantity
  - Satır bazlı mutation yönetimi
  - Cache senkronu ve toplam hesap doğrulaması
  - Error handling: 400, 401, 404, 409

## 4. Sepet Listeleme Ekranı
- **API Endpoint:** `GET /cart`
- **Görev:** Kullanıcının sepet içeriğini detaylı şekilde gösteren ekranın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Ürün görseli, adı, birim fiyatı, adet ve ara toplam
  - Genel toplam kartı
  - Pull-to-refresh
  - Boş sepet durumu için Empty State
  - Veri yüklenirken skeleton görünümü
- **Kullanıcı Deneyimi:**
  - lk açılışta hızlı veri yükleme hissi
  - Yenileme hareketinde akıcı geri bildirim
  - Hata durumunda retry butonu
  - Boş sepet için aksiyon butonu (alışverişe devam et)
- **Teknik Detaylar:**
  - JWT ile kimlik doğrulamalı GET isteği
  - Response parsing ve tip güvenli modelleme
  - Son bilinen sepet verisi için cache stratejisi
  - Error handling: 401, 403/401, 404, 500

## 5. Yorum Güncelleme Ekranı
- **API Endpoint:** `PUT /products/{productId}/reviews/{reviewId}`
- **Görev:** Kullanıcının kendi yorumunu ve puanını düzenleyebileceği ekranın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Puan seçici (1-5 yıldız)
  - Yorum metin alanı
  - Kaydet ve İptal butonları
  - Güncelleme sırasında loading indicator
  - Başarılı güncelleme bildirimi
- **Form Validasyonu:**
  - QPuan alanı zorunlu
  - Yorum metni boş bırakılamaz
  - Metin uzunluğu sınırları kontrol edilir
- **Kullanıcı Deneyimi:**
  - Sadece yorum sahibine düzenleme aksiyonu gösterimi
  - Kaydet sonrası yorum listesinin anlık yenilenmesi
  - Hata durumunda açık ve kısa uyarı
  - Geri almayı kolaylaştıran iptal akışı
- **Teknik Detaylar:**
  - Request body: rating, comment
  - reviewId ve productId ile hedef kaydın güncellenmesi
  - Error handling: 400, 401, 403, 404
  - Başarı sonrası ilgili ürün ve yorum cache anahtarlarının invalidation işlemi

  ## 6. Yorum Listeleme Ekranı
- **API Endpoint:** ` GET /products/{productId}/reviews`
- **Görev:** Ürüne ait tüm yorumları listeleyen ekranın tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Yorum kartı (kullanıcı adı, tarih, puan, yorum metni)
  - Ortalama puan gösterimi
  - Sıralama seçeneği (tarih, puan)
  - Boş yorum durumu için Empty State
  - Hata durumunda retry butonu
- **Kullanıcı Deneyimi:**
  - Liste performansı için sayfalama veya lazy loading yaklaşımı
  - İlk yüklemede skeleton, yenilemede hafif loading
  - Veri yoksa açıklayıcı boş durum mesajı
  - Uzun yorumlarda okunabilir kart düzeni
- **Teknik Detaylar:**
  - Açık endpoint tüketimi (giriş olmadan görüntüleme desteği)
  - Ürün kimliği bazlı yorum çekme
  - Error handling: 404, 500
  - Cacheleme ve tekrar deneme stratejisi
