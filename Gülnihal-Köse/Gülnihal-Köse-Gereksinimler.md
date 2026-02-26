# Kullanıcı Odaklı Gereksinimler (IKEA Benzeri E-Ticaret Sitesi)

## 1. Üye Olma
- **API Metodu:** `POST /auth/register`
- **Açıklama:** Kullanıcıların siteye kayıt olarak kendi hesaplarını oluşturmalarını sağlar. Bu süreçte kullanıcılar email ve şifre belirler, gerekli kişisel bilgilerini girer. Sistem, bilgileri güvenli bir şekilde saklar ve kullanıcıya kayıt onayı gönderir. Bu adım, kişiselleştirilmiş alışveriş deneyimi ve sipariş takibi için temel bir gerekliliktir.

## 2. Giriş Yapma
- **API Metodu:** `POST /auth/login`
- **Açıklama:** Mevcut kullanıcılar email ve şifre ile sisteme giriş yapabilir. Başarılı giriş sonrası kullanıcıya özel içerikler, kategori filtreleme ve önceki sipariş bilgileri gibi kişiselleştirilmiş deneyimler aktif hale gelir. Bu işlem, kullanıcı güvenliğini sağlamak ve hesap erişimini kontrol etmek açısından kritiktir.

## 3. Profil Görüntüleme
- **API Metodu:** `GET /users/{userId}`
- **Açıklama:** Kullanıcılar kendi profil bilgilerini görüntüleyebilir. Bu bilgiler arasında ad, soyad, email, telefon ve hesap durumu gibi kritik veriler bulunur. Kullanıcı, profil sayfasından kendi bilgilerini görebilir ve geçmiş işlemleri inceleyebilir. Bu özellik, kullanıcıya hesap üzerinde tam kontrol ve şeffaflık sağlar.

## 4. Profil Güncelleme
- **API Metodu:** `PUT /users/{userId}`
- **Açıklama:** Kullanıcılar kendi hesap bilgilerini güncelleyebilir. Ad, soyad, email, telefon veya diğer iletişim bilgilerini değiştirebilir. Sistem, yalnızca giriş yapmış kullanıcının kendi bilgilerini güncellemesine izin verir. Bu özellik, kullanıcıların bilgilerinin güncel kalmasını ve hatalı/verimsiz verilerin önlenmesini sağlar.

## 5. Hesap Silme
- **API Metodu:** `DELETE /users/{userId}`
- **Açıklama:** Kullanıcılar, hesaplarını kalıcı olarak sistemden silebilir. Bu işlem geri alınamaz; tüm kişisel veriler, kayıtlar ve filtre tercihleri sistemden tamamen kaldırılır. Kullanıcı hesabını kapatmak istediğinde veya güvenlik gerekçesiyle silme işlemi yapılması gerektiğinde kullanılır. Bu adım, kullanıcıya veri kontrolü ve gizlilik hakkı sağlar.

## 6. Kategori Seçme (Filtreleme)
- **API Metodu:** `POST /users/{userId}/preferences/categories`
- **Açıklama:** Kullanıcılar ürünleri görüntülerken ilgi duydukları kategorileri seçebilir. Örnek filtreler: **Oturma Odası, Yatak Odası, Mutfak, Ofis, Depolama, Aksesuar**. Seçilen kategoriler, ürün listelemelerinde kişiselleştirilmiş bir deneyim sunar ve kullanıcıya hızlı, hedefe yönelik alışveriş imkânı sağlar.

## 7. Kategori Silme (Filtreyi Kaldırma)
- **API Metodu:** `DELETE /users/{userId}/preferences/categories/{categoryId}`
- **Açıklama:** Kullanıcılar, daha önce seçtikleri kategori filtrelerini kaldırabilir. Örneğin artık “Mutfak” ürünlerini görmek istemiyorsa bu filtreyi silebilir. Sistem, filtre kaldırma işlemi sonrası ürün listelerini otomatik olarak günceller. Bu özellik, kullanıcıya esnek ve kişiselleştirilebilir bir alışveriş deneyimi sunar.