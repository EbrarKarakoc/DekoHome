## 1. Sipariş Oluşturma
* API Metodu: `POST /orders`
* Açıklama: Kullanıcının aktif sepetinde bulunan ürünleri onaylayarak yeni bir sipariş oluşturmasını sağlar. Bu işlem sırasında teslimat adresi, ödeme yöntemi, sipariş kalemleri (ürün, adet, birim fiyat), toplam tutar ve sipariş tarihi veritabanına kaydedilir. Sipariş başarıyla oluşturulduğunda ilgili ürünlerin stok miktarı otomatik olarak düşürülür. Stok yetersizliği durumunda işlem gerçekleştirilmez ve uygun hata mesajı döndürülür. Güvenlik amacıyla yalnızca giriş yapmış kullanıcılar sipariş oluşturabilir.

---

## 2. Sipariş İptali
* API Metodu: `DELETE /orders/{orderId}`
* Açıklama: Kullanıcının mevcut bir siparişini iptal etmesini sağlar. İptal işlemi yalnızca sipariş durumu “onaylandı” veya “hazırlanıyor” aşamasındaysa gerçekleştirilebilir. Kargoya verilmiş veya teslim edilmiş siparişler iptal edilemez. İptal edilen siparişe ait ürünlerin stok miktarı sistem tarafından otomatik olarak geri artırılır. İşlem yalnızca siparişi oluşturan kullanıcı veya yönetici tarafından yapılabilir.

---

## 3. Sipariş Güncelleme
* API Metodu: `PUT /orders/{orderId}`
* Açıklama: Mevcut bir siparişe ait belirli bilgilerin güncellenmesini sağlar. Kullanıcılar yalnızca sipariş kargoya verilmeden önce teslimat adresini güncelleyebilir. Yöneticiler ise sipariş durumunu (onaylandı, hazırlanıyor, kargoya verildi, teslim edildi, iptal edildi) değiştirebilir. Güncelleme işlemi sırasında siparişin mevcut durumu kontrol edilir ve yetki doğrulaması yapılır.

---

## 4.Sipariş Listeleme
* API Metodu: `GET /orders`
* Açıklama: Kullanıcının geçmiş ve aktif siparişlerini listelemesini sağlar. Her sipariş için sipariş numarası, ürün detayları, toplam tutar, sipariş tarihi ve güncel durum bilgisi görüntülenir. Varsayılan olarak kullanıcı yalnızca kendi siparişlerini görebilir. Yönetici rolüne sahip kullanıcılar ise tüm kullanıcıların siparişlerini listeleyebilir. Güvenlik için kimlik doğrulaması gereklidir.

---

## 5.Yorum Ekleme
* API Metodu: `POST /reviews`
* Açıklama: Kullanıcının satın aldığı bir ürün için yorum (puan ve metin) eklemesini sağlar. Yorum ekleme işlemi için kullanıcının giriş yapmış olması gerekir. Sistem, kullanıcının ilgili ürünü gerçekten satın alıp almadığını kontrol edebilir (opsiyonel kural). Eklenen yorum ürün detay sayfasında görüntülenir ve ürünün ortalama puanı güncellenebilir.

---

## 6.Yorum Silme
* API Metodu: `DELETE /reviews/{reviewId}`
* Açıklama: Kullanıcının eklediği bir yorumu silmesini sağlar. Yalnızca yorumu yazan kullanıcı kendi yorumunu silebilir; yöneticiler gerekli durumlarda tüm yorumları kaldırabilir. Silme işlemi sonrası yorum listesi güncellenir ve ürünün ortalama puanı tekrar hesaplanabilir.