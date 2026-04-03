# Video Sunum

## Sunum Videosu

> **Video Linki:** [Sunum videosu linki buraya eklenecek](https://example.com)

---

## Sunum Yapısı

** Konuşma:**
> "Merhaba,Meyran ekibi olarak DekoHome projesini geliştirdik. Bu proje, modern mobilya ve ev dekorasyonu ürünlerini web ve mobil platformlarda kullanıcılarla buluşturan bir e-ticaret uygulamasıdır. Bugün sizlere projemizi ve ekibimizin çalışmalarını sunacağız. Her ekip üyesi kendini tanıtacak ve sorumlu olduğu gereksinimleri gösterecek.Yukarıda verilen 4 Youtube linkini izleyerek projemiz hakkında bilgi alabilirsiniz."

---





### 3. Ekip Üyeleri Sunum Sırası

#### Gülnihal Köse
**Kişisel Tanıtım:**
- İsim: Gülnihal Köse
- Rol: Kullanıcı İşlemleri & Kategori Ekleme/Silme

**Gereksinimler:**
1. **Üye Olma**
   - API Metodu: `POST /auth/register`
   - Demo: Kullanıcı kayıt işleminin gösterilmesi

2. **Giriş Yapma**
   - API Metodu: `POST /auth/login`
   - Demo: E-posta ve şifre ile sisteme giriş yapılması

3. **Profil Görüntüleme**
   - API Metodu: `GET /users/{userId}`
   - Demo: Kullanıcı profil bilgilerinin görüntülenmesi

4. **Profil Güncelleme**
   - API Metodu: `PUT /users/{userId}`
   - Demo: Profil bilgilerinin güncellenmesi

5. **Hesap Silme**
   - API Metodu: `DELETE /users/{userId}`
   - Demo: Hesap silme işleminin gösterilmesi

6. **Kategori Seçme (Filtreleme)**
   - API Metodu: `POST /users/{userId}/preferences/categories`
   - Demo: Kullanıcının ilgi duyduğu kategorileri seçmesi

7. **Kategori Silme (Filtreyi Kaldırma)**
   - API Metodu: `DELETE /users/{userId}/preferences/categories/{categoryId}`
   - Demo: Seçilen kategori filtresinin kaldırılması

---

#### Şerife Nur Yılmaz
**Kişisel Tanıtım:**
- İsim: Şerife Nur Yılmaz
- Rol: Kategori İşlemleri & Ürün Yönetimi

**Gereksinimler:**
1. **Kategori Güncelleme**
   - API Metodu: `PUT /categories/{categoryId}`
   - Demo: Admin paneli üzerinden kategori bilgilerinin güncellenmesi

2. **Kategori Listeleme**
   - API Metodu: `GET /categories`
   - Demo: Tüm kategorilerin hiyerarşik yapıda listelenmesi

3. **Ürün Ekleme**
   - API Metodu: `POST /products`
   - Demo: Admin tarafından yeni ürün eklenmesi

4. **Ürün Güncelleme**
   - API Metodu: `PUT /products/{productId}`
   - Demo: Mevcut ürün bilgilerinin güncellenmesi

5. **Ürün Listeleme**
   - API Metodu: `GET /products`
   - Demo: Ürün kataloğunun listelenmesi ve filtrelenmesi

6. **Ürün Silme**
   - API Metodu: `DELETE /products/{productId}`
   - Demo: Ürünün sistemden silinmesi

---

#### Ebrar Karakoç
**Kişisel Tanıtım:**
- İsim: Ebrar Karakoç
- Rol: Sipariş İşlemleri & Yorum Ekleme/Silme

**Gereksinimler:**
1. **Sipariş Oluşturma**
   - API Metodu: `POST /orders`
   - Demo: Sepetteki ürünlerden sipariş oluşturulması

2. **Sipariş İptali**
   - API Metodu: `DELETE /orders/{orderId}`
   - Demo: Mevcut siparişin iptal edilmesi

3. **Sipariş Güncelleme**
   - API Metodu: `PUT /orders/{orderId}`
   - Demo: Sipariş adres bilgisinin güncellenmesi

4. **Sipariş Listeleme**
   - API Metodu: `GET /orders`
   - Demo: Kullanıcının geçmiş ve aktif siparişlerinin listelenmesi

5. **Yorum Ekleme**
   - API Metodu: `POST /products/{productId}/reviews`
   - Demo: Satın alınan ürüne puan ve yorum eklenmesi

6. **Yorum Silme**
   - API Metodu: `DELETE /products/{productId}/reviews/{reviewId}`
   - Demo: Kullanıcının kendi yorumunu silmesi

---

#### Dilan Günsili
**Kişisel Tanıtım:**
- İsim: Dilan Günsili
- Rol: Sepet İşlemleri & Yorum Güncelleme/Listeleme

**Gereksinimler:**
1. **Sepete Ürün Ekleme**
   - API Metodu: `POST /cart/items`
   - Demo: Ürünün sepete eklenmesi

2. **Sepetten Ürün Silme**
   - API Metodu: `DELETE /cart/items/{itemId}`
   - Demo: Ürünün sepetten kaldırılması

3. **Sepet Güncelleme**
   - API Metodu: `PUT /cart/items/{itemId}`
   - Demo: Sepetteki ürün miktarının değiştirilmesi

4. **Sepet Listeleme**
   - API Metodu: `GET /cart`
   - Demo: Sepetteki tüm ürünlerin listelenmesi

5. **Yorum Güncelleme**
   - API Metodu: `PUT /products/{productId}/reviews/{reviewId}`
   - Demo: Mevcut yorumun içerik veya puanının güncellenmesi

6. **Yorum Listeleme**
   - API Metodu: `GET /products/{productId}/reviews`
   - Demo: Bir ürüne ait tüm yorumların listelenmesi

---

