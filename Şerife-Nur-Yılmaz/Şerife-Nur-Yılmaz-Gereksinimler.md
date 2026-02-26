# 🛠️ Şerife Nur Yılmaz | Detaylı Gereksinim Analizi

Bu doküman, **DekoHome by Meyran** projesi kapsamında Şerife Nur Yılmaz tarafından üstlenilen kategori yönetimi, ürün operasyonları ve vitrin bileşenlerinin kapsamlı teknik analizini içermektedir.

---

### 📂 Kategori İşlemleri (Category Operations)

#### 📋 1. Kategori Güncelleme
* **API Metodu**: `PUT /categories/{categoryId}`
* **Gereksinim Özeti**: Mevcut bir kategorinin sistem üzerindeki tanımlayıcı bilgilerinin revize edilmesini sağlar.
* **Detaylı Açıklama**: Admin paneli aracılığıyla bir kategorinin ismi, açıklaması veya hiyerarşik yapısı (üst kategori bilgisi) değiştirilebilir. Bu işlem, mağaza yapısında yapılan köklü değişikliklerin sisteme yansıtılması için kritiktir. Güncelleme onaylandığı anda ilgili kategorinin tüm metadata bilgileri veritabanında güncellenerek kullanıcı arayüzüne anlık olarak yansıtılır.
* **Yetki**: Veri bütünlüğünü korumak adına yalnızca **Admin** tarafından gerçekleştirilebilir.

#### 📋 2. Kategori Listeleme
* **API Metodu**: `GET /categories`
* **Gereksinim Özeti**: Sistemde tanımlı tüm kategorilerin hiyerarşik bir düzende getirilmesini sağlar.
* **Detaylı Açıklama**: Mağazadaki ana kategoriler ve onlara bağlı alt kategoriler düzenli bir ağaç yapısında listelenir. Bu veriler, hem web hem de mobil platformlarda kullanıcıların ürünlere ulaşmasını sağlayan navigasyon menülerinin dinamik olarak oluşturulması için temel kaynaktır.
* **Yetki**: **Tüm kullanıcılar** (misafir veya kayıtlı) tarafından erişilebilir.

---

### 📦 Ürün ve Vitrin İşlemleri (Product & Showcase)

#### 📋 3. Ürün Ekleme
* **API Metodu**: `POST /products`
* **Gereksinim Özeti**: Sisteme yeni mobilya veya dekorasyon ürünlerinin dahil edilmesini sağlar.
* **Detaylı Açıklama**: Yeni bir ürünün adı, detaylı açıklaması, satış fiyatı, güncel stok miktarı, bağlı olduğu kategori ve görsel materyalleri bu fonksiyon aracılığıyla veritabanına kaydedilir. Mağaza envanterinin genişletilmesi ve yeni koleksiyonların satışa sunulması bu modül üzerinden yönetilir.
* **Yetki**: Yalnızca **Admin** tarafından gerçekleştirilebilir.

#### 📋 4. Ürün Güncelleme
* **API Metodu**: `PUT /products/{productId}`
* **Gereksinim Özeti**: Mevcut bir ürünün fiyat, stok veya açıklama gibi kritik bilgilerinin güncellenmesini sağlar.
* **Detaylı Açıklama**: Satıştaki bir ürünün fiyatında yapılan değişiklikler, stok miktarındaki güncellemeler veya ürün açıklamasındaki teknik detay revizeleri bu işlemle gerçekleştirilir. Yapılan değişiklikler ürün sayfasında anında yayınlanarak müşterilerin doğru bilgiye ulaşması sağlanır.
* **Yetki**: Yalnızca **Admin** tarafından gerçekleştirilebilir.

#### 📋 5. Ürün Listeleme
* **API Metodu**: `GET /products`
* **Gereksinim Özeti**: Sistemde kayıtlı olan tüm ürün kataloğunun listelenmesini sağlar.
* **Detaylı Açıklama**: Envanterdeki ürünlerin genel bir liste halinde kullanıcıya sunulmasıdır. Performans optimizasyonu için sayfalama (pagination) desteği barındırır; böylece web ve mobil uygulamalarda veriler hızlı ve akıcı bir şekilde yüklenir. Kullanıcının mağaza genelindeki ürünleri keşfetmesini sağlayan temel modüldür.
* **Yetki**: **Tüm kullanıcılar** tarafından erişilebilir.

#### 📋 6. Slayt Görüntüleme
* **API Metodu**: `GET /sliders`
* **Gereksinim Özeti**: Ana sayfada sergilenecek olan promosyon ve kampanya banner'larının listelenmesini sağlar.
* **Detaylı Açıklama**: Dinamik banner yapısı sayesinde her slayt için özel başlık, görsel, yönlendirme bağlantısı ve gösterim sırası bilgileri sunulur. Bu sayede hem web hem de mobil uygulamaların ana ekranında güncel kampanyalar ve öne çıkan fırsatlar dinamik olarak gösterilebilir.
* **Yetki**: **Tüm kullanıcılar** tarafından erişilebilir.