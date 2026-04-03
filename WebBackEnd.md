# Web Backend Görev Dağılımı

**Web Backend Adresi:** [dekohome-api.onrender.com](https://dekohome-api.onrender.com)

Bu dokümanda, DekoHome projesinin backend servisleri, veri yönetimi ve API geliştirme görevleri listelenmektedir. Her grup üyesi, kendisine atanan modüllerin iş mantığı, veritabanı entegrasyonu ve API uç noktalarından sorumludur.

---

## Grup Üyelerinin Web Backend Görevleri

### 1. Şerife Nur Yılmaz'ın Web Backend Görevleri
*   **Ürün ve Katalog Yönetimi:**
    1.  Ürün detaylarını görüntüleme API'si
    2.  Yeni ürün ekleme (Admin)
    3.  Ürün silme (Admin)
    4.  Ürün bilgisi güncelleme (Admin)
    5.  Kampanya slaytlarını (Slides) yönetme ve görüntüleme
    6.  İndirimli ürün görseline etiket/metadata yerleştirme
    7.  Admin özet paneli (Dashboard) verilerini sağlama

### 2. Ebrar Karakoç'un Web Backend Görevleri
*   **Yorum, Puanlama ve Sıralama:**
    1.  Ürünlere yorum ekleme
    2.  Yorum silme (Kendi yorumu veya Admin)
    3.  Yorum güncelleme
    4.  Ürün puanlama (Rating) sistemi
    5.  Ürünleri puan veya tarihe göre sıralama
    6.  Gelişmiş ürün filtreleme (Yorum sayısı, puan vb.)
    7.  Yorum sahipliği ve yetki kontrolü (Üye sadece kendi yorumunu düzenleyebilir)

### 3. Dilan Günsili'nin Web Backend Görevleri
*   **Sepet ve Arama İşlemleri:**
    1.  Sepete ürün ekleme
    2.  Sepetten ürün silme
    3.  Sepet miktarını güncelleme
    4.  Kullanıcı sepetini saklama ve görüntüleme
    5.  Kategorilere göre ürün filtreleme entegrasyonu
    6.  Metin tabanlı ürün arama (Search) API'si

### 4. Gülnihal Köse'nin Web Backend Görevleri
*   **Kullanıcı Yönetimi ve Favoriler:**
    1.  Kullanıcı giriş yapma (Login/JWT)
    2.  Yeni üye oluşturma (Register)
    3.  Şifre kurtarma/sıfırlama süreçleri
    4.  Profil bilgileri güncelleme
    5.  Hesap kapatma/silme işlemleri
    6.  Favori ürünlere ekleme
    7.  Favori ürünlerden silme
    8.  Favori ürünleri listeleme ve görüntüleme

---

## Teknoloji Yığını

- **Runtime:** Node.js (v20+)
- **Language:** TypeScript
- **Framework:** Express.js
- **Database:** MongoDB (Atlas / Mongoose ODM)
- **Authentication:** JSON Web Token (JWT) + BcryptJS
- **API Documentation:** OpenAPI 3.0 (openapi.yaml)
- **Deployment:** Render (Web Service)
- **CI/CD:** GitHub → Render (Auto Deploy)

---

## Genel Web Backend Prensipleri

### 1. API Standartları
- **RESTful Architecture:** Standart HTTP metodları (GET, POST, PUT, DELETE) kullanımı.
- **Versioning:** Tüm API uç noktaları `/v1/` ön eki ile başlar.
- **JSON Response:** Tüm başarılı ve hatalı yanıtlar JSON formatında döner.

### 2. Güvenlik ve Yetkilendirme
- **JWT Authentication:** Yetki gerektiren rotalarda `Bearer` token kontrolü.
- **Password Hashing:** Şifreler veritabanına `bcrypt` ile hash'lenerek kaydedilir.
- **Role Based Access:** Admin yetkisi gerektiren işlemler (ürün ekleme/silme vb.) kontrol edilir.
- **CORS:** Güvenli domain erişim kontrolü.

### 3. Veri Yönetimi
- **Mongoose Schemas:** Tüm modeller (User, Product, Cart, Order, Review) için şema tanımları.
- **Data Validation:** İstek gövdesindeki (body) verilerin doğruluğu kontrol edilir.
- **Error Handling:** Merkezi hata yakalama middleware kullanımı.

### 4. Performans ve Ölçeklenebilirlik
- **Asynchronous Operations:** Tüm veritabanı ve dış servis çağrıları async/await ile yapılır.
- **Environment Variables:** Hassas bilgiler (MongoDB URI, JWT Secret) `.env` dosyasından okunur.
- **Production Build:** `tsx` yerine compile edilmiş JS dosyaları üzerinden çalışma.

### 5. Entegrasyon ve Deployment
- **Git Flow:** Değişiklikler GitHub üzerinden yönetilir.
- **Automated Deploy:** Ana branch'e yapılan push'lar Render tarafından otomatik dağıtılır.
- **Health Check:** `/v1/health` uç noktası ile servis durumu izlenir.
