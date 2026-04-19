# Mobil Backend (REST API Bağlantısı) Görev Dağılımı

**REST API Adresi:** [api.yazmuh.com](https://api.yazmuh.com)

Bu dokümanda, mobil uygulamanın REST API ile iletişimini sağlayan backend entegrasyon görevleri listelenmektedir. Her grup üyesi, kendisine atanan API endpoint'lerinin mobil uygulamadan çağrılması ve yönetilmesinden sorumludur.

---

## Grup Üyelerinin Mobil Backend Görevleri

1. [Dilan Günsili'nin Mobil Backend Görevleri](Dilan-Günsili/Dilan-Günsili-Mobil-Backend-Gorevleri.md)
2. [Gülnihal Köse'nin Mobil Backend Görevleri](Gülnihal-Köse/Gülnihal-Köse-Mobil-Backend-Gorevleri.md)
3. [Ebrar Karakoç'un Mobil Backend Görevleri](Ebrar-Karakoc/Ebrar-Karakoc-Mobil-Backend-Gorevleri.md)
4. [Şerife Nur Yılmaz'ın Mobil Backend Görevleri](Şerife-Nur-Yılmaz/Şerife-Nur-Yılmaz-Mobil-Backend-Gorevleri.md)

---

## Genel Mobil Backend Prensipleri

### 1. HTTP Client Yapılandırması
- **Base URL:** `https://dekohome-api.onrender.com/v1`
- **Base URL geliştirme ortamında Android için:** `http://10.0.2.2:3000/v1`
- **Base URL geliştirme ortamında iOS/Web için:** `http://localhost:3000/v1`
- **Timeout:** 15 saniye
- **Headers:** 
  - `Content-Type: application/json`
  - `Authorization: Bearer {token}` (gerekli endpoint'lerde)

### 2. Authentication Yönetimi
- JWT token secure storage mantığıyla saklanır
- Web ortamında secure storage yerine AsyncStorage fallback kullanılır
- 401 durumunda token silinir ve unauthorized handler tetiklenir
- Logout akışında token temizleme uygulanır

### 3. Error Handling
- Axios tabanlı hata yakalama kullanılır
- Network Error ve timeout durumları kullanıcı dostu bağlantı mesajına çevrilir
- Sunucudan dönen message alanı öncelikli gösterilir
- Bilinmeyen hatalarda genel hata mesajı gösterilir
- Query seviyesinde retry mekanizması varsayılan olarak 2 denemedir

### 4. Caching Stratejisi
- TanStack Query ile cache yönetimi kullanılır
- Global query staleTime: 5 dakika
- Modül bazlı staleTime örnekleri:
- Cart: 30 saniye
- User profile: 1 dakika
- Mutation sonrası ilgili query keyler invalidate edilerek veri senkronizasyonu sağlanır
- Offline-first tam senaryo yerine cache ve yeniden deneme odaklı yaklaşım kullanılır

### 5. Loading States
- Query ve mutation stateleri üzerinden loading yönetimi yapılır
- Ekranlarda skeleton, empty state, error state bileşenleri kullanılır
- İşlem başarılı/başarısız geri bildirimleri gösterilir
- Sepet ve kullanıcı işlemlerinde optimistic davranışa uygun anlık UI güncellemeleri uygulanır

### 6. Offline ve Bağlantı Durumu
- Expo Network ile bağlantı durumu periyodik kontrol edilir
- Her 5 saniyede bağlantı doğrulaması yapılır
- Bağlantı yokken kullanıcıya OfflineBanner gösterilir

### 6. Logging ve Debugging
- Axios interceptor katmanında request öncesi token ekleme ve 401 yönetimi vardır
- Merkezileştirilmiş request/response loglama sınırlıdır
- Crash reporting entegrasyonu mevcut değildir
- Backend tarafında hata durumlarında route bazlı loglama yapılır
