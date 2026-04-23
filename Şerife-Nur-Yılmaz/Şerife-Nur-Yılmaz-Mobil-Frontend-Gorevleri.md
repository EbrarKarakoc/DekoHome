# Şerife Nur Yılmaz'ın Mobil Frontend Görevleri
**Mobile Front-end Demo Videosu:** [Link buraya eklenecek]

## 1. Kategori Güncelleme Ekranı
- **API Endpoint:** `PUT /categories/{categoryId}`
- **Görev:** Admin paneli üzerinde kategorinin ismi ve açıklaması gibi temel bilgilerinin düzenlenebileceği arayüzün tasarımı ve implementasyonu
- **UI Bileşenleri:**
  - Kategori detayları düzenleme Modalı / Form yapısı
  - Kategorileri hiyerarşik listeleme üzerinde Düzenle (Edit) ikonu
  - Kaydet ve İptal butonları
  - İşlem sırasında buton içi loading (ActivityIndicator)
- **Form Validasyonu:**
  - Kategori ismi boş bırakılamaz
  - Sadece Admin hesabı olanlara işlem erişimi görünürlüğü
- **Kullanıcı Deneyimi:**
  - Optimizasyon için işlem sonrası listeyi yeniden yükleme (refetch)
  - FlashMessage ile anlık, şık hata ve başarı bildirimleri
  - Modaldan esc/vazgeç işlemleri ile kolay çıkış
- **Teknik Detaylar:**
  - React Query ile `useUpdateCategory` mutasyonu
  - Hata statü kodlarına duyarlı hata yakalama yönetimi
  - JWT kimlik doğrulamalı header eşleşmesi

## 2. Kategori Listeleme Ekranı
- **API Endpoint:** `GET /categories`
- **Görev:** Mobil uygulamanın içerik gezinme kalbini oluşturan kategori gezgini (Explore) ve admin kategori ağacı hiyerarşisinin tasarımı
- **UI Bileşenleri:**
  - İkon destekli dinamik kategori butonları ve çipler (Chips)
  - Hiyerarşiyi oklarla gösteren Accordion / Ağaç bileşen yapısı (CategoryTreeItem)
  - Veri yüklenene kadar boş durum / loading skeleton
- **Kullanıcı Deneyimi:**
  - Dokunma dostu geniş Pressable alanlar
  - Seçili kategori/alt kategori odaklarında otomatik filtrelenme hissi
  - Tüm kategorilerin çocuklarına kadar sarmal scroll deneyimi
- **Teknik Detaylar:**
  - Array tree flattening (iç içe yapıları ayrıştırma metodu)
  - Hızlı yüklenme için `useCategories` hook entegrasyonu
  - Seçilen node altındaki tüm productları dahil etme yeteneği

## 3. Ürün Ekleme Ekranı
- **API Endpoint:** `POST /products`
- **Görev:** Admin paneline yeni stok bilgileri, görseller ve ürün özellikleri kaydetmek için entegre form ekranı tasarımı
- **UI Bileşenleri:**
  - Kategori seçici (Dropdown/Chip list)
  - Ürün adı, tanımı, görsel URL, fiyat ve stok için ayrı girdiler (TextInput)
  - Resim validasyonu sonrası canlı görsel önizleme (opsiyonel)
  - "Yeni Ekle" aksiyon butonu
- **Form Validasyonu:**
  - Fiyat alanı nümerik olmalıdır
  - Zorunlu alanlar doldurulmadan form gönderilmez
- **Kullanıcı Deneyimi:**
  - Eksik veri durumunda sarsıntılı ve net uyarı (FlashMessage)
  - Ağaç yapısında hangi kategoriye atanacağının netleştirilmesi
  - Hızlı veri girişi için seri odaklanabilir input akışı
- **Teknik Detaylar:**
  - React Query mutation `useCreateProduct`
  - Cache Invalidation: Başarılı POST sonrası `PRODUCTS_KEYS.all` geçersiz kılınması

## 4. Ürün Güncelleme Ekranı
- **API Endpoint:** `PUT /products/{productId}`
- **Görev:** Sistemde var olan ürünlerin tüm dinamik statülerini değiştirmeye olanak sağlayan Modal içi update formunun implementasyonu
- **UI Bileşenleri:**
  - Ürünlerin listelendiği satırlarda "Edit/Düzenle" düğmesi
  - Eski bilgileri preload (önceden doldurulmuş) olarak getiren Form yapısı
  - İşlem sırası pasif/gri duruma düşen butonlar (disabled states)
- **Kullanıcı Deneyimi:**
  - Bilgi tutarsızlığını önlemek için değişiklik yapılmadan modalın anında kapatılabilmesi
  - Optimistic UI varsayımlarıyla bekletmeden tepki verme
- **Teknik Detaylar:**
  - API call hatasına karşı önceki bilgilerin kaybolmaması
  - ID eşleşmesi üzerinden özelleşmiş Hook `useUpdateProduct`

## 5. Ürün Listeleme Ekranı
- **API Endpoint:** `GET /products`
- **Görev:** Ana ekrandaki ürün gridinin sayfalama destekli, hatasız ve performansa duyarlı mobil arayüzünün inşası
- **UI Bileşenleri:**
  - Resimli, fiyatlı, formatlanmış ProductCard modülleri
  - Kategori odaklı küçük icon rozetleri ve title tasarımları
  - Sayfanın sonuna indikçe yeni yüklenen (Infinite Scroll) mekanizması
- **Kullanıcı Deneyimi:**
  - Pürüzsüz kaydırma ve limitli hafıza tüketimi
  - Bekleme durumunda estetik Skeleton tasarımlar
  - Listede ürün kalmadığında anlamlı bitiş göstergeleri
- **Teknik Detaylar:**
  - `useInfiniteQuery` ile offset/limit mekanizmasının React UI'a bağlanması
  - Sadece mevcut kategori ID'si altındaki ürünlerin dinamik filtre ile renderlanması

## 6. Ürün Silme Akışı
- **API Endpoint:** `DELETE /products/{productId}`
- **Görev:** Envanterden ürün temizlerken yaşanabilecek kullanıcı/sipariş odaklı çakışmaları kontrol eden UI/UX dizaynı
- **UI Bileşenleri:**
  - Klasik silme ikonu (Trash2)
  - Geri döndürülemez işlemi teyit eden "Silme Doğrulama" Modal/Dialogu
  - Beklenmedik "aktif sipariş" retleri durumunda Alert bildirimi
- **Kullanıcı Deneyimi:**
  - Sil butonunun kırmızı tehlike rengi ile diğerlerinden izole edilmesi
  - Aktif sipariş varsa neden silinemediğini açıklayan detaylı, insan odaklı metin dili
  - İptal etmek isteyen kullanıcıya daima açık bir çıkış yolu bırakılması
- **Teknik Detaylar:**
  - Exception response mesajının (.includes özelliğiyle) parse edilerek özel Alert sunumu
  - Web ve iOS/Android uyumluluğu için `Modal` veya `Alert.alert` fall-back kombinasyonlarının kullanılması