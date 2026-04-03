# DekoHome — Web Backend Görev Dağılımı

**Domain:** [dekohome-api.onrender.com](https://dekohome-api.onrender.com)  
**Sürüm:** v1  
**Ortam:** Node.js / Express / MongoDB (Mongoose)

Bu dokümanda DekoHome projesinin backend servisleri, veri yönetimi ve API geliştirme görevleri yer almaktadır. Her grup üyesi, atanan modüllerin iş mantığı, veritabanı entegrasyonu ve API uç noktalarından sorumludur.

---

## Görev Dağılımı

### Şerife Nur Yılmaz — Ürün & Kategori Yönetimi

| # | Görev |
|---|-------|
| 1 | Kategori güncelleme |
| 2 | Kategori listeleme |
| 3 | Ürün ekleme |
| 4 | Ürün güncelleme |
| 5 | Ürün listeleme |
| 6 | Ürün silme |

---

### Ebrar Karakoç — Sipariş & Yorum Yönetimi

| # | Görev |
|---|-------|
| 1 | Sipariş oluşturma |
| 2 | Sipariş iptali |
| 3 | Sipariş güncelleme |
| 4 | Sipariş listeleme |
| 5 | Yorum ekleme |
| 6 | Yorum silme |

---

### Dilan Günsili — Sepet & Yorum Yönetimi

| # | Görev |
|---|-------|
| 1 | Sepete ürün ekleme |
| 2 | Sepetten ürün silme |
| 3 | Sepet güncelleme |
| 4 | Sepet listeleme |
| 5 | Yorum güncelleme |
| 6 | Yorum listeleme |

---

### Gülnihal Köse — Kullanıcı & Kimlik Doğrulama

| # | Görev |
|---|-------|
| 1 | Üye olma |
| 2 | Giriş yapma |
| 3 | Profil görüntüleme |
| 4 | Profil güncelleme |
| 5 | Hesap silme |
| 6 | Kategori seçme |
| 7 | Kategori silme |


---

## Genel Prensipler

### 1. API Standartları

- **RESTful Architecture:** Standart HTTP metodları kullanılır — `GET`, `POST`, `PUT`, `DELETE`
- **Versioning:** Tüm uç noktalar `/v1/` ön eki ile başlar (örn. `/v1/products`)
- **JSON Response:** Başarılı ve hatalı tüm yanıtlar JSON formatında döner

### 2. Güvenlik & Yetkilendirme

- **JWT Authentication:** Yetki gerektiren rotalarda `Authorization: Bearer <token>` kontrolü yapılır
- **Password Hashing:** Şifreler veritabanına `bcrypt` ile hash'lenerek kaydedilir
- **Role Based Access:** Admin yetkisi gerektiren işlemler (ürün ekleme/silme vb.) middleware ile kontrol edilir
- **CORS:** Güvenli domain erişim politikası uygulanır

### 3. Veri Yönetimi

- **Mongoose Schemas:** `User`, `Product`, `Cart`, `Order`, `Review` modelleri için şema tanımları yapılır
- **Data Validation:** İstek gövdesindeki (`body`) veriler doğrulanır
- **Error Handling:** Merkezi hata yakalama middleware (`errorHandler`) kullanılır

### 4. Performans & Ölçeklenebilirlik

- **Async/Await:** Tüm veritabanı ve dış servis çağrıları asenkron yapılır
- **Environment Variables:** Hassas bilgiler (`MONGODB_URI`, `JWT_SECRET` vb.) `.env` dosyasından okunur
- **Production Build:** `tsx` yerine derlenmiş JS dosyaları üzerinden çalışılır

### 5. Entegrasyon & Deployment

- **Git Flow:** Tüm değişiklikler GitHub üzerinden yönetilir
- **Automated Deploy:** Ana branch'e yapılan push'lar Render tarafından otomatik dağıtılır
- **Health Check:** `/v1/health` uç noktası ile servis durumu izlenir

---
